
import { Vec2, v2 } from "math";

export function computeNormals(polygon: Vec2[]): Vec2[] {
    if (polygon.length < 2) throw new Error(`Normal computation requires at least 2 points`);
    const normals = [];
    for (let i1 = 0; i1 < polygon.length; i1++) {
        const i2 = (i1 + 1) % polygon.length;

        const p1 = polygon[i1];
        const p2 = polygon[i2];

        normals.push(p2.clone().sub(p1).normalize().perp());
    }
    return normals;
}

export function computeMidpoint(a: Vec2, b: Vec2): Vec2 {
    return v2(
        a[0] + (b[0] - a[0]) * 0.5,
        a[1] + (b[1] - a[1]) * 0.5,
    );
}

export function computeCentroid(polygon: Vec2[]): Vec2 {
    // https://stackoverflow.com/a/2792464/11953579
    const CG = v2();
    let Areasum2 = 0;
    for (let i = 1; i < polygon.length - 1; ++i) {
        const p1 = polygon[0], p2 = polygon[i], p3 = polygon[i + 1];
        const Cent3 = v2(p1[0] + p2[0] + p3[0], p1[1] + p2[1] + p3[1])
        const A2 = (p2[0] - p1[0]) * (p3[1] - p1[1]) - (p3[0] - p1[0]) * (p2[1] - p1[1]);
        CG[0] += A2 * Cent3[0];
        CG[1] += A2 * Cent3[1];
        Areasum2 += A2;
    }
    CG[0] /= 3 * Areasum2;
    CG[1] /= 3 * Areasum2;
    return CG;
}

export function isConvex(polygon: Vec2[]): boolean {
    // https://stackoverflow.com/a/45372025/11953579
    let [old_x, old_y] = polygon[polygon.length - 2];
    let [new_x, new_y] = polygon[polygon.length - 1];
    let new_direction = Math.atan2(new_y - old_y, new_x - old_x);
    let angle_sum = 0.0;
    let orientation = 0;
    for (let ndx = 0; ndx < polygon.length; ++ndx) {
        const old_direction = new_direction; old_x = new_x, old_y = new_y;
        new_x = polygon[ndx][0]; new_y = polygon[ndx][1];
        new_direction = Math.atan2(new_y - old_y, new_x - old_x)
        if (old_x == new_x && old_y == new_y) return false;
        let angle = new_direction - old_direction;
        if (angle <= -Math.PI) angle += Math.PI * 2;
        else if (angle > Math.PI) angle -= Math.PI * 2;
        if (ndx === 0) {
            if (angle === 0.0) return false;
            orientation = angle > 0.0 ? 1.0 : -1.0;
        } else {
            if (orientation * angle <= 0.0) return false;
        }
        angle_sum += angle;
    }
    return Math.abs(Math.round(angle_sum / (Math.PI * 2))) === 1
}