export const VERT_CODE=`#version 300 es
layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

out vec2 fUv;
out vec3 fNormal;
out vec3 fPosition;

void main() {
    mat4 mv = uView * uModel;

    // Position in camera coordinates for the fragment shader (implicitly interpolated)
    fPosition = (mv * vec4(vPosition, 1.0)).xyz;

    // Assuming that the model matrix contains no non-uniform scalings.  If that is the
    // case, we can use the upper left 3x3 of the view * model matrix to transform normals.
    fNormal = normalize( mat3(mv) * vNormal );

    // Pass the UV coordinate along to the fragment shader (implicitly interpolated)
    fUv = vUv;

    // gl_Position must be the position in clip-coordinates
    gl_Position = uProjection * vec4(fPosition, 1.0);
}`;

export const FRAG_CODE=`#version 300 es
precision highp float;

#define NUM_LIGHTS 2

uniform vec3 lightColors[ NUM_LIGHTS ];
uniform vec3 lightPositions[ NUM_LIGHTS ]; // in eye space

uniform float exposure;
uniform float roughness;

in vec2 fUv;
in vec3 fNormal;    // fragment normal in eye space
in vec3 fPosition;  // fragment position in eye space

uniform sampler2D diffuseTexture;

vec3 to_sRGB(vec3 c) { return pow(c, vec3(1.0/2.2)); }
vec3 from_sRGB(vec3 c) { return pow(c, vec3(2.2)); }

out vec4 fragColor;

void main() {
    // interpolating normals may change the length of the normal, so re-normalize the normal.
    vec3 n   = normalize(fNormal);     // Normal (eye coords)
    vec3 wo  = normalize(-fPosition);  // Towards eye (eye coords)

    vec3 finalColor = vec3(0,0,0);
    for (int i = 0; i < NUM_LIGHTS; i++) {
        vec3 wi = lightPositions[i] - fPosition;
        float r = length(wi);         // Dist. to light
        wi = normalize(wi);           // Unit vector towards light
        vec3 h = normalize(wi + wo);  // "Halfway" vector

        // Diffuse reflectance is taken from the texture, and converted to linear color space
        vec3 kd = from_sRGB(texture(diffuseTexture, fUv).rgb);

        // Diffuse component
        vec3 diff = kd * max(dot(n, wi), 0.0);

        // Specular component
        vec3 spec = vec3( pow(max(dot(n, h), 0.0), 1.0 / roughness) );

        finalColor += (lightColors[i] / (r*r)) * (diff + spec);
    }

    // Only shade if facing the light
    // Color the back faces an identifiable color
    if (gl_FrontFacing) {
        fragColor = vec4(to_sRGB(finalColor * exposure), 1.0);
    } else {
        fragColor = vec4(0.8, 0.7, 0.0, 1.0);
    }
}`;
