import { Mat4 } from "math";

export class Vec3 extends Array<number> {

    private constructor(array: [number, number, number]) {
        super(...array);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public toArray(): Array<number> { return [this[0], this[1], this[2]]; }

    public get x(): number { return this[0]; }
    public set x(value: number) { this[0] = value; }
    public get y(): number { return this[1]; }
    public set y(value: number) { this[1] = value; }
    public get z(): number { return this[2]; }
    public set z(value: number) { this[2] = value; }

    /**
     * 
     * @param {[number,number,number]} array array of length 3
     * @returns {Vec3} resulting vector
     */
    public static create(array?: [number, number, number]): Vec3 {
        return new Vec3(array || [0, 0, 0]);
    }

    /**
     * Creates a new vector from an existing one
     * @returns {Vec3} new vector
     */
    public clone(): Vec3 {
        return Vec3.create([this[0], this[1], this[2]]);
    }

    /**
     * Copies the values of one vector to another
     * @param {Vec3} out receiving vector
     */
    public copy(out: Vec3) {
        out[0] = this[0];
        out[1] = this[1];
        out[2] = this[2];
    }

    /**
     * @returns {number} length of the vector
     */
    public len(): number {
        return Math.hypot(...this);
    }

    /**
     * Adds other vector to the receiving vector
     * @this {this} first operand
     * @param {Vec3} that second operand
     */
    public add(that: Vec3): this {
        this[0] = this[0] + that[0];
        this[1] = this[1] + that[1];
        this[2] = this[2] + that[2];

        return this;
    }

    /**
     * Subtracts other vector from the receiving vector
     * @this {this} first operand
     * @param {Vec3} that second operand
     */
    public sub(that: Vec3): this {
        this[0] = this[0] - that[0];
        this[1] = this[1] - that[1];
        this[2] = this[2] - that[2];

        return this;
    }

    /**
     * Multiples receiving vector by the other vector
     * @this {this} first operand
     * @param {Vec3} that second operand
     */
    public mult(that: Vec3): this {
        this[0] = this[0] * that[0];
        this[1] = this[1] * that[1];
        this[2] = this[2] * that[2];

        return this;
    }

    /**
     * Divides receiving vector by the other vector
     * @this {this} first operand
     * @param {Vec3} that second operand
     */
    public div(that: Vec3): this {
        if (that[0] === 0) throw new Error("Second operand has component 0!");
        if (that[1] === 0) throw new Error("Second operand has component 0!");
        if (that[2] === 0) throw new Error("Second operand has component 0!");
        this[0] = this[0] / that[0];
        this[1] = this[1] / that[1];
        this[2] = this[2] / that[2];

        return this;
    }

    /**
     * Applies Math.ceil to all components of the receiving vector
     * @this {this} vector to apply operation to
     */
    public ceil(): this {
        this[0] = Math.ceil(this[0]);
        this[1] = Math.ceil(this[1]);
        this[2] = Math.ceil(this[2]);

        return this;
    }

    /**
     * Applies Math.floor to all components of the receiving vector
     * @this {this} vector to apply operation to
     */
    public floor(): this {
        this[0] = Math.floor(this[0]);
        this[1] = Math.floor(this[1]);
        this[2] = Math.floor(this[2]);

        return this;
    }

    /**
     * Returns the length-wise min of two vectors
     * @param {Vec3} a first vector
     * @param {Vec3} b second vector
     */
    public static min(a: Vec3, b: Vec3): Vec3 {
        return (a.len() < b.len()) ? a : b;
    }

    /**
     * Returns the length-wise max of two vectors
     * @param {Vec3} a first vector
     * @param {Vec3} b second vector
     */
    public static max(a: Vec3, b: Vec3): Vec3 {
        return (a.len() > b.len()) ? a : b;
    }

    /**
     * Takes the min of each component of two vectors, creating a new vector
     * @param {Vec3} a first vector
     * @param {Vec3} b second vector
     */
    public static minc(a: Vec3, b: Vec3): Vec3 {
        const out = Vec3.create();
        out[0] = Math.min(a[0], b[0]);
        out[1] = Math.min(a[1], b[1]);
        out[2] = Math.min(a[2], b[2]);
        return out;
    }

    /**
     * Takes the max of each component of two vectors, creating a new vector
     * @param {Vec3} a first vector
     * @param {Vec3} b second vector
     */
    public static maxc(a: Vec3, b: Vec3): Vec3 {
        const out = Vec3.create();
        out[0] = Math.max(a[0], b[0]);
        out[1] = Math.max(a[1], b[1]);
        out[2] = Math.max(a[2], b[2]);
        return out;
    }

    /**
     * Scales receiving vector by some amount
     * @param {number} amount the amount to scale by
     */
    public scale(amount: number): this {
        this[0] = this[0] * amount;
        this[1] = this[1] * amount;
        this[2] = this[2] * amount;

        return this;
    }

    public transform(matrix: Mat4) {
        const x = this[0], y = this[1], z = this[2];

        let w = matrix[3] * x + matrix[7] * y + matrix[11] * z + matrix[15];
        w = w || 1.0;
        this[0] = (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) / w;
        this[1] = (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) / w;
        this[2] = (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]) / w;

        return this;
    }

    /**
     * Calculate the distance between two vectors
     * @param that 
     * @returns {number} distance
     */
    public dist(that: Vec3): number {
        const x = that[0] - this[0];
        const y = that[1] - this[1];
        const z = that[2] - this[2];
        return Math.hypot(x, y, z);
    }

    /**
     * Component-wise negation of the receiving vector
     */
    public negate(): this {
        this[0] = -this[0];
        this[1] = -this[1];
        this[2] = -this[2];

        return this;
    }

    /**
     * Component-wise inversion of the receiving vector
     */
    public inverse(): this {
        this[0] = 1.0 / this[0];
        this[1] = 1.0 / this[1];
        this[2] = 1.0 / this[2];

        return this;
    }

    /**
     * Normalize the receiving vector
     */
    public normalize(): this {
        const x = this[0];
        const y = this[1];
        const z = this[2];
        let len = x * x + y * y + z * z;

        if (len > 0) len = 1 / Math.sqrt(len);

        this[0] = this[0] * len;
        this[1] = this[1] * len;
        this[2] = this[2] * len;

        return this;
    }

    /**
     * Calculate the dot product of two vectors
     * @this {this} first operand
     * @param {Vec3} that second operand
     */
    public dot(that: Vec3): number {
        return this[0] * that[0] + this[1] * that[1] + this[2] * that[2]
    }

    /**
     * Calculate the cross product of two vectors
     * @this {this} first operand
     * @param {Vec3} that second operand
     * @returns {Vec3} resulting vector
     */
    public cross(that: Vec3): Vec3 {
        const ax = this[0], ay = this[1], az = this[2];
        const bx = that[0], by = that[1], bz = that[2];
        const out = Vec3.create();
        out[0] = ay * bz - az * by;
        out[1] = az * bx - ax * bz;
        out[2] = ax * by - ay * bx;
        return out;
    }

    /**
     * Linearly interpolate between two vectors, resulting in a new vector
     * @param {Vec3} a first operand
     * @param {Vec3} b second operand
     * @param {number} weight number in range 0~1
     * @returns {Vec3} resulting vector
     */
    public static lerp(a: Vec3, b: Vec3, weight: number): Vec3 {
        const ax = a[0];
        const ay = a[1];
        const az = a[2];

        const out = Vec3.create();
        out[0] = ax + weight * (b[0] - ax);
        out[1] = ay + weight * (b[1] - ay);
        out[2] = az + weight * (b[2] - az);
        return out;
    }

    /**
     * Generates a random vector of max length scale  
     * Returns a unit vector if no scale is given
     * @param {number} scale amount to scale final vector
     * @returns {Vec3} resulting vector
     */
    public static random(scale = 1.0): Vec3 {
        const r = Math.random() * 2.0 * Math.PI;
        const z = Math.random() * 2.0 - 1.0;
        const zScale = Math.sqrt(1.0 - z * z) * scale;

        const out = Vec3.create();
        out[0] = Math.cos(r) * zScale;
        out[1] = Math.sin(r) * zScale;
        out[2] = z * scale;
        return out;
    }

    /**
     * Sets all components of the receiving vector to 0
     */
    public zero(): this {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;

        return this;
    }

    /**
     * Checks for strict equality between two vectors
     * @this {this} first operand
     * @param {Vec3} that second operand
     */
    public equals(that: Vec3): boolean {
        return this[0] === that[0] && this[1] === that[1] && this[2] === that[2];
    }

    public abs(): this {
        this[0] = Math.abs(this[0]);
        this[1] = Math.abs(this[1]);
        this[2] = Math.abs(this[2]);
        return this;
    }

    public nearlyEquals(that: Vec3, epsilon: number): boolean {
        const d = this.sub(that).abs();
        return d.x < epsilon && d.y < epsilon && d.z < epsilon;
    }

    toString(): string {
        return `Vec(x: ${this[0]}, y: ${this[1]}, z: ${this[2]})`;
    }
}

//@ts-ignore
window.Vec3 = Vec3;
