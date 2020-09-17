
import { Vec2, v2 } from "math";
import { Mesh } from "./";

const POSITIONS: [number, number][] = [
    [-1, -1],
    [-1, 1],
    [1, 1],
    [1, -1],
];
const UVS: [number, number][] = [
    [0.0, 1.0],
    [0.0, 0.0],
    [1.0, 0.0],
    [1.0, 1.0],
];
const MID_POSITIONS: [number, number][] = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1]
];
const FACES: [number, number, number][] = [
    [0, 1, 2],
    [2, 3, 0]
];
const POINTS: number[] = [
    0, 1, 2, 3, 4, 5, 6, 7
];
const LINES: number[] = [
    0, 1, 1, 2, 2, 3, 3, 0
];

export function Solid(): Mesh {
    return {
        vertices: new Float32Array(POSITIONS.flat(1)),
        indices: new Int32Array(FACES.flat(1))
    }
}
export function Textured(): Mesh {
    // interleave positions and uvs
    const vertices = [];
    for (let i = 0, len = POSITIONS.length; i < len; ++i) {
        vertices.push(POSITIONS[i], UVS[i]);
    }

    return {
        vertices: new Float32Array(vertices.flat(1)),
        indices: new Int32Array(FACES.flat(1))
    }
}
export function Points(): Mesh {
    return {
        vertices: new Float32Array(new Array<number>().concat(POSITIONS.flat(1), MID_POSITIONS.flat(1))),
        indices: new Int32Array(POINTS)
    }
}
export function Lines(): Mesh {
    return {
        vertices: new Float32Array(POSITIONS.flat(1)),
        indices: new Int32Array(LINES)
    }
}
