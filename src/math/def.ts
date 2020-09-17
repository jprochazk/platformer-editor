
declare global {
    interface Math {
        EPSILON: number;
    }
}

Math.EPSILON = 0.000001;

declare global {
    interface Math {
        rad(angle: number): number;
        deg(angle: number): number;
        clamp(num: number, min: number, max: number): number;
        lerp(start: number, end: number, weight: number): number;
        norm(start: number, end: number, value: number): number;
    }
}

const _PI_DIV_180 = Math.PI / 180;
const _180_DIV_PI = 180 / Math.PI;
window["Math"]["rad"] = (angle) => angle * _PI_DIV_180;
window["Math"]["deg"] = (angle) => angle * _180_DIV_PI;
window["Math"]["clamp"] = (num, min, max) => num <= min ? min : num >= max ? max : num;
window["Math"]["lerp"] = (start, end, weight) => start * (1 - weight) + end * weight;
window["Math"]["norm"] = (start, end, value) => (value - start) / (end - start);


export default {};