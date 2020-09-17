
import { ShaderSources } from "gl";

export const ColoredQuadBatchShader: ShaderSources = {
    vertex:
        `#version 300 es
precision mediump float;

uniform mat4 uView;
uniform mat4 uProjection;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec4 aColor;

out vec4 vColor;

void main()
{
    vColor = aColor;
    gl_Position = uProjection * uView * vec4(aPosition, 0.0, 1.0);
}`,

    fragment:
        `#version 300 es
precision mediump float;

in vec4 vColor;

out vec4 oFragColor;

void main()
{
    oFragColor = vColor;
}`

}

export const TexturedQuadBatchShader: ShaderSources = {
    vertex:
        `#version 300 es
precision mediump float;

uniform mat4 uView;
uniform mat4 uProjection;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aTexCoord;

out vec2 vTexCoord;

void main()
{
    vTexCoord = aTexCoord;
    gl_Position = uProjection * uView * vec4(aPosition, 0.0, 1.0);
}`,

    fragment:
        `#version 300 es
precision mediump float;

uniform sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oFragColor;

void main()
{
    oFragColor = texture(uTexture, vTexCoord);
}`

}

export const ColoredQuadShader: ShaderSources = {
    vertex: `#version 300 es
precision mediump float;

uniform mat4 uView;
uniform mat4 uProjection;
uniform mat3 uModel;

layout(location = 0) in vec2 aPosition;

void main()
{
    vec3 transformed = uModel * vec3(aPosition, 1.0);
    gl_Position = uProjection * uView * vec4(transformed.xy, 0.0, 1.0);
}`,
    fragment: `#version 300 es
precision mediump float;

uniform vec4 uColor;

out vec4 oFragColor;

void main()
{
    oFragColor = uColor;
}`
}

export const TexturedQuadShader: ShaderSources = {
    vertex: `#version 300 es
precision mediump float;

uniform mat4 uView;
uniform mat4 uProjection;
uniform mat3 uModel;
uniform vec4 uUV;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aTexCoord;

out vec2 vTexCoord;

void main()
{
    vTexCoord = aTexCoord * uUV.zw + uUV.xy;
    vec3 transformed = uModel * vec3(aPosition, 1.0);
    gl_Position = uProjection * uView * vec4(transformed.xy, 0.0, 1.0);
}`,
    fragment: `#version 300 es
precision mediump float;

uniform sampler2D uTexture;

in vec2 vTexCoord;

out vec4 oFragColor;

void main()
{
    oFragColor = texture(uTexture, vTexCoord);
}`
}

export const LineShader: ShaderSources = {
    vertex: `#version 300 es
precision mediump float;

uniform mat4 uView;
uniform mat4 uProjection;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec4 aColor;

out vec4 vColor;

void main()
{
    vColor = aColor;
    gl_Position = uProjection * uView * vec4(aPosition, 0.0, 1.0);
}`,
    fragment: `#version 300 es
precision mediump float;

in vec4 vColor;

out vec4 oFragColor;

void main()
{
    oFragColor = vColor;
}`
}
export const SquarePointShader: ShaderSources = {
    vertex: `#version 300 es
precision mediump float;

uniform mat4 uView;
uniform mat4 uProjection;

layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec4 aColor;

out vec4 vColor;

void main()
{
    vColor = aColor;
    gl_Position = uProjection * uView * vec4(aPosition, 0.0, 1.0);
    gl_PointSize = 10.0;
}`,
    fragment: `#version 300 es
precision mediump float;

in vec4 vColor;

out vec4 oFragColor;

void main()
{
    oFragColor = vColor;
}`
}
export const CirclePointShader: ShaderSources = {
    vertex: `#version 300 es
precision mediump float;

uniform mat4 uView;
uniform mat4 uProjection;
uniform mat3 uModel;

//uniform float uPointSize;

layout(location = 0) in vec2 aPosition;

void main()
{
    vec3 transformed = uModel * vec3(aPosition, 1.0);
    gl_Position = uProjection * uView * vec4(transformed.x, transformed.y, 0.0, 1.0);
    gl_PointSize = 10.0;
}`,
    fragment: `#version 300 es
#extension GL_OES_standard_derivatives : enable

precision mediump float;

uniform vec4 uColor;

out vec4 oFragColor;

void main()
{
    float r = 0.0, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    delta = fwidth(r);
    alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
    oFragColor = uColor * alpha;
}`
}

