
import { v2 } from "math";
import { GLError } from "./error";
import { CreateTexture } from "./util";

interface ManagedResource<T> {
    lastUsed: number;
    resource: T;
}

export class Texture {
    private uploaded: Map<WebGL2RenderingContext, ManagedResource<WebGLTexture>> = new Map;

    constructor(
        public readonly id: number,
        private image: HTMLImageElement
    ) { }

    public get(gl: WebGL2RenderingContext): WebGLTexture | null {
        if (!this.uploaded.has(gl)) this.load(gl);
        // may not load if image is not loaded yet
        const tex = this.uploaded.get(gl);
        if (tex) {
            tex.lastUsed = Date.now();
            return tex.resource;
        }
        return null;
    }

    public get size() { return v2(this.width, this.height); }
    public get width() { return this.image.width; }
    public get height() { return this.image.height; }

    public bind(gl: WebGL2RenderingContext) {
        gl.bindTexture(gl.TEXTURE_2D, this.get(gl));
    }

    public gc(threshold = 10000) {
        const now = Date.now();
        for (const [gl, texture] of this.uploaded.entries()) {
            if (now - texture.lastUsed >= threshold) {
                gl.deleteTexture(texture.resource);
                this.uploaded.delete(gl);
            }
        }
    }

    private load(gl: WebGL2RenderingContext, checkError = true) {
        if (this.image === null) return;
        if (this.uploaded.has(gl)) return;
        this.uploaded.set(gl, {
            lastUsed: Date.now(),
            resource: imgToWebGL(gl, this.image, checkError)
        });
    }

    private static counter = 0;
    private static loaded: Map<string, Texture> = new Map();
    public static async load(src: string): Promise<Texture> {
        let tex = Texture.loaded.get(src);
        if (!tex) {
            tex = new Texture(Texture.counter++, await toImage(src));
            Texture.loaded.set(src, tex);
        }
        return tex;
    }
}

export async function toImage(src: string): Promise<HTMLImageElement> {
    return new Promise((rs, rj) => {
        const img = new Image();
        img.onload = () => rs(img);
        img.onerror = (e) => rj(e);
        img.src = src;
    });
}

export function imgToWebGL(
    gl: WebGL2RenderingContext,
    image: HTMLImageElement,
    checkError: boolean = true
): WebGLTexture {
    const texture = CreateTexture(gl);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);

    if (checkError) {
        const error = gl.getError();
        if (error) throw new GLError(error);
    }

    return texture
}

const DEFAULT_TEXTURE_IMG = (() => {
    const img = new Image();
    img.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAArElEQVR4Xu3WURHDIBRE0YfIWkg1UQvxFgtUxv3IwQAzDLt71pnnTHh++w5vn1kewA8QAR1QtpAStAJmsEwgB4AQCZIgCZJguUMkSIIkWCaQBEmQBEmQBEmw3CESJEESLBNIgiT4egnuvVMHXN9P2wEewA8QAR1QtpAStAJmsEzgLA7gAA7ggLKFOIADOKBMIAeAEAmSIAmSYLlDJEiCJFgmkARJkARJ8N0S/ANphBcQw6K+LQAAAABJRU5ErkJggg==`;
    return img;
})();
let DEFAULT_TEXTURE: WebGLTexture | null = null;
export function defaultTexture(gl: WebGL2RenderingContext, checkError: boolean = true): WebGLTexture {
    // Only create it once, then reuse the same texture
    if (!DEFAULT_TEXTURE) {
        const texture = CreateTexture(gl);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, DEFAULT_TEXTURE_IMG);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        DEFAULT_TEXTURE = texture;
    }

    if (checkError) {
        const error = gl.getError();
        if (error) throw new GLError(error);
    }

    return DEFAULT_TEXTURE;
}