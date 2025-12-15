#version 300 es
precision highp float;

in vec2 vcoord;
out vec4 color;

uniform sampler2D tex;

const vec3 bb = vec3(0.0, 0.0, 1.0);

void main() {

    vec2 position = (vcoord + 1.0) * 0.5;

    position.y = 1.0 - position.y;

    vec4 texcolor = texture(tex, position);

    float len = length(bb - texcolor.rgb);

    if (len < 0.5) {
        texcolor.a = 0.0;
    }
    //float sum = dot(texcolor.rgb, vec3(0.299, 0.587, 0.114));

    //color = vec4(vec3(sum), texcolor.a);
    color = texcolor;

}