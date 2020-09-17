
export type ResizeCallback = (viewport: Viewport) => void;

export class Viewport {
    private canvas: HTMLCanvasElement;
    private counter = 0;
    private resizeCallbacks: Map<number, ResizeCallback> = new Map();

    public onresize: (() => void) | null = null;

    constructor(
        private gl: WebGL2RenderingContext
    ) {
        this.canvas = this.gl.canvas as HTMLCanvasElement;
        this.resize();
    }

    public get width(): number { return this.canvas.clientWidth; }
    public get height(): number { return this.canvas.clientHeight; }

    public resize() {
        if (this.canvas.clientWidth !== this.canvas.width ||
            this.canvas.clientHeight !== this.canvas.height) {
            this.canvas.width = this.canvas.clientWidth;
            this.canvas.height = this.canvas.clientHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.onresize && this.onresize();
        }
    }
}
