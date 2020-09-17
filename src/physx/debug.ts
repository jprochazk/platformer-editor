
import { Vec2, Vec3 } from "math";
import * as Collision from "physx";

export function rgb(r: number, g: number, b: number): string {
    const _r = (Math.clamp(r, 0, 255)).toString(16);
    const _g = (Math.clamp(g, 0, 255)).toString(16);
    const _b = (Math.clamp(b, 0, 255)).toString(16);
    return `#${_r.length === 1 ? "0" : ""}${_r}${_g.length === 1 ? "0" : ""}${_g}${_b.length === 1 ? "0" : ""}${_b}`;
}

export function draw_point(ctx: CanvasRenderingContext2D, point: Vec2, color: Vec3) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = rgb(color.x, color.y, color.z);
    ctx.fill();
}

export function draw_circle(ctx: CanvasRenderingContext2D, circle: Collision.Circle, color: Vec3, fill = true) {
    ctx.beginPath();
    ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
    if (fill) {
        ctx.fillStyle = rgb(color.x, color.y, color.z);
        ctx.fill();
    }
    else {
        ctx.strokeStyle = rgb(color.x, color.y, color.z);
        ctx.stroke();
    }
}

export function draw_line(ctx: CanvasRenderingContext2D, line: Collision.Line, color: Vec3) {
    ctx.beginPath();
    ctx.moveTo(line.p0.x, line.p0.y);
    ctx.lineTo(line.p1.x, line.p1.y);
    ctx.strokeStyle = rgb(color.x, color.y, color.z);
    ctx.stroke();
}

export function draw_aabb(ctx: CanvasRenderingContext2D, aabb: Collision.AABB, color: Vec3, fill = true) {
    ctx.fillStyle = rgb(color.x, color.y, color.z);
    ctx.strokeStyle = rgb(color.x, color.y, color.z);

    const points = aabb.points;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; ++i) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[0].x, points[0].y);
    if (fill) {
        ctx.fill();
    } else {
        ctx.stroke();
    }

    ctx.fillStyle = rgb(color.x, color.y, color.z);
    for (let i = 0; i < points.length; ++i) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(aabb.center.x, aabb.center.y, 2, 0, Math.PI * 2);
    ctx.fill();
}

export function draw_polygon(ctx: CanvasRenderingContext2D, poly: Collision.Polygon, color: Vec3, fill = true) {
    ctx.fillStyle = rgb(color.x, color.y, color.z);
    ctx.strokeStyle = rgb(color.x, color.y, color.z);

    const points = poly.points;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; ++i) {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.lineTo(points[0].x, points[0].y);
    if (fill) {
        ctx.fill();
    } else {
        ctx.stroke();
    }

    const normals = poly.normals;
    for (let i1 = 0; i1 < normals.length; ++i1) {
        const i2 = (i1 + 1) % normals.length;
        const normal = normals[i1];
        const mid = new Collision.Line(points[i1].clone(), points[i2].clone()).center;
        ctx.beginPath();
        ctx.moveTo(mid.x, mid.y);
        ctx.lineTo(mid.x + (normal.x * 20), mid.y + (normal.y * 20));
        ctx.stroke();
    }

    ctx.fillStyle = rgb(color.x, color.y, color.z);
    for (let i = 0; i < points.length; ++i) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(poly.center.x, poly.center.y, 2, 0, Math.PI * 2);
    ctx.fill();
}

export function draw(this: any, ctx: CanvasRenderingContext2D, shape: Collision.Shape, color: Vec3, fill = false) {
    return this[`draw_${shape.type}`](ctx, shape, color, fill);
}