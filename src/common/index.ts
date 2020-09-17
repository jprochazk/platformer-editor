
import { TypedArray } from "./array";
import { splitByUpperCase } from "./string";
import { Input } from "./input";
import { Application } from "./runtime";
import { hash } from "./hash";
import { FPSCount } from "./fps";

export type Constructor<T> = {
    new(...args: any): T
}

export type Mutable<T> = { -readonly [K in keyof T]: T[K] };

export type InstanceTypeTuple<T extends any[]> = {
    [K in keyof T]: T[K] extends Constructor<infer U> ? U : never;
};

export function Typeof(type: any): string {
    return type.prototype?.constructor.name ?? type.constructor.name;
}

// TODO: fix cursors
export function cursor(kind: "default" | "grab" | "move" | "rotate" | "resize", direction?: number[]): void {
    //document.body.style.cursor = "default";
    return;
    //switch (kind) {
    //    case "default": {
    //        document.body.style.cursor = "default";
    //        break;
    //    }
    //    case "grab": {
    //        document.body.style.cursor = "grab";
    //        break;
    //    }
    //    case "move": {
    //        document.body.style.cursor = "move";
    //        break;
    //    }
    //    case "rotate": {
    //        document.body.style.cursor = "url(rotate.png) 16 16, auto";
    //        break;
    //    }
    //    case "resize": {
    //        if (!direction) throw new Error(`Direction required for resize cursor`);
    //        const x = direction[0] < 0 ? "w" : direction[0] > 0 ? "e" : "";
    //        const y = direction[1] < 0 ? "n" : direction[0] > 0 ? "s" : "";
    //        document.body.style.cursor = `${y}${x}-resize`;
    //        break;
    //    }
    //}
}

export {
    TypedArray,
    splitByUpperCase,
    Input,
    hash,
    Application,
    FPSCount,
}