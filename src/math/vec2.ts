
import { Vec3 } from "./vec3";
import { Mat3 } from "math";

export class Vec2 extends Array<number> {

    constructor(x = 0, y = 0) {
        super(x, y);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public toArray(): Array<number> { return [this[0], this[1]]; }

    public get x(): number { return this[0]; }
    public set x(value: number) { this[0] = value; }
    public get y(): number { return this[1]; }
    public set y(value: number) { this[1] = value; }
    public get u(): number { return this[0]; }
    public set u(value: number) { this[0] = value; }
    public get v(): number { return this[1]; }
    public set v(value: number) { this[1] = value; }

    /**
     * 
     * @param {[number,number,number]} array array of length 3
     * @returns {Vec2} resulting vector
     */
    public static create(array: [number, number] = [0, 0]): Vec2 {
        return new Vec2(array[0], array[1]);
    }

    /**
     * Creates a new vector from an existing one
     * @returns {Vec2} new vector
     */
    public clone(): Vec2 {
        return Vec2.create([this[0], this[1]]);
    }

    /**
     * Copies the values of one vector to another
     * @param {Vec2} out receiving vector
     */
    public copy(out: Vec2) {
        out[0] = this[0];
        out[1] = this[1];
    }

    /**
     * @returns {number} length of the vector
     */
    public len(): number {
        return Math.hypot(...this);
    }

    public len2(): number {
        return this.dot(this);
    }

    /**
     * Adds other vector to the receiving vector
     * @this {this} first operand
     * @param {Vec2} that second operand
     */
    public add(that: Vec2): this {
        this[0] = this[0] + that[0];
        this[1] = this[1] + that[1];

        return this;
    }

    /**
     * Subtracts other vector from the receiving vector
     * @this {this} first operand
     * @param {Vec2} that second operand
     */
    public sub(that: Vec2): this {
        this[0] = this[0] - that[0];
        this[1] = this[1] - that[1];

        return this;
    }

    /**
     * Multiples receiving vector by the other vector
     * @this {this} first operand
     * @param {Vec2} that second operand
     */
    public mult(that: Vec2): this {
        this[0] = this[0] * that[0];
        this[1] = this[1] * that[1];

        return this;
    }

    /**
     * Divides receiving vector by the other vector
     * @this {this} first operand
     * @param {Vec2} that second operand
     */
    public div(that: Vec2): this {
        this[0] = this[0] / that[0];
        this[1] = this[1] / that[1];

        return this;
    }

    /**
     * Applies Math.ceil to all components of the receiving vector
     * @this {this} vector to apply operation to
     */
    public ceil(): this {
        this[0] = Math.ceil(this[0]);
        this[1] = Math.ceil(this[1]);

        return this;
    }

    /**
     * Applies Math.floor to all components of the receiving vector
     * @this {this} vector to apply operation to
     */
    public floor(): this {
        this[0] = Math.floor(this[0]);
        this[1] = Math.floor(this[1]);

        return this;
    }

    /**
     * Returns the length-wise min of two vectors
     * @param {Vec2} a first vector
     * @param {Vec2} b second vector
     */
    public static min(a: Vec2, b: Vec2): Vec2 {
        return (a.len() < b.len()) ? a : b;
    }

    /**
     * Returns the length-wise max of two vectors
     * @param {Vec2} a first vector
     * @param {Vec2} b second vector
     */
    public static max(a: Vec2, b: Vec2): Vec2 {
        return (a.len() > b.len()) ? a : b;
    }

    /**
     * Takes the min of each component of two vectors, creating a new vector
     * @param {Vec2} a first vector
     * @param {Vec2} b second vector
     */
    public static minc(a: Vec2, b: Vec2): Vec2 {
        const out = Vec2.create([
            Math.min(a[0], b[0]),
            Math.min(a[1], b[1])
        ]);
        return out;
    }

    /**
     * Takes the max of each component of two vectors, creating a new vector
     * @param {Vec2} a first vector
     * @param {Vec2} b second vector
     */
    public static maxc(a: Vec2, b: Vec2): Vec2 {
        const out = Vec2.create([
            Math.max(a[0], b[0]),
            Math.max(a[1], b[1])
        ]);
        return out;
    }

    /**
     * Returns the component-wise clamp of a between min and max
     * @param {Vec2} a receiving vector
     * @param {number} min minimum value
     * @param {number} max maximum value
     */
    public static clamp(a: Vec2, min: number, max: number): Vec2 {
        return Vec2.minc(Vec2.maxc(a, Vec2.create([min, min])), Vec2.create([max, max]));
    }

    public static clampc(a: Vec2, min: Vec2, max: Vec2): Vec2 {
        return Vec2.minc(Vec2.maxc(a, Vec2.create([min.x, min.y])), Vec2.create([max.x, max.y]));
    }

    public static round(a: Vec2): Vec2 {
        return new Vec2(
            Math.round(a[0]),
            Math.round(a[1])
        )
    }

    public angle(): number {
        return Math.atan2(this[1], this[0]);
    }

    /**
     * Scales receiving vector by some amount
     * @param {number} amount the amount to scale by
     */
    public scale(amount: number): this {
        this[0] = this[0] * amount;
        this[1] = this[1] * amount;

        return this;
    }

    public transform(matrix: Mat3): this {
        const x = this[0], y = this[1];
        this[0] = matrix[0] * x + matrix[3] * y + matrix[6];
        this[1] = matrix[1] * x + matrix[4] * y + matrix[7];
        return this;
    }

    /**
     * Calculate the distance between two vectors
     * @param that 
     * @returns {number} distance
     */
    public dist(that: Vec2): number {
        const x = that[0] - this[0];
        const y = that[1] - this[1];
        return Math.hypot(x, y);
    }

    public dist2(that: Vec2): number {
        const x = that[0] - this[0];
        const y = that[1] - this[1];
        return (x * x) + (y * y);
    }

    /**
     * Component-wise negation of the receiving vector
     */
    public negate(): this {
        this[0] = -this[0];
        this[1] = -this[1];

        return this;
    }

    /**
     * Component-wise inversion of the receiving vector
     */
    public inverse(): this {
        this[0] = 1.0 / this[0];
        this[1] = 1.0 / this[1];

        return this;
    }

    /**
     * Normalize the receiving vector
     */
    public normalize(): this {
        const x = this[0];
        const y = this[1];
        let len = x * x + y * y;

        if (len > 0) len = 1 / Math.sqrt(len);

        this[0] = this[0] * len;
        this[1] = this[1] * len;

        return this;
    }

    /**
     * Calculate the dot product of two vectors
     * @this {this} first operand
     * @param {Vec2} that second operand
     */
    public dot(that: Vec2): number {
        return this[0] * that[0] + this[1] * that[1];
    }

    /**
     * Calculate the cross product of two vectors
     * @this {this} first operand
     * @param {Vec2} that second operand
     * @returns {Vec3} resulting vector
     */
    public cross(that: Vec2): Vec3 {
        const z = this[0] * that[1] - this[1] * that[0];
        const out = Vec3.create([0, 0, z]);
        return out;
    }

    public perp(): Vec2 {
        return Vec2.create([this[1], -this[0]]);
    }

    public project(that: Vec2): Vec2 {
        const amt = this.dot(that) / that.len2();
        return Vec2.create([amt * that[0], amt * that[1]]);
    }

    /**
     * Linearly interpolate between two vectors, resulting in a new vector
     * @param {Vec2} a first operand
     * @param {Vec2} b second operand
     * @param {number} weight number in range 0~1
     * @returns {Vec2} resulting vector
     */
    public static lerp(a: Vec2, b: Vec2, weight: number): Vec2 {
        const out = Vec2.create([
            a[0] + weight * (b[0] - a[0]),
            a[1] + weight * (b[1] - a[1])
        ])
        return out;
    }

    /**
     * Generates a random vector of max length scale  
     * Returns a unit vector if no scale is given
     * @param {number} scale amount to scale final vector
     * @returns {Vec2} resulting vector
     */
    public static random(scale = 1.0): Vec2 {
        const r = Math.random() * 2.0 * Math.PI;
        const out = Vec2.create([Math.cos(r) * scale, Math.sin(r) * scale]);
        return out;
    }

    public static sign(a: Vec2): Vec2 {
        return Vec2.create([Math.sign(a.x), Math.sign(a.y)]);
    }

    /**
     * Sets all components of the receiving vector to 0
     */
    public zero(): this {
        this[0] = 0;
        this[1] = 0;

        return this;
    }

    /**
     * Checks for strict equality between two vectors
     * @this {this} first operand
     * @param {Vec2} that second operand
     */
    public equals(that: Vec2): boolean {
        return this[0] === that[0] && this[1] === that[1];
    }

    public abs(): this {
        this[0] = Math.abs(this[0]);
        this[1] = Math.abs(this[1]);
        return this;
    }

    public nearlyEquals(that: Vec2, epsilon: number): boolean {
        const dX = Math.abs(this[0] - that[0]);
        const dY = Math.abs(this[1] - that[1]);
        return dX < epsilon && dY < epsilon;
    }

    toString(): string {
        return `Vec(x: ${this[0]}, y: ${this[1]})`;
    }
}

//@ts-ignore
window.Vec2 = Vec2;