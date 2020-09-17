
import { Vec2 } from "./Vec2";

export class Mat3 extends Array<number> {

    constructor(array: [number, number, number, number, number, number, number, number, number]) {
        super(...array);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public static create(array?: [number, number, number, number, number, number, number, number, number]): Mat3 {
        return new Mat3(array || [1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    public static identity(): Mat3 {
        return new Mat3([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }

    public clone(): Mat3 {
        const out = Mat3.create();
        out[0] = this[0];
        out[1] = this[1];
        out[2] = this[2];
        out[3] = this[3];
        out[4] = this[4];
        out[5] = this[5];
        out[6] = this[6];
        out[7] = this[7];
        out[8] = this[8];
        return out;
    }

    public copy(out: Mat3): void {
        out[0] = this[0];
        out[1] = this[1];
        out[2] = this[2];
        out[3] = this[3];
        out[4] = this[4];
        out[5] = this[5];
        out[6] = this[6];
        out[7] = this[7];
        out[8] = this[8];
    }

    public transpose(): Mat3 {
        const out = Mat3.create();
        out[0] = this[0];
        out[1] = this[3];
        out[2] = this[6];
        out[3] = this[1];
        out[4] = this[4];
        out[5] = this[7];
        out[6] = this[2];
        out[7] = this[5];
        out[8] = this[8];
        return out;
    }

    public invert(): Mat3 {
        const a00 = this[0],
            a01 = this[1],
            a02 = this[2];
        const a10 = this[3],
            a11 = this[4],
            a12 = this[5];
        const a20 = this[6],
            a21 = this[7],
            a22 = this[8];
        const b01 = a22 * a11 - a12 * a21;
        const b11 = -a22 * a10 + a12 * a20;
        const b21 = a21 * a10 - a11 * a20;

        let det = a00 * b01 + a01 * b11 + a02 * b21;

        if (!det) {
            return Mat3.identity();
        }

        det = 1.0 / det;
        const out = Mat3.create();
        out[0] = b01 * det;
        out[1] = (-a22 * a01 + a02 * a21) * det;
        out[2] = (a12 * a01 - a02 * a11) * det;
        out[3] = b11 * det;
        out[4] = (a22 * a00 - a02 * a20) * det;
        out[5] = (-a12 * a00 + a02 * a10) * det;
        out[6] = b21 * det;
        out[7] = (-a21 * a00 + a01 * a20) * det;
        out[8] = (a11 * a00 - a01 * a10) * det;
        return out;
    }

    public adjoint(): Mat3 {
        const a00 = this[0],
            a01 = this[1],
            a02 = this[2];
        const a10 = this[3],
            a11 = this[4],
            a12 = this[5];
        const a20 = this[6],
            a21 = this[7],
            a22 = this[8];

        const out = Mat3.create();
        out[0] = a11 * a22 - a12 * a21;
        out[1] = a02 * a21 - a01 * a22;
        out[2] = a01 * a12 - a02 * a11;
        out[3] = a12 * a20 - a10 * a22;
        out[4] = a00 * a22 - a02 * a20;
        out[5] = a02 * a10 - a00 * a12;
        out[6] = a10 * a21 - a11 * a20;
        out[7] = a01 * a20 - a00 * a21;
        out[8] = a00 * a11 - a01 * a10;
        return out;
    }

    public determinant(): number {
        const a00 = this[0],
            a01 = this[1],
            a02 = this[2];
        const a10 = this[3],
            a11 = this[4],
            a12 = this[5];
        const a20 = this[6],
            a21 = this[7],
            a22 = this[8];

        return a00 * (a22 * a11 - a12 * a21) + a01 * (-a22 * a10 + a12 * a20) + a02 * (a21 * a10 - a11 * a20);
    }

    public multiply(other: Mat3): Mat3 {
        const a00 = this[0],
            a01 = this[1],
            a02 = this[2];
        const a10 = this[3],
            a11 = this[4],
            a12 = this[5];
        const a20 = this[6],
            a21 = this[7],
            a22 = this[8];

        const b00 = other[0],
            b01 = other[1],
            b02 = other[2];
        const b10 = other[3],
            b11 = other[4],
            b12 = other[5];
        const b20 = other[6],
            b21 = other[7],
            b22 = other[8];

        const out = Mat3.create();
        out[0] = b00 * a00 + b01 * a10 + b02 * a20;
        out[1] = b00 * a01 + b01 * a11 + b02 * a21;
        out[2] = b00 * a02 + b01 * a12 + b02 * a22;

        out[3] = b10 * a00 + b11 * a10 + b12 * a20;
        out[4] = b10 * a01 + b11 * a11 + b12 * a21;
        out[5] = b10 * a02 + b11 * a12 + b12 * a22;

        out[6] = b20 * a00 + b21 * a10 + b22 * a20;
        out[7] = b20 * a01 + b21 * a11 + b22 * a21;
        out[8] = b20 * a02 + b21 * a12 + b22 * a22;
        return out;
    }

    public translate(offset: Vec2): Mat3 {
        const a00 = this[0],
            a01 = this[1],
            a02 = this[2],
            a10 = this[3],
            a11 = this[4],
            a12 = this[5],
            a20 = this[6],
            a21 = this[7],
            a22 = this[8],
            x = offset[0],
            y = offset[1];

        const out = Mat3.create();
        out[0] = a00;
        out[1] = a01;
        out[2] = a02;

        out[3] = a10;
        out[4] = a11;
        out[5] = a12;

        out[6] = x * a00 + y * a10 + a20;
        out[7] = x * a01 + y * a11 + a21;
        out[8] = x * a02 + y * a12 + a22;
        return out;
    }

    public translateThis(offset: Vec2): Mat3 {
        const a00 = this[0],
            a01 = this[1],
            a02 = this[2],
            a10 = this[3],
            a11 = this[4],
            a12 = this[5],
            a20 = this[6],
            a21 = this[7],
            a22 = this[8],
            x = offset[0],
            y = offset[1];

        this[6] = x * a00 + y * a10 + a20;
        this[7] = x * a01 + y * a11 + a21;
        this[8] = x * a02 + y * a12 + a22;
        return this;
    }

    public scale(scale: Vec2) {
        const x = scale[0],
            y = scale[1];

        const out = Mat3.create();
        out[0] = x * this[0];
        out[1] = x * this[1];
        out[2] = x * this[2];

        out[3] = y * this[3];
        out[4] = y * this[4];
        out[5] = y * this[5];

        out[6] = this[6];
        out[7] = this[7];
        out[8] = this[8];
        return out;
    }

    public scaleThis(scale: Vec2): Mat3 {
        const x = scale[0],
            y = scale[1];

        this[0] = x * this[0];
        this[1] = x * this[1];
        this[3] = y * this[3];
        this[4] = y * this[4];
        return this;
    }

    public rotate(angle: number): Mat3 {
        const a00 = this[0],
            a01 = this[1],
            a02 = this[2],
            a10 = this[3],
            a11 = this[4],
            a12 = this[5],
            a20 = this[6],
            a21 = this[7],
            a22 = this[8],
            s = Math.sin(angle),
            c = Math.cos(angle);

        const out = Mat3.create();
        out[0] = c * a00 + s * a10;
        out[1] = c * a01 + s * a11;
        out[2] = c * a02 + s * a12;

        out[3] = c * a10 - s * a00;
        out[4] = c * a11 - s * a01;
        out[5] = c * a12 - s * a02;

        out[6] = a20;
        out[7] = a21;
        out[8] = a22;
        return out;
    }

    public rotateThis(angle: number): Mat3 {
        const a00 = this[0],
            a01 = this[1],
            a10 = this[3],
            a11 = this[4],
            s = Math.sin(angle),
            c = Math.cos(angle);

        this[0] = c * a00 + s * a10;
        this[1] = c * a01 + s * a11;
        this[3] = c * a10 - s * a00;
        this[4] = c * a11 - s * a01;

        return this;
    }

    public static projection(width: number, height: number): Mat3 {
        const out = Mat3.create();
        out[0] = 2 / width;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = -2 / height;
        out[5] = 0;
        out[6] = -1;
        out[7] = 1;
        out[8] = 1;
        return out;
    }

    public add(other: Mat3): Mat3 {
        const out = Mat3.create();
        out[0] = other[0] + this[0];
        out[1] = other[1] + this[1];
        out[2] = other[2] + this[2];
        out[3] = other[3] + this[3];
        out[4] = other[4] + this[4];
        out[5] = other[5] + this[5];
        out[6] = other[6] + this[6];
        out[7] = other[7] + this[7];
        out[8] = other[8] + this[8];
        return out;
    }

    public sub(other: Mat3): Mat3 {
        const out = Mat3.create();
        out[0] = this[0] - other[0];
        out[1] = this[1] - other[1];
        out[2] = this[2] - other[2];
        out[3] = this[3] - other[3];
        out[4] = this[4] - other[4];
        out[5] = this[5] - other[5];
        out[6] = this[6] - other[6];
        out[7] = this[7] - other[7];
        out[8] = this[8] - other[8];
        return out;
    }

    public multiplyScalar(scalar: number): Mat3 {
        const out = Mat3.create();
        out[0] = this[0] * scalar;
        out[1] = this[1] * scalar;
        out[2] = this[2] * scalar;
        out[3] = this[3] * scalar;
        out[4] = this[4] * scalar;
        out[5] = this[5] * scalar;
        out[6] = this[6] * scalar;
        out[7] = this[7] * scalar;
        out[8] = this[8] * scalar;
        return out;
    }

    toString(): string {
        let largest = 0;
        for (const n of this) {
            const fixedNum = n.toFixed(3);
            if (fixedNum.toString().length > largest) largest = fixedNum.toString().length;
        }
        const largestLength = largest;

        const pad = (num: number) => {
            const fixedNum = num.toFixed(3);
            const padding = largestLength - fixedNum.toString().length;
            const leftPad = Math.floor(padding / 2);
            const rightPad = Math.ceil(padding / 2);
            return `${" ".repeat(leftPad)}${fixedNum}${" ".repeat(rightPad)}`;
        }

        return `  ${pad(this[0])} ${pad(this[1])} ${pad(this[2])}
[ ${pad(this[3])} ${pad(this[4])} ${pad(this[5])} ]
  ${pad(this[6])} ${pad(this[7])} ${pad(this[8])}
`;
    }
}

//@ts-ignore
window.Mat3 = Mat3;
