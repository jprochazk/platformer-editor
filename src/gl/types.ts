
const sizes = {
    byte: 1,
    unsigned_byte: 1,
    short: 2,
    unsigned_short: 2,
    int: 4,
    unsigned_int: 4,
    float: 4,
    float_vec2: 4 * 2,
    float_vec3: 4 * 3,
    float_vec4: 4 * 4,
    int_vec2: 4 * 2,
    int_vec3: 4 * 3,
    int_vec4: 4 * 4,
    bool: 1,
    bool_vec2: 1 * 2,
    bool_vec3: 1 * 3,
    bool_vec4: 1 * 4,
    sampler_2d: 4,
    sampler_cube: 4,
    float_mat2: 4 * 2 * 2,
    float_mat2x3: 4 * 2 * 3,
    float_mat2x4: 4 * 2 * 4,
    float_mat3x2: 4 * 3 * 2,
    float_mat3: 4 * 3 * 3,
    float_mat3x4: 4 * 3 * 4,
    float_mat4x2: 4 * 4 * 2,
    float_mat4x3: 4 * 4 * 3,
    float_mat4: 4 * 4 * 4,
    unsigned_int_vec2: 4 * 2,
    unsigned_int_vec3: 4 * 3,
    unsigned_int_vec4: 4 * 4,
}
type sizes = typeof sizes;
export function sizeof(type: string): number {
    return sizes[type as keyof sizes];
}

export function ismatrix(type: string): boolean {
    switch (type) {
        case "float_mat2": return true;
        case "float_mat2x3": return true;
        case "float_mat2x4": return true;
        case "float_mat3x2": return true;
        case "float_mat3": return true;
        case "float_mat3x4": return true;
        case "float_mat4x2": return true;
        case "float_mat4x3": return true;
        case "float_mat4": return true;
        default: return false;
    }
}

const setters = {
    byte: "1i",
    unsigned_byte: "1ui",
    short: "1i",
    unsigned_short: "1ui",
    int: "1i",
    int_vec2: "2iv",
    int_vec3: "3iv",
    int_vec4: "4iv",
    float: "1f",
    float_vec2: "2fv",
    float_vec3: "3fv",
    float_vec4: "4fv",
    unsigned_int: "1ui",
    unsigned_int_vec2: "2uiv",
    unsigned_int_vec3: "3uiv",
    unsigned_int_vec4: "4uiv",
    bool: "1i",
    bool_vec2: "2iv",
    bool_vec3: "3iv",
    bool_vec4: "4iv",
    sampler_2d: "1i",
    sampler_cube: "1i",
    float_mat2: "Matrix2fv",
    float_mat2x3: "Matrix2x3fv",
    float_mat2x4: "Matrix2x4fv",
    float_mat3x2: "Matrix3x2fv",
    float_mat3: "Matrix3fv",
    float_mat3x4: "Matrix3x4fv",
    float_mat4x2: "Matrix4x2fv",
    float_mat4x3: "Matrix4x3fv",
    float_mat4: "Matrix4fv",
}
type setters = typeof setters;
export function setterof(type: string): string | null {
    return setters[type as keyof setters] ?? null;
}

const bases = {
    0x1400: 0x1400,
    0x1401: 0x1401,
    0x1402: 0x1402,
    0x1403: 0x1403,
    0x1404: 0x1404,
    0x1405: 0x1405,
    0x1406: 0x1406,
    0x8B50: 0x1406,
    0x8B51: 0x1406,
    0x8B52: 0x1406,
    0x8B53: 0x1404,
    0x8B54: 0x1404,
    0x8B55: 0x1404,
    0x8B56: 0x1404,
    0x8B57: 0x1404,
    0x8B58: 0x1404,
    0x8B59: 0x1404,
    0x8B5A: 0x1406,
    0x8B5B: 0x1406,
    0x8B5C: 0x1406,
    0x8B5E: 0x1404,
    0x8B60: 0x1404,
    0x8B65: 0x1406,
    0x8B66: 0x1406,
    0x8B67: 0x1406,
    0x8B68: 0x1406,
    0x8B69: 0x1406,
    0x8B6A: 0x1406,
    0x8DC6: 0x1405,
    0x8DC7: 0x1405,
    0x8DC8: 0x1405,
}
type bases = typeof bases;
export function baseof(type: number): number | null {
    return bases[type as keyof bases] ?? null;
}

const types = {
    0x1400: "byte",
    0x1401: "unsigned_byte",
    0x1402: "short",
    0x1403: "unsigned_short",
    0x1404: "int",
    0x1405: "unsigned_int",
    0x1406: "float",
    0x8b50: "float_vec2",
    0x8b51: "float_vec3",
    0x8b52: "float_vec4",
    0x8b53: "int_vec2",
    0x8b54: "int_vec3",
    0x8b55: "int_vec4",
    0x8b56: "bool",
    0x8b57: "bool_vec2",
    0x8b58: "bool_vec3",
    0x8b59: "bool_vec4",
    0x8b5a: "float_mat2",
    0x8b5b: "float_mat3",
    0x8b5c: "float_mat4",
    0x8b5e: "sampler_2d",
    0x8b60: "sampler_cube",
    0x8b65: "float_mat2x3",
    0x8b66: "float_mat2x4",
    0x8b67: "float_mat3x2",
    0x8b68: "float_mat3x4",
    0x8b69: "float_mat4x2",
    0x8b6a: "float_mat4x3",
    0x8dc6: "unsigned_int_vec2",
    0x8dc7: "unsigned_int_vec3",
    0x8dc8: "unsigned_int_vec4",
}
type types = typeof types;
export function stringify(type: number): string | null {
    return types[type as keyof types] ?? null;
}


