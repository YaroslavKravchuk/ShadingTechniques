export const VERT_CODE=`#version 300 es
layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec3 vUv;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

// TODO: Part 2 - delcare any output variables here.

out vec3 fUv;
out vec3 fNormal;
out vec3 fPosition;

void main() {
    // TODO: Part 2 - compute gl_Position, as well as any output variables for
    //       the fragment shader.

    mat4 mv = uView * uModel;

    fPosition = (mv * vec4(vPosition, 1.0)).xyz;

    fNormal = normalize( mat3(mv) * vNormal );

    fUv = vUv;

    gl_Position = uProjection * vec4(fPosition, 1.0);
}`;

export const FRAG_CODE=`#version 300 es
precision highp float;

// TODO: Part 2 - declare any input variables here.

in vec3 fUv;
in vec3 fNormal;    // fragment normal in eye space
in vec3 fPosition;

uniform samplerCube environmentMap;

vec3 to_sRGB(vec3 c) { return pow(c, vec3(1.0/2.2)); }
vec3 from_sRGB(vec3 c) { return pow(c, vec3(2.2)); }

out vec4 fragColor;

void main() {
    // TODO: Part 2 - implement mirror reflection

    vec3 rd = from_sRGB(texture(environmentMap, normalize(2.0*dot(-fPosition, fNormal)*(fNormal)+fPosition)).rgb);
    fragColor = vec4(to_sRGB(rd), 1.0);
}`;
