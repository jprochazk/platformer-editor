import { GLError } from "./error";

export function CreateBuffer(gl: WebGL2RenderingContext): WebGLBuffer {
    const object = gl.createBuffer();
    if (!object) throw new GLError(`Failed to create Buffer`);
    return object;
}
export function CreateFramebuffer(gl: WebGL2RenderingContext): WebGLFramebuffer {
    const object = gl.createFramebuffer();
    if (!object) throw new GLError(`Failed to create Framebuffer`);
    return object;
}
export function CreateProgram(gl: WebGL2RenderingContext): WebGLProgram {
    const object = gl.createProgram();
    if (!object) throw new GLError(`Failed to create Program`);
    return object;
}
export function CreateQuery(gl: WebGL2RenderingContext): WebGLQuery {
    const object = gl.createQuery();
    if (!object) throw new GLError(`Failed to create Query`);
    return object;
}
export function CreateRenderbuffer(gl: WebGL2RenderingContext): WebGLRenderbuffer {
    const object = gl.createRenderbuffer();
    if (!object) throw new GLError(`Failed to create Renderbuffer`);
    return object;
}
export function CreateSampler(gl: WebGL2RenderingContext): WebGLSampler {
    const object = gl.createSampler();
    if (!object) throw new GLError(`Failed to create Sampler`);
    return object;
}
export function CreateShader(gl: WebGL2RenderingContext, type: number): WebGLShader {
    const object = gl.createShader(type);
    if (!object) throw new GLError(`Failed to create Shader`);
    return object;
}
export function CreateTexture(gl: WebGL2RenderingContext): WebGLTexture {
    const object = gl.createTexture();
    if (!object) throw new GLError(`Failed to create Texture`);
    return object;
}
export function CreateTransformFeedback(gl: WebGL2RenderingContext): WebGLTransformFeedback {
    const object = gl.createTransformFeedback();
    if (!object) throw new GLError(`Failed to create Transform Feedback`);
    return object;
}
export function CreateVertexArray(gl: WebGL2RenderingContext): WebGLVertexArrayObject {
    const object = gl.createVertexArray();
    if (!object) throw new GLError(`Failed to create Vertex Array Object`);
    return object;
}
export function CreateContext<T extends "webgl" | "webgl2">(canvas: HTMLCanvasElement, type: T, options?: WebGLContextAttributes): T extends "webgl2" ? WebGL2RenderingContext : T extends "webgl" ? WebGLRenderingContext : never {
    const context = canvas.getContext(type, options) as T extends "webgl2" ? WebGL2RenderingContext : T extends "webgl" ? WebGLRenderingContext : never;
    if (!context) throw new GLError(`Failed to acquire WebGL2 context`);
    return context;
}
interface ExtensionMap {
    "EXT_blend_minmax": EXT_blend_minmax;
    "EXT_texture_filter_anisotropic": EXT_texture_filter_anisotropic;
    "EXT_frag_depth": EXT_frag_depth;
    "EXT_shader_texture_lod": EXT_shader_texture_lod;
    "EXT_sRGB": EXT_sRGB;
    "OES_vertex_array_object": OES_vertex_array_object;
    "WEBGL_color_buffer_float": WEBGL_color_buffer_float;
    "WEBGL_compressed_texture_astc": WEBGL_compressed_texture_astc;
    "WEBGL_compressed_texture_s3tc_srgb": WEBGL_compressed_texture_s3tc_srgb;
    "WEBGL_debug_shaders": WEBGL_debug_shaders;
    "WEBGL_draw_buffers": WEBGL_draw_buffers;
    "WEBGL_lose_context": WEBGL_lose_context;
    "WEBGL_depth_texture": WEBGL_depth_texture;
    "WEBGL_debug_renderer_info": WEBGL_debug_renderer_info;
    "WEBGL_compressed_texture_s3tc": WEBGL_compressed_texture_s3tc;
    "OES_texture_half_float_linear": OES_texture_half_float_linear;
    "OES_texture_half_float": OES_texture_half_float;
    "OES_texture_float_linear": OES_texture_float_linear;
    "OES_texture_float": OES_texture_float;
    "OES_standard_derivatives": OES_standard_derivatives;
    "OES_element_index_uint": OES_element_index_uint;
    "ANGLE_instanced_arrays": ANGLE_instanced_arrays;
}
export function GetExtension<E extends keyof ExtensionMap>(context: WebGLRenderingContextBase, extensionName: E): ExtensionMap[E];
export function GetExtension(context: WebGLRenderingContextBase, extensionName: string): any;
export function GetExtension<E extends keyof ExtensionMap>(context: WebGLRenderingContextBase, extensionName: E): ExtensionMap[E] {
    const ext = context.getExtension(extensionName);
    if (!ext) throw new GLError(`Failed to get extension ${extensionName}`);
    return ext as ExtensionMap[E];
}