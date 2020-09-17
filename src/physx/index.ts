
import { Mutable } from "common";
import { m3, Mat3, v2, Vec2 } from "math";
import { isConvex, computeMidpoint, computeCentroid, computeNormals } from "./util";

/*

Shapes: Polygon, AABB, Line, Circle, Point

Polygon, AABB, Circle -> should all return MTV
Point, Line -> Only returns true/false

✅ Polygon  -> Polygon
✅ Polygon  -> AABB
✅ Polygon  -> Line
✅ Polygon  -> Circle
✅ Polygon  -> Point
✅ AABB     -> Polygon    (duplicate)
✅ AABB     -> AABB
✅ AABB     -> Line
✅ AABB     -> Circle
✅ AABB     -> Point
✅ Line     -> Polygon    (duplicate)
✅ Line     -> AABB       (duplicate)
✅ Line     -> Line
✅ Line     -> Circle
✅ Line     -> Point
✅ Circle   -> Polygon    (duplicate)
✅ Circle   -> AABB       (duplicate)
✅ Circle   -> Line       (duplicate)
✅ Circle   -> Circle
✅ Circle   -> Point
✅ Point    -> Polygon    (duplicate)
✅ Point    -> AABB       (duplicate)
✅ Point    -> Line       (duplicate)
✅ Point    -> Circle     (duplicate)
✅ Point    -> Point

*/

//  TODO: refactor the code to use less random function calls and allocations everywhere
//  e.g.: 
//      - x/y properties are getter functions, which is an extra function call each time they're accessed
//      - constructing an object just to throw it away moments later means:
//          1. a heap allocation
//          2. a function call (constructor)
//          3. more allocations when properties are allocated in the constructor (objects, arrays)
//          4. just way too many cycles spent on something that is a glorified function call for
//             calculating something very specific for a one-time use.
//  TODO: document the library better

export class Point extends Vec2 {
    readonly type: "point" = "point";

    get center(): Vec2 { return this; }
    moveTo(value: Vec2) {
        this[0] = value[0];
        this[1] = value[1];
    }
    translate(value: Vec2) {
        this.add(value);
    }
    static from(that: Vec2 | Point): Point {
        return new Point(that[0], that[1]);
    }
}

export class Circle {
    readonly type: "circle" = "circle";

    constructor(
        private center_: Vec2,
        private radius_: number
    ) {
        if (this.radius_ <= 0) throw new Error(`Circle with radius <= 0 is invalid`);
    }

    public get center(): Vec2 {
        return this.center_;
    }

    public get radius(): number {
        return this.radius_;
    }

    public moveTo(value: Vec2) {
        this.center_ = value;
    }

    public translate(value: Vec2) {
        this.center_.add(value);
    }
}

export class Line {
    readonly type: "line" = "line";

    private center_: Vec2;
    private length_: number;
    private dirty_ = false;

    constructor(
        private p0_: Vec2,
        private p1_: Vec2
    ) {
        this.center_ = computeMidpoint(this.p0_, this.p1_);
        this.length_ = p0_.dist(p1_);
    }

    public get p0(): Vec2 {
        if (this.dirty_) this.update();
        return this.p0_;
    }

    public get p1(): Vec2 {
        if (this.dirty_) this.update();
        return this.p1_;
    }

    public get center(): Vec2 {
        if (this.dirty_) this.update();
        return this.center_;
    }

    public get length(): number {
        if (this.dirty_) this.update();
        return this.length_;
    }

    public moveTo(value: Vec2) {
        const delta = value.sub(this.center);
        this.translate(delta);
    }

    public translate(value: Vec2) {
        this.p0_.add(value);
        this.p1_.add(value);
        this.dirty_ = true;
    }

    public rotate(value: number, pivot: Vec2) {
        const matrix = m3().translate(pivot).rotate(value).translate(pivot.negate());
        this.p0_.transform(matrix);
        this.p1_.transform(matrix);
        this.dirty_ = true;
    }

    public scale(value: Vec2) {
        const matrix = m3().scale(value);
        this.p0_.transform(matrix);
        this.p1_.transform(matrix);
        this.dirty_ = true;
    }

    private update() {
        this.center_ = computeMidpoint(this.p0_, this.p1_);
        this.dirty_ = false;
    }
}

function computeAABBPoints(center: Vec2, half: Vec2): Vec2[] {
    const minX = center[0] - half[0];
    const maxX = center[0] + half[0];
    const minY = center[1] - half[1];
    const maxY = center[1] + half[1];
    return [
        v2(minX, minY),
        v2(maxX, minY),
        v2(maxX, maxY),
        v2(minX, maxY),
    ];
}

export class AABB {
    readonly type: "aabb" = "aabb";

    private points_: Vec2[];
    private dirty_ = false;

    constructor(
        private center_: Vec2,
        private half_: Vec2
    ) {
        this.points_ = computeAABBPoints(this.center_, this.half_);
    }

    public get points(): Vec2[] {
        if (this.dirty_) this.update();
        return this.points_;
    }

    public get center(): Vec2 {
        if (this.dirty_) this.update();
        return this.center_;
    }

    public get half(): Vec2 {
        if (this.dirty_) this.update();
        return this.half_;
    }

    public get top(): number {
        if (this.dirty_) this.update();
        return this.center_[1] - this.half_[1];
    }

    public get bottom(): number {
        if (this.dirty_) this.update();
        return this.center_[1] + this.half_[1];
    }

    public get left(): number {
        if (this.dirty_) this.update();
        return this.center_[0] - this.half_[0];
    }

    public get right(): number {
        if (this.dirty_) this.update();
        return this.center_[0] + this.half_[0];
    }

    public moveTo(value: Vec2) {
        this.center_ = value;
        this.dirty_ = true;
    }

    public translate(value: Vec2) {
        this.center_.add(value);
        this.dirty_ = true;
    }

    public scale(value: Vec2) {
        this.half.add(value);
        this.dirty_ = true;
    }

    private update() {
        this.points_ = computeAABBPoints(this.center_, this.half_);
        this.dirty_ = false;
    }
}

export class Polygon {
    readonly type: "polygon" = "polygon";

    private points_: Vec2[];
    private normals_: Vec2[];
    private center_: Vec2;

    private position_: Vec2;
    private scale_: Vec2;
    private rotation_: number;
    private matrix_: Mat3;

    constructor(
        points: Vec2[]
    ) {
        if (points.length < 3) throw new Error(`Polygon must have at least 3 vertices!`);
        if (!isConvex(points)) throw new Error(`Polygon must be convex!`);

        this.points_ = points;
        this.normals_ = computeNormals(this.points_);
        this.center_ = computeCentroid(this.points_);

        let furthestX = 0, furthestY = 0;
        for (const point of this.points_) {
            if (Math.abs(point.x) > furthestX) {
                furthestX = Math.abs(point.x);
            }
            if (Math.abs(point.y) > furthestY) {
                furthestY = Math.abs(point.y);
            }
        }

        this.position_ = v2();
        this.scale_ = v2(furthestX, furthestY);
        this.rotation_ = 0;
        this.matrix_ = m3().translateThis(this.position_)
            .rotateThis(this.rotation_)
            .scaleThis(this.scale_);
    }

    /**
     * A **copy** of the polygon's points
     */
    get points(): Vec2[] {
        const points = new Array<Vec2>(this.points_.length);
        for (let i = 0, len = this.points_.length; i < len; ++i) {
            points[i] = this.points_[i].clone();
        }
        return points;
    }

    get length(): number {
        return this.points_.length;
    }

    movePoint(index: number, value: Vec2) {
        this.points_[index].x = value.x;
        this.points_[index].y = value.y;
        this.recalculateBounds();
    }

    /**
     * Equivalent to `Array.splice(index, 0, point)`.
     */
    addPoint(index: number, point: Vec2): void {
        this.points_.splice(index, 0, point);
        this.recalculateBounds();
    }

    /**
     * Equivalent to `Array.splice(index, 1)`.
     */
    removePoint(index: number): void {
        this.points_.splice(index, 1);
        this.recalculateBounds();
    }

    get center(): Vec2 {
        return this.center_;
    }

    get normals(): readonly Vec2[] {
        return this.normals_;
    }

    get position(): Vec2 {
        return this.position_;
    }
    set position(value: Vec2) {
        this.position_ = value;
        this.recalculatePoints();
    }

    get scale(): Vec2 {
        return this.scale_;
    }
    set scale(value: Vec2) {
        if (value.x < 2) value.x = 2;
        if (value.y < 2) value.y = 2;
        this.scale_ = value;
        this.recalculatePoints();
    }

    get rotation(): number {
        return this.rotation_;
    }
    set rotation(value: number) {
        this.rotation_ = value;
        this.recalculatePoints();
    }

    get matrix(): Mat3 {
        return this.matrix_;
    }

    private recalculateBounds() {
        // TODO: mess with this to encapsulate the shape better
        const inverse = this.matrix_.invert();
        const matrix = m3().scaleThis(this.scale_);

        const farthest = v2();
        for (let i = 0, len = this.points_.length; i < len; ++i) {
            const point = this.points_[i].clone().transform(inverse).transform(matrix);
            if (Math.abs(point.x) > farthest.x) {
                farthest.x = Math.abs(point.x);
            }
            if (Math.abs(point.y) > farthest.y) {
                farthest.y = Math.abs(point.y);
            }
        }

        this.scale_ = v2(
            farthest.x,
            farthest.y
        );
        this.matrix_ = m3()
            .translateThis(this.position_)
            .rotateThis(this.rotation_)
            .scaleThis(this.scale_);
        this.normals_ = computeNormals(this.points_);
        this.center_ = computeCentroid(this.points_);
    }

    private recalculatePoints() {
        const inverse = this.matrix_.invert();
        this.matrix_ = m3()
            .translate(this.position_)
            .rotate(this.rotation_)
            .scale(this.scale_);
        for (let i = 0, len = this.points_.length; i < len; ++i) {
            this.points_[i].transform(inverse).transform(this.matrix_);
        }
        this.normals_ = computeNormals(this.points_);
        this.center_ = computeCentroid(this.points_);
    }
}

export type Shape = Point | Line | Circle | AABB | Polygon;

// TODO: test
export function polygon_polygon(first: Polygon, second: Polygon): Vec2 | null {
    const a = first.points;
    const b = second.points;
    const polygons = [a, b];

    let MTV = v2(Infinity, Infinity);
    for (let i = 0; i < polygons.length; i++) {
        const polygon = polygons[i];
        for (let i1 = 0; i1 < polygon.length; i1++) {
            const i2 = (i1 + 1) % polygon.length;

            const p1 = polygon[i1];
            const p2 = polygon[i2];

            const normal = p2.clone().sub(p1).normalize().perp();

            let minA!: number;
            let maxA!: number;
            let minB!: number;
            let maxB!: number;
            for (let n = 0; n < a.length; n++) {
                const projected = normal[0] * a[n][0] + normal[1] * a[n][1];
                if (minA === undefined || projected < minA) {
                    minA = projected;
                }
                if (maxA === undefined || projected > maxA) {
                    maxA = projected;
                }
            }
            for (let n = 0; n < b.length; n++) {
                const projected = normal[0] * b[n][0] + normal[1] * b[n][1];
                if (minB === undefined || projected < minB) {
                    minB = projected;
                }
                if (maxB === undefined || projected > maxB) {
                    maxB = projected;
                }
            }

            if ((minA < maxB && maxA > minB) ||
                (minB < maxA && maxB > minA)) {
                const overlap = Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
                const PV = normal.scale(overlap);
                if (PV.len2() < MTV.len2()) {
                    MTV = PV;
                }
                continue;
            }

            return null;
        }
    }

    const direction = first.center.clone().sub(second.center);
    if (MTV.dot(direction) < 0) MTV.negate();

    return MTV;
}
// TODO: test
export function polygon_aabb(first: Polygon, second: AABB): Vec2 | null {
    const second_poly = new Polygon(second.points);
    return polygon_polygon(first, second_poly);
}
// TODO: test
export function aabb_polygon(first: AABB, second: Polygon): Vec2 | null {
    return polygon_aabb(second, first)?.negate() ?? null;
}
// TODO: test
export function polygon_line(first: Polygon, second: Line, epsilon = Math.EPSILON): boolean {
    const points = first.points;
    for (let i1 = 0; i1 < points.length; i1++) {
        const i2 = (i1 + 1) % points.length;

        const edge = new Line(points[i1], points[i2]);
        const hit = line_line(edge, second, epsilon);
        if (hit) return true;
    }
    return false;
}
// TODO: test
export function line_polygon(first: Line, second: Polygon, epsilon = Math.EPSILON): boolean {
    return polygon_line(second, first, epsilon);
}
// TODO: test
export function polygon_circle(first: Polygon, second: Circle): Vec2 | null {
    const polygon = first.points;
    const C = second.center;
    const R = second.radius;

    let MTV = v2(Infinity, Infinity);
    for (let i1 = 0; i1 < polygon.length; i1++) {
        const i2 = (i1 + 1) % polygon.length;

        const p1 = polygon[i1];
        const p2 = polygon[i2];

        const normal = p2.clone().sub(p1).normalize().perp();

        let minA!: number;
        let maxA!: number;
        let minB!: number;
        let maxB!: number;
        // polygon is A
        for (let n = 0; n < polygon.length; n++) {
            const projected = normal[0] * polygon[n][0] + normal[1] * polygon[n][1];
            if (minA === undefined || projected < minA) {
                minA = projected;
            }
            if (maxA === undefined || projected > maxA) {
                maxA = projected;
            }
        }
        // circle is B
        {
            const projected = normal[0] * C[0] + normal[1] * C[1];
            minB = projected - R;
            maxB = projected + R;
        }

        if ((minA < maxB && maxA > minB) ||
            (minB < maxA && maxB > minA)) {
            const overlap = Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
            const PV = normal.scale(overlap);
            if (PV.len2() < MTV.len2()) {
                MTV = PV;
            }
            continue;
        }

        return null;
    }

    const direction = first.center.clone().sub(C);
    if (MTV.dot(direction) < 0) MTV.negate();

    return MTV;
}
// TODO: test
export function circle_polygon(first: Circle, second: Polygon): Vec2 | null {
    return polygon_circle(second, first)?.negate() ?? null;
}
// TODO: test
export function polygon_point(first: Polygon, second: Point): boolean {
    const points = first.points;
    const pX = second[0];
    const pY = second[1];
    let collision = false;

    for (let i1 = 0; i1 < points.length; i1++) {
        const i2 = (i1 + 1) % points.length;
        const A = points[i1];
        const B = points[i2];
        const aX = A[0];
        const aY = A[1];
        const bX = B[0];
        const bY = B[1];
        if (((aY >= pY && bY < pY) || (aY < pY && bY >= pY)) &&
            (pX < (bX - aX) * (pY - aY) / (bY - aY) + aX)) {
            collision = !collision;
        }
    }

    return !!collision;
}
// TODO: test
export function aabb_aabb(first: AABB, second: AABB): Vec2 | null {
    const dx = second.center[0] - first.center[0];
    const px = second.half[0] + first.half[0] - Math.abs(dx);
    const dy = second.center[1] - first.center[1];
    const py = second.half[1] + first.half[1] - Math.abs(dy);
    if (px <= 0 || py <= 0) {
        return null;
    }

    if (px < py) {
        return v2(-px * Math.sign(dx), 0);
    } else {
        return v2(0, -py * Math.sign(dy));
    }
}
// TODO: test
export function aabb_line(first: AABB, second: Line, epsilon = Math.EPSILON): boolean {
    if (!!aabb_point(first, Point.from(second.p0), epsilon) || !!aabb_point(first, Point.from(second.p1), epsilon)) {
        return true;
    }

    const points = first.points;

    for (let i1 = 0; i1 < points.length; ++i1) {
        const i2 = (i1 + 1) % points.length;
        const p1 = points[i1];
        const p2 = points[i2];

        const edge = new Line(p1, p2);
        if (line_line(edge, second, epsilon)) {
            return true;
        }
    }
    return false;
}
// TODO: test
export function line_aabb(first: Line, second: AABB, epsilon = Math.EPSILON): boolean {
    return aabb_line(second, first, epsilon);
}
// TODO: test
export function aabb_circle(first: AABB, second: Circle): Vec2 | null {
    const center = second.center;
    const aabb_half_extents = first.half;
    const aabb_center = first.center;

    const delta = center.clone().sub(aabb_center);
    const closest = Vec2.clampc(delta, aabb_half_extents.clone().negate(), aabb_half_extents.clone()).add(aabb_center);

    const difference = closest.clone().sub(center);
    const R = second.radius;
    const overlap = R - difference.len();
    if (overlap > 0) {
        // TODO: calculate MTV
        const MTV = difference.normalize().scale(overlap);
        return MTV;
    }

    return null;
}
// TODO: test
export function circle_aabb(first: Circle, second: AABB): Vec2 | null {
    return aabb_circle(second, first)?.negate() ?? null;
}
// TODO: test
export function aabb_point(first: AABB, second: Point, epsilon = Math.EPSILON): Vec2 | null {
    return aabb_circle(first, new Circle(second, epsilon));
}
// TODO: test
export function line_line(first: Line, second: Line, epsilon = Math.EPSILON): boolean {
    // http://paulbourke.net/geometry/pointlineplane/pdb.c
    const A = first.p0;
    const B = first.p1;
    const C = second.p0;
    const D = second.p1;

    const denom = ((D[1] - C[1]) * (B[0] - A[0]) - (D[0] - C[0]) * (B[1] - A[1]));
    const denomABS = Math.abs(denom);
    const numerA = ((D[0] - C[0]) * (A[1] - C[1]) - (D[1] - C[1]) * (A[0] - C[0]));
    const numerB = ((B[0] - A[0]) * (A[1] - C[1]) - (B[1] - A[1]) * (A[0] - C[0]));

    // coincident
    if (Math.abs(numerA) < epsilon && Math.abs(numerB) < epsilon && denomABS < epsilon) {
        const delta = v2(B[0] - A[0], B[1] - A[1]).normalize();
        const A_dot = A[0] * delta[0] + A[1] * delta[1];
        const B_dot = B[0] * delta[0] + B[1] * delta[1];
        const C_dot = C[0] * delta[0] + C[1] * delta[1];
        const D_dot = D[0] * delta[0] + D[1] * delta[1];

        const minA = A_dot < B_dot ? A_dot : B_dot;
        const maxA = A_dot > B_dot ? A_dot : B_dot;

        const minB = C_dot < D_dot ? C_dot : D_dot;
        const maxB = C_dot > D_dot ? C_dot : D_dot;

        const overlap = Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
        if (overlap > 0) {
            return true;
        }
        return false;
    }

    // parallel
    if (denomABS < epsilon) {
        return false;
    }

    // intersecting
    const uA = numerA / denom;
    const uB = numerB / denom;
    if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
        //const intersection = v2(
        //    A[0] + uA * (B[0] - A[0]),
        //    A[1] + uA * (B[1] - A[0])
        //);
        return true;
    }
    return false;
}
// TODO: test
export function line_circle(first: Line, second: Circle, epsilon = Math.EPSILON): boolean {
    if (circle_point(second, Point.from(first.p0), epsilon) || circle_point(second, Point.from(first.p1), epsilon)) {
        return true;
    }

    const lineLen = first.length;

    const A = first.p0;
    const B = first.p1;
    const C = second.center;
    const dot = (((C[0] - A[0]) * (B[0] - A[0])) + ((C[1] - A[1]) * (B[1] - A[1]))) / (lineLen * lineLen);

    const closestX = A[0] + (dot * (B[0] - A[0]));
    const closestY = A[1] + (dot * (B[1] - A[1]));

    if (!line_point(first, new Point(closestX, closestY), epsilon)) {
        return false;
    }

    const distX = closestX - C[0];
    const distY = closestY - C[1];
    const distanceSquared = (distX * distX) + (distY * distY);

    const R = second.radius;
    if (distanceSquared < (R * R)) {
        return true;
    }
    return false;
}
// TODO: test
export function line_point(first: Line, second: Point, epsilon = Math.EPSILON): boolean {
    const d1X = second[0] - first.p0[0];
    const d1Y = second[1] - first.p0[1];
    const d1 = Math.sqrt((d1X * d1X) + (d1Y * d1Y));
    const d2X = second[0] - first.p1[0];
    const d2Y = second[1] - first.p1[1];
    const d2 = Math.sqrt((d2X * d2X) + (d2Y * d2Y));
    const lineLen = first.length;

    const d = d1 + d2;
    return d >= lineLen - epsilon && d <= lineLen + epsilon;
}
// TODO: test
export function circle_line(first: Circle, second: Line, epsilon = Math.EPSILON): boolean {
    return line_circle(second, first, epsilon);
}
// TODO: test
export function circle_circle(first: Circle, second: Circle): Vec2 | null {
    const p0 = first.center;
    const p1 = second.center;

    // distance between circle centers
    const deltaX = p1[0] - p0[0];
    const deltaY = p1[1] - p0[1];
    const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);
    const R0 = first.radius;
    const R1 = second.radius;
    const totalRadius = R0 + R1;
    const totalRadiusSquared = totalRadius * totalRadius;

    // no collision
    if (distanceSquared > totalRadiusSquared) {
        return null;
    }

    // some collision occurred
    const distance = Math.sqrt(distanceSquared)
    const overlap = totalRadius - distance;
    const MTV = v2(
        -(deltaX / distance) * overlap,
        -(deltaY / distance) * overlap
    );
    // one circle entirely within the other
    if (distance < Math.abs(R0 - R1)) {
        return MTV;
    }

    // circle edges intersect
    //const a = ((R0 * R0) - (R1 * R1) + (distanceSquared)) / (2 * distance);
    //const p2x = p0[0] + (deltaX * (a / distance));
    //const p2y = p0[1] + (deltaY * (a / distance));
    //const h = Math.sqrt((R0 * R0) - (a * a));
    //const rx = -deltaY * (h / distance);
    //const ry = deltaX * (h / distance);
    //const intersection: [Vec2, Vec2] = [
    //    v2(p2x + rx, p2y + ry),
    //    v2(p2x - rx, p2y - ry),
    //];

    return MTV;
}
// TODO: test
export function circle_point(first: Circle, second: Point, epsilon = Math.EPSILON): Vec2 | null {
    const deltaX = second[0] - first.center[0];
    const deltaY = second[1] - first.center[1];
    const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);
    const totalRadius = first.radius + epsilon;
    const totalRadiusSquared = totalRadius * totalRadius;

    if (distanceSquared < totalRadiusSquared) {
        const distance = Math.sqrt(distanceSquared)
        const overlap = totalRadius - distance;
        const MTV = v2(
            -(deltaX / distance) * overlap,
            -(deltaY / distance) * overlap
        );
        //const intersection = second.clone();
        return MTV;
    }
    return null;
}
// TODO: test
export function point_polygon(first: Point, second: Polygon): boolean {
    return polygon_point(second, first);
}
// TODO: test
export function point_aabb(first: Point, second: AABB, epsilon = Math.EPSILON): Vec2 | null {
    return aabb_point(second, first, epsilon)?.negate() ?? null;
}
// TODO: test
export function point_line(first: Point, second: Line, epsilon = Math.EPSILON): boolean {
    return line_point(second, first, epsilon);
}
// TODO: test
export function point_circle(first: Point, second: Circle, epsilon = Math.EPSILON): Vec2 | null {
    return circle_point(second, first, epsilon)?.negate() ?? null;
}
// TODO: test
export function point_point(first: Point, second: Point, epsilon = Math.EPSILON): boolean {
    const dX = Math.abs(first[0] - second[0]);
    const dY = Math.abs(first[1] - second[1]);
    return dX < epsilon && dY < epsilon;
}

export function intersect(this: any, first: Shape, second: Shape, epsilon = Math.EPSILON): boolean | Vec2 | null {
    return this[`${first.type}_${second.type}`](first, second, epsilon);
}

