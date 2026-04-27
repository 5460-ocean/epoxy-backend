const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float seed;

// 🌪 warp
vec2 warp(vec2 p){
    p += vec2(
        sin(p.y * 4.0 + time),
        cos(p.x * 4.0 - time)
    ) * 0.25;
    return p;
}

// 🌊 base field
float field(vec2 uv){
    vec2 p = warp(uv);

    float v =
        sin(p.x * 10.0 + time + seed) +
        cos(p.y * 10.0 - time) +
        sin((p.x + p.y) * 6.0);

    return v;
}

// 🎯 HARD edges (sharper than before)
float edge(float v){
    float e = abs(sin(v * 3.0));
    return pow(e, 3.0); // 🔥 sharpen
}

// 💎 REAL lighting via gradient
float lighting(vec2 uv){
    float v = field(uv);

    float dx = field(uv + vec2(0.005, 0.0)) - v;
    float dy = field(uv + vec2(0.0, 0.005)) - v;

    vec3 normal = normalize(vec3(-dx, -dy, 1.0));

    vec3 lightDir = normalize(vec3(0.4, 0.6, 1.0));

    float diff = max(dot(normal, lightDir), 0.0);

    return diff;
}

// ✨ micro detail (removes smooth look)
float detail(vec2 uv){
    return sin(uv.x * 80.0) * sin(uv.y * 80.0) * 0.05;
}

// 🎨 contrast curve
float contrast(float v){
    return pow(v, 1.5); // boost highlights
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(${window.innerWidth}.0, 300.0);

    float v = field(uv);

    float n = (v + 2.0) / 4.0;

    // 🎨 base color
    vec3 col = mix(
        vec3(0.6, 0.05, 0.0),
        vec3(1.0, 0.8, 0.1),
        n
    );

    // 🎯 sharp pigment edges
    float e = edge(v);
    col *= (1.0 - e * 0.5);

    // ✨ micro texture
    col += detail(uv);

    // 💎 lighting
    float l = lighting(uv);
    col += l * 0.7;

    // 🎯 contrast boost
    col = vec3(
        contrast(col.r),
        contrast(col.g),
        contrast(col.b)
    );

    gl_FragColor = vec4(col, 1.0);
}
`;
