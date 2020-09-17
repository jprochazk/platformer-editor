
declare global {
    interface Array<T> {
        filterSome(callbackFn: (value: T, index: number, array: T[]) => boolean, removeMax: number): T[];
        equals(that: Array<T>): boolean;
        back(): T;
        swap(a: number, b: number): void;
    }
}

if (undefined === Array.prototype.filterSome) {
    window.Array.prototype.filterSome = function (callbackFn: (value: any, index: number, array: any[]) => boolean, removeMax: number): any[] {
        let discarded = 0 | 0;
        let i = this.length | 0;
        while (i--) {
            if (discarded == removeMax) break;
            if (callbackFn(this[i], i, this)) continue;
            this.splice(i, 1);
            discarded++;
        }
        return this;
    }
}
if (undefined === Array.prototype.equals) {
    window.Array.prototype.equals = function <T>(this: Array<T>, that: Array<T>): boolean {
        if (this === that) return true;
        if (this == null || that == null) return false;
        if (this.length != that.length) return false;

        for (let i = 0; i < this.length; ++i) {
            if (this[i] !== that[i]) return false;
        }
        return true;
    }
}
if (undefined === Array.prototype.back) {
    window.Array.prototype.back = function <T>(this: Array<T>): T | undefined {
        return this[this.length - 1];
    }
}
if (undefined === Array.prototype.swap) {
    window.Array.prototype.swap = function <T>(this: Array<T>, a: number, b: number): void {
        const temp = this[a];
        this[a] = this[b];
        this[b] = temp;
    }
}

export type TypedArray =
    Int8Array | Int16Array | Int32Array |
    Uint8ClampedArray | Uint8Array | Uint16Array | Uint32Array |
    Float32Array | Float64Array

export default {};