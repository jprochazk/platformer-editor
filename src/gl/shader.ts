import { GLError } from "./error";

import { sizeof, baseof, stringify, setterof, ismatrix } from "./types";
import { CreateShader, CreateProgram } from "./util";

export interface Attribute {
    location: number;
    type: number;
    name: string;
    size: number;
    stride: number;
    offset: number;
    normalized: boolean;
}

export interface Uniform {
    name: string;
    type: string;
    location: WebGLUniformLocation;
}

export interface ShaderSources {
    vertex: string;
    fragment: string;
}

export class Shader {
    private constructor(
        private readonly gl: WebGL2RenderingContext,
        public readonly source: ShaderSources,
        public readonly program: WebGLProgram,
        public readonly attributes: Attribute[],
        public readonly uniforms: { [x: string]: Uniform }
    ) { }

    public bindAttribs() {
        for (const attrib of this.attributes) {
            this.gl.enableVertexAttribArray(attrib.location);
            this.gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, attrib.normalized, attrib.stride, attrib.offset);
        }
    }

    /**
     * Sets uniform `name` to `value`
     */
    public uniform(name: string, value: any) {
        const uniform = this.uniforms[name];
        if (!uniform) throw new GLError(`Uniform "${name}" does not exist`);
        // @ts-ignore doing nasty things but it's ok :)
        const setter = this.gl[`uniform${setterof(uniform.type)}`];
        if (ismatrix(uniform.type)) {
            setter.call(this.gl, uniform.location, false, value);
        } else {
            setter.call(this.gl, uniform.location, value);
        }
    }

    public bind() {
        this.gl.useProgram(this.program);
    }

    private static loaded: Map<string, Shader> = new Map();
    public static from(
        gl: WebGL2RenderingContext,
        sources: ShaderSources
    ): Shader {
        const src = [sources.vertex, sources.fragment].join("\n");
        return Shader.loaded.get(src) ?? (() => {
            const program = createShaderProgram(gl, sources);

            const attributes = reflectAttributes(gl, program);
            const uniforms = reflectUniforms(gl, program);

            const shader = new Shader(gl, sources, program, attributes, uniforms)
            Shader.loaded.set(src, shader);
            return shader;
        })();
    }
}

function reflectAttributes(gl: WebGL2RenderingContext, program: WebGLProgram): Attribute[] {
    const attributes: Attribute[] = [];

    let total_stride = 0;
    let offset = 0;
    const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    for (let i = 0; i < attributeCount; i++) {
        const attributeInfo = gl.getActiveAttrib(program, i);
        if (!attributeInfo) throw new Error(`Could not get active attribute at location ${i}`);
        if (!stringify(attributeInfo.type)) throw new Error(`Unknown attribute data type at location ${i}`);

        const location = gl.getAttribLocation(program, attributeInfo.name);
        const size = sizeof(stringify(attributeInfo.type)!)!;
        attributes.push({
            location: location,
            type: baseof(attributeInfo.type)!,
            name: attributeInfo.name,
            size: size / 4,
            stride: 0,
            offset,
            normalized: false
        });
        offset += size;

        total_stride += size;

        if (i === attributeCount - 1) {
            attributes.forEach(attrib => attrib.stride = total_stride);
        }
    }

    return attributes;
}

function reflectUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): { [x: string]: Uniform } {
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    const uniforms: { [x: string]: Uniform } = {};
    for (let i = 0; i < uniformCount; i++) {
        const uniformInfo = gl.getActiveUniform(program, i);
        if (!uniformInfo) throw new Error(`Could not get active uniform at location ${i}`);
        if (!stringify(uniformInfo.type)) throw new Error(`Unknown uniform data type for uniform ${uniformInfo.name}`);

        const location = gl.getUniformLocation(program, uniformInfo.name);
        if (!location) throw new Error(`Could not get uniform location for uniform ${uniformInfo.name}`);

        const type = stringify(uniformInfo.type)!;
        uniforms[uniformInfo.name] = {
            name: uniformInfo.name,
            type,
            location
        };
    }

    return uniforms;
}

function createShaderProgram(gl: WebGL2RenderingContext, sources: { vertex: string, fragment: string }): WebGLProgram {
    const vertexShader = compileShader(gl, sources.vertex, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, sources.fragment, gl.FRAGMENT_SHADER);

    return linkProgram(gl, vertexShader, fragmentShader);
}

function compileShader(gl: WebGL2RenderingContext, shaderSource: string, shaderType: number) {
    const shader = CreateShader(gl, shaderType);

    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        const infoLog = gl.getShaderInfoLog(shader);
        throw new Error(`Shader compilation error: ${infoLog}`);
    }
    return shader;
}

function linkProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = CreateProgram(gl);

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) throw new Error("program failed to link:" + gl.getProgramInfoLog(program));

    return program;
}
