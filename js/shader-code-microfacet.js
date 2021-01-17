export const VERT_CODE=`#version 300 es
layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

// TODO: Part 1 - declare any output variables here

out vec2 fUv;
out vec3 fNormal;
out vec3 fPosition;

void main() {

    // TODO: Part 1 - compute gl_Position as well as any output variables you need for the fragment shader.

    mat4 mv = uView * uModel;

    fPosition = (mv * vec4(vPosition, 1.0)).xyz;

    fNormal = normalize( mat3(mv) * vNormal );

    fUv = vUv;

    gl_Position = uProjection * vec4(fPosition, 1.0);

}`;

export const FRAG_CODE=`#version 300 es
precision highp float;

#define NUM_LIGHTS 2
#define PI 3.14159

float nt = 2.0;
float ni = 1.0;

uniform vec3 lightColors[ NUM_LIGHTS ];
uniform vec3 lightPositions[ NUM_LIGHTS ];

uniform float exposure;
uniform float alpha;

in vec2 fUv;
in vec3 fNormal;    // fragment normal in eye space
in vec3 fPosition;  // fragment position in eye space

uniform sampler2D diffuseTexture;

vec3 to_sRGB(vec3 c) { return pow(c, vec3(1.0/2.2)); }
vec3 from_sRGB(vec3 c) { return pow(c, vec3(2.2)); }

float computeF(float c) {
    c = abs(c);
    float gSquared = (nt * nt) / (ni * ni) - 1.0 + c * c;
    // clamp if irrational
    float F = 1.0;
    if (gSquared >= 0.0) {
        float g = sqrt(gSquared);
        F = 0.5 * ((g - c) * (g - c)) / ((g + c) * (g + c));
        F = F * (1.0 + ((c * (g + c) - 1.0) / (c * (g - c) + 1.0)) *
            ((c * (g + c) - 1.0) / (c * (g - c) + 1.0)));
    }
    return F;
}

float computeD(vec3 N, vec3 H) {
    float D = 0.0;
    if (dot(H, N) > 0.0) {
        float cos_thetam = dot(H, N);
        float cos_thetam2 = cos_thetam * cos_thetam;
        float sin_thetam2 = 1.0 - cos_thetam2;
        float cos_thetam4 = cos_thetam2 * cos_thetam2;
        float tan_thetam2 = sin_thetam2 / cos_thetam2;
        D = exp(-tan_thetam2 / (alpha * alpha));
        D = D / (PI * alpha * alpha * cos_thetam4);
    }
    return D;
}

float gHelper(vec3 I, vec3 H, vec3 N) {
    float G = 0.0;
    float vm = dot(I, H);
    float vn = dot(I, N);
    if (vm / vn > 0.0) {
        float cos_thetav = dot(normalize(I), normalize(N));
        float sin_thetav = sqrt(1.0 - cos_thetav * cos_thetav);
        float tan_thetav = sin_thetav / cos_thetav;
        float a = 1.0 / (alpha * tan_thetav);
        if (a > 1.6) {
            G = 1.0;
        } else {
            G = 3.535 * a + 2.181 * a * a;
            G = G / (1.0 + 2.276 * a + 2.577 * a * a);
        }
    }
    return G;
}

float computeG(vec3 N, vec3 H, vec3 L, vec3 V) {
    float G_im = gHelper(L, H, N);
    float G_om = gHelper(V, H, N);
    float G = G_im * G_om;
    return G;
}

out vec4 fragColor;

void main() {
    vec3 n   = normalize(fNormal);     // Normal (eye coords)
    vec3 wo  = normalize(-fPosition);  // Towards eye (eye coords)

    vec3 finalColor = vec3(0,0,0);

    for (int i = 0; i < NUM_LIGHTS; i++) {
        vec3 wi = lightPositions[i] - fPosition;
        float r = length(wi);
        wi = normalize(wi);
        vec3 h = normalize(wi + wo);

        vec3 rd = from_sRGB(texture(diffuseTexture, fUv).rgb) / PI;

        float f = computeF(dot(wi, h));
        float g = computeG(n, h, wi, wo);
        float d = computeD(n, h);

        float fr = ( f * g * d ) / ( 4.0 * abs( dot(wi, n)) * abs( dot(wo, n)));

        float max = dot(n, wi);
        if ( max < 0.0) max = 0.0;
        finalColor += (lightColors[i]/(r*r)) * (rd + fr) * max;
    }

    fragColor = vec4(to_sRGB(finalColor * exposure), 1.0);

}`;
