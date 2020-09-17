
import "./def.ts";
import { Vec2 } from "./vec2";
import { Vec3 } from "./vec3";
import { Vec4 } from "./vec4";
import { Mat3 } from "./mat3";
import { Mat4 } from "./mat4";
import { Quat } from "./quat";

function v2(x?: number, y?: number) { return Vec2.create([x ?? 0, y ?? 0]); }
function v3(x?: number, y?: number, z?: number) { return Vec3.create([x ?? 0, y ?? 0, z ?? 0]); }
function v4(x?: number, y?: number, z?: number, w?: number) { return Vec4.create([x ?? 0, y ?? 0, z ?? 0, w ?? 0]); }
function m3() { return new Mat3([1, 0, 0, 0, 1, 0, 0, 0, 1]); }
function m4() { return Mat4.identity(); }

// TODO: store vectors as wrappers over pointers to a large typed array
// vectors should be the only thing referencing the underlying typed array

//@ts-ignore
window.v2 = v2; window.v3 = v3; window.v4 = v4; window.m3 = m3; window.m4 = m4;

export {
    Vec2, Vec3, Vec4,
    Mat3, Mat4, Quat,
    v2, v3, v4, m3, m4
}
