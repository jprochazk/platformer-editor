
import * as Math from "math";
import { Camera } from "./camera";
import { CreateBuffer } from "./util";
import { Shader } from "./shader";
import { LineShader, SquarePointShader, TexturedQuadBatchShader } from "./shaders";
import { Texture } from "./texture";

/*

TODO: layering using the depth buffer
- double VBO
    - first is drawn from
    - second is written to
    - this way we can draw and upload data at the same time
- only re-allocate the buffer if the required size is larger than the current size
- keep all data in a TypedArray for faster upload   

http://realtimecollisiondetection.net/blog/?p=86

*/

const TEXTURED_QUAD = () => [
    -1, -1, 0.0, 1.0,
    -1, 1, 0.0, 0.0,
    1, 1, 1.0, 0.0,
    1, 1, 1.0, 0.0,
    1, -1, 1.0, 1.0,
    -1, -1, 0.0, 1.0,
];

// SPEED: split the batches into smaller, fixed-size, pre-allocated ones
class Batch {
    readonly buffer: WebGLBuffer;
    readonly data: number[];
    count: number = 0;

    constructor(private gl: WebGL2RenderingContext) {
        this.buffer = CreateBuffer(gl);
        this.data = [];
    }

    push(count: number, data: number[]) {
        //if (data.length === 0) return;

        // pre-allocate array
        //const elemSize = data[0].length;
        //this.data.length += data.length * elemSize;

        this.count += count;
        this.data.push.apply(this.data, data);
    }

    /**
     * Flushes data to the GPU
     * @note Buffer is not unbound at the end
     */
    flush() {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.data), gl.DYNAMIC_DRAW);
        this.data.length = 0;
        this.count = 0;
    }
}

export class Renderer {

    batches: {
        texturedQuad: Map<number, { texture: Texture, batch: Batch }>,
        point: Batch,
        line: Batch,
    };

    shaders: {
        texturedQuad: Shader,
        point: Shader,
        line: Shader,
    };

    state: {
        camera?: Camera
    };

    constructor(
        private gl: WebGL2RenderingContext
    ) {
        this.shaders = {
            texturedQuad: Shader.from(this.gl, TexturedQuadBatchShader),
            point: Shader.from(this.gl, SquarePointShader),
            line: Shader.from(this.gl, LineShader),
        };
        this.batches = {
            texturedQuad: new Map(),
            point: new Batch(this.gl),
            line: new Batch(this.gl),
        };
        this.state = {};
    }

    beginScene(camera: Camera, background: Math.Vec4) {
        this.state.camera = camera;

        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        this.gl.clearColor(background.x, background.y, background.z, background.w);
    }

    // TODO: color as Vec3, not Vec4

    drawPath(points: Math.Vec2[], color: Math.Vec4) {
        if (!this.state.camera) throw new Error(`Renderer.drawQuad called before Renderer.beginScene`);

        const data = new Array<number>(points.length * 6 * 2);
        for (let i = 0, len = points.length; i < len; ++i) {
            const first = points[i];
            const second = points[(i + 1) % points.length];

            const index = i * 12;
            data[index] = first[0];
            data[index + 1] = first[1];
            data[index + 2] = color[0];
            data[index + 3] = color[1];
            data[index + 4] = color[2];
            data[index + 5] = color[3];
            data[index + 6] = second[0];
            data[index + 7] = second[1];
            data[index + 8] = color[0];
            data[index + 9] = color[1];
            data[index + 10] = color[2];
            data[index + 11] = color[3];
        }
        this.batches.line.push(points.length * 2, data);
    }

    drawPoints(points: Math.Vec2[], color: Math.Vec4/*, type: "square" | "round"*/) {
        if (!this.state.camera) throw new Error(`Renderer.drawPoint called before Renderer.beginScene`);

        const data = new Array<number>(points.length * 6);
        for (let i = 0, len = points.length; i < len; ++i) {
            const point = points[i];
            const index = i * 6;
            data[index] = point[0];
            data[index + 1] = point[1];
            data[index + 2] = color[0];
            data[index + 3] = color[1];
            data[index + 4] = color[2];
            data[index + 5] = color[3];
        }
        this.batches.point.push(points.length, data);
    }

    drawQuad(matrix: Math.Mat3, texture: Texture, uv: Math.Vec4 = Math.v4(0, 0, 1, 1)) {
        if (!this.state.camera) throw new Error(`Renderer.drawQuad called before Renderer.beginScene`);

        let batch = this.batches.texturedQuad.get(texture.id)?.batch;
        // start a new batch for each texture
        if (!batch) {
            batch = new Batch(this.gl);
            this.batches.texturedQuad.set(texture.id, { texture, batch });
        }

        const data = TEXTURED_QUAD();
        for (let i = 0, len = data.length / 4; i < len; ++i) {
            const posIndex1 = i * 4;
            const posIndex2 = posIndex1 + 1
            // positions
            const x = data[posIndex1], y = data[posIndex2];
            data[posIndex1] = matrix[0] * x + matrix[3] * y + matrix[6];
            data[posIndex2] = matrix[1] * x + matrix[4] * y + matrix[7];
            // uvs

            const uvIndex1 = (i * 4) + 2;
            const uvIndex2 = uvIndex1 + 1;
            const u = data[uvIndex1], v = data[uvIndex2];
            data[uvIndex1] = uv!.x + u * uv!.z;
            data[uvIndex2] = uv!.y + v * uv!.w;
        }

        batch.push(6, data.flat(Infinity) as number[]);
    }

    endScene() {
        if (!this.state.camera) throw new Error(`Renderer.endScene called before Renderer.beginScene`);
        const gl = this.gl;

        gl.clear(gl.COLOR_BUFFER_BIT);

        // TODO: clear unused batches
        for (const texturedQuadTextureBatch of this.batches.texturedQuad.values()) {
            if (texturedQuadTextureBatch.batch.count > 0) {
                const shader = this.shaders.texturedQuad;
                const texture = texturedQuadTextureBatch.texture;
                const batch = texturedQuadTextureBatch.batch;
                const count = batch.count;

                shader.bind();
                shader.uniform("uView", this.state.camera.view);
                shader.uniform("uProjection", this.state.camera.projection);

                batch.flush();
                shader.bindAttribs();

                texture.bind(gl);
                gl.drawArrays(gl.TRIANGLES, 0, count);
            }
        }

        if (this.batches.point.count > 0) {
            const shader = this.shaders.point;
            const batch = this.batches.point;
            const count = batch.count;

            shader.bind();
            shader.uniform("uView", this.state.camera.view);
            shader.uniform("uProjection", this.state.camera.projection);

            batch.flush();
            shader.bindAttribs();

            gl.drawArrays(gl.POINTS, 0, count);
        }

        if (this.batches.line.count > 0) {
            const shader = this.shaders.line;
            const batch = this.batches.line;
            const count = batch.count;

            shader.bind();
            shader.uniform("uView", this.state.camera.view);
            shader.uniform("uProjection", this.state.camera.projection);

            batch.flush();
            shader.bindAttribs();

            gl.drawArrays(gl.LINES, 0, count);
        }

        this.state = {};
    }
}

