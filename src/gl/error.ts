

export class GLError extends Error {
    constructor(error: number | string) {
        super(`[WebGL] ${typeof error === "number" ? errorCodeToString(error) : error}`);
    }
}

function errorCodeToString(code: number): string {
    switch (code) {
        case 0x0500: return "INVALID_ENUM";
        case 0x0501: return "INVALID_VALUE";
        case 0x0502: return "INVALID_OPERATION";
        case 0x0505: return "OUT_OF_MEMORY";
        case 0x9242: return "CONTEXT_LOST_WEBGL";
        default: return "UNKNOWN_ERROR";
    }
}