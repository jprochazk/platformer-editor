export class Vec4 extends Array<number> {

    private constructor(array: [number, number, number, number]) {
        super(...array);
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public toArray(): Array<number> { return [this[0], this[1], this[2], this[3]]; }

    public get x(): number { return this[0]; }
    public set x(value: number) { this[0] = value; }
    public get y(): number { return this[1]; }
    public set y(value: number) { this[1] = value; }
    public get z(): number { return this[2]; }
    public set z(value: number) { this[2] = value; }
    public get w(): number { return this[3]; }
    public set w(value: number) { this[3] = value; }

    /**
     * 
     * @param {[number,number,number]} array array of length 3
     * @returns {Vec4} resulting vector
     */
    public static create(array?: [number, number, number, number]): Vec4 {
        return new Vec4(array || [0, 0, 0, 0]);
    }

    /**
     * Creates a new vector from an existing one
     * @returns {Vec4} new vector
     */
    public clone(): Vec4 {
        return Vec4.create([this[0], this[1], this[2], this[3]]);
    }

    /**
     * Copies the values of one vector to another
     * @param {Vec4} out receiving vector
     */
    public copy(out: Vec4) {
        out[0] = this[0];
        out[1] = this[1];
        out[2] = this[2];
        out[3] = this[3];
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
     * @param {Vec4} that second operand
     */
    public add(that: Vec4): this {
        this[0] = this[0] + that[0];
        this[1] = this[1] + that[1];
        this[2] = this[2] + that[2];
        this[3] = this[3] + that[3];

        return this;
    }

    /**
     * Subtracts other vector from the receiving vector
     * @this {this} first operand
     * @param {Vec4} that second operand
     */
    public sub(that: Vec4): this {
        this[0] = this[0] - that[0];
        this[1] = this[1] - that[1];
        this[2] = this[2] - that[2];
        this[3] = this[3] - that[3];

        return this;
    }

    /**
     * Multiples receiving vector by the other vector
     * @this {this} first operand
     * @param {Vec4} that second operand
     */
    public mult(that: Vec4): this {
        this[0] = this[0] * that[0];
        this[1] = this[1] * that[1];
        this[2] = this[2] * that[2];
        this[3] = this[3] * that[3];

        return this;
    }

    /**
     * Divides receiving vector by the other vector
     * @this {this} first operand
     * @param {Vec4} that second operand
     */
    public div(that: Vec4): this {
        if (that[0] === 0) throw new Error("Second operand has component 0!");
        if (that[1] === 0) throw new Error("Second operand has component 0!");
        if (that[2] === 0) throw new Error("Second operand has component 0!");
        if (that[3] === 0) throw new Error("Second operand has component 0!");
        this[0] = this[0] / that[0];
        this[1] = this[1] / that[1];
        this[2] = this[2] / that[2];
        this[3] = this[3] / that[3];

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
        this[3] = Math.ceil(this[3]);

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
        this[3] = Math.floor(this[3]);

        return this;
    }

    /**
     * Returns the length-wise min of two vectors
     * @param {Vec4} a first vector
     * @param {Vec4} b second vector
     */
    public static min(a: Vec4, b: Vec4): Vec4 {
        return (a.len() < b.len()) ? a : b;
    }

    /**
     * Returns the length-wise max of two vectors
     * @param {Vec4} a first vector
     * @param {Vec4} b second vector
     */
    public static max(a: Vec4, b: Vec4): Vec4 {
        return (a.len() > b.len()) ? a : b;
    }

    /**
     * Takes the min of each component of two vectors, creating a new vector
     * @param {Vec4} a first vector
     * @param {Vec4} b second vector
     */
    public static minc(a: Vec4, b: Vec4): Vec4 {
        const out = Vec4.create([
            Math.min(a[0], b[0]),
            Math.min(a[1], b[1]),
            Math.min(a[2], b[2]),
            Math.min(a[3], b[3])
        ]);
        return out;
    }

    /**
     * Takes the max of each component of two vectors, creating a new vector
     * @param {Vec4} a first vector
     * @param {Vec4} b second vector
     */
    public static maxc(a: Vec4, b: Vec4): Vec4 {
        const out = Vec4.create([
            Math.max(a[0], b[0]),
            Math.max(a[1], b[1]),
            Math.max(a[2], b[2]),
            Math.max(a[3], b[3])
        ]);
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
        this[3] = this[3] * amount;

        return this;
    }

    /**
     * Calculate the distance between two vectors
     * @param that 
     * @returns {number} distance
     */
    public dist(that: Vec4): number {
        const x = that[0] - this[0];
        const y = that[1] - this[1];
        const z = that[2] - this[2];
        const w = that[3] - this[3];
        return Math.hypot(x, y, z, w);
    }

    /**
     * Component-wise negation of the receiving vector
     */
    public negate(): this {
        this[0] = -this[0];
        this[1] = -this[1];
        this[2] = -this[2];
        this[3] = -this[3];

        return this;
    }

    /**
     * Component-wise inversion of the receiving vector
     */
    public inverse(): this {
        this[0] = 1.0 / this[0];
        this[1] = 1.0 / this[1];
        this[2] = 1.0 / this[2];
        this[3] = 1.0 / this[3];

        return this;
    }

    /**
     * Normalize the receiving vector
     */
    public normalize(): this {
        const x = this[0];
        const y = this[1];
        const z = this[2];
        const w = this[3];
        let len = x * x + y * y + z * z + w * w;

        if (len > 0) len = 1 / Math.sqrt(len);

        this[0] = this[0] * len;
        this[1] = this[1] * len;
        this[2] = this[2] * len;
        this[3] = this[3] * len;

        return this;
    }

    /**
     * Calculate the dot product of two vectors
     * @this {this} first operand
     * @param {Vec4} that second operand
     */
    public dot(that: Vec4): number {
        return this[0] * that[0]
            + this[1] * that[1]
            + this[2] * that[2]
            + this[3] * that[3];
    }

    /**
     * Calculate the cross product of three vectors in 4-dimensional space
     * @this {this} first operand
     * @param {Vec4} that second operand
     * @returns {Vec4} resulting vector
     */
    public static cross(a: Vec4, b: Vec4, c: Vec4): Vec4 {
        const u = a;
        const v = b;
        const w = c;
        const A = v[0] * w[1] - v[1] * w[0],
            B = v[0] * w[2] - v[2] * w[0],
            C = v[0] * w[3] - v[3] * w[0],
            D = v[1] * w[2] - v[2] * w[1],
            E = v[1] * w[3] - v[3] * w[1],
            F = v[2] * w[3] - v[3] * w[2];
        const G = u[0];
        const H = u[1];
        const I = u[2];
        const J = u[3];
        const out = Vec4.create([
            H * F - I * E + J * D,
            -(G * F) + I * C - J * B,
            G * E - H * C + J * A,
            -(G * D) + H * B - I * A
        ]);
        return out;
    }

    /**
     * Linearly interpolate between two vectors, resulting in a new vector
     * @param {Vec4} a first operand
     * @param {Vec4} b second operand
     * @param {number} weight number in range 0~1
     * @returns {Vec4} resulting vector
     */
    public static lerp(a: Vec4, b: Vec4, weight: number): Vec4 {
        const out = Vec4.create([
            a[0] + weight * (b[0] - a[0]),
            a[1] + weight * (b[1] - a[1]),
            a[2] + weight * (b[2] - a[2]),
            a[3] + weight * (b[3] - a[3])
        ]);
        return out;
    }

    /**
     * Generates a random vector of given scale  
     * Returns a unit vector if no scale is given  
     * Marsaglia, George. Choosing a Point from the Surface of a Sphere. Ann. Math. Statist. 43 (1972), no. 2, 645--646. http://projecteuclid.org/euclid.aoms/1177692644
     * @param {number} scale amount to scale final vector
     * @returns {Vec4} resulting vector
     */
    public static random(scale = 1.0): Vec4 {
        let v1, v2, v3, v4;
        let s1, s2;

        do {
            v1 = Math.random() * 2 - 1;
            v2 = Math.random() * 2 - 1;
            s1 = v1 * v1 + v2 * v2;
        } while (s1 >= 1);

        do {
            v3 = Math.random() * 2 - 1;
            v4 = Math.random() * 2 - 1;
            s2 = v3 * v3 + v4 * v4;
        } while (s2 >= 1);

        const d = Math.sqrt((1 - s1) / s2);
        const out = Vec4.create([
            scale * v1,
            scale * v2,
            scale * v3 * d,
            scale * v4 * d
        ]);
        return out;
    }

    /**
     * Sets all components of the receiving vector to 0
     */
    public zero(): this {
        this[0] = 0;
        this[1] = 0;
        this[2] = 0;
        this[3] = 0;

        return this;
    }

    /**
     * Checks for strict equality between two vectors
     * @this {this} first operand
     * @param {Vec4} that second operand
     */
    public equals(that: Vec4): boolean {
        return this[0] === that[0] && this[1] === that[1] && this[2] === that[2] && this[3] === that[3];
    }

    public abs(): this {
        this[0] = Math.abs(this[0]);
        this[1] = Math.abs(this[1]);
        this[2] = Math.abs(this[2]);
        this[3] = Math.abs(this[3]);
        return this;
    }

    public nearlyEquals(that: Vec4, epsilon: number): boolean {
        const d = this.sub(that).abs();
        return d.x <= epsilon && d.y <= epsilon && d.z <= epsilon && d.w <= epsilon;
    }

    toString(): string {
        return `Vec(x: ${this[0]}, y: ${this[1]}, z: ${this[2]}, w: ${this[3]})`;
    }
}

//@ts-ignore
window.Vec4 = Vec4;
