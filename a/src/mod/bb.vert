#version 300 es

in vec2 coord;
out vec2 vcoord;

uniform vec2 resolution;
uniform vec4 data;

void main() {

    vec2 res = resolution * 0.5;
    vec2 render = (data.xy * data.zw + data.zw * 0.5) / res - 1.0;
    vec2 scaling = data.zw * 0.5 / res;

    vec2 position = vec2(
         coord.x * scaling.x + render.x,
         coord.y * scaling.y - render.y
    );

    gl_Position = vec4(position, 0.0, 1.0);
    vcoord = coord;

}