const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float seed;

vec2 warp(vec2 p){
    p += vec2(
        sin(p.y * 3.0 + time),
        cos(p.x * 3.0 - time)
    ) * 0.2;
    return p;
}

// 🌊 layered flow
float field(vec2 uv){
    vec2 p = warp(uv);

    float v =
        sin(p.x * 8.0 + time + seed) +
        cos(p.y * 8.0 - time) +
        sin((p.x + p.y) * 4.0);

    return v;
}

// 🎯 edge (pigment separation)
float edge(float v){
    return abs(sin(v * 3.0));
}

// 💎 light (fake normal)
float light(vec2 uv){
    float v = field(uv);
    float dx = field(uv + vec2(0.01, 0.0)) - v;
    float dy = field(uv + vec2(0.0, 0.01)) - v;

    return max(0.0, dx + dy);
}

// ✨ metallic
float metallic(vec2 uv){
    return sin((uv.x + uv.y) * 10.0 + time * 3.0);
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(${window.innerWidth}.0, 300.0);

    float v = field(uv);

    float n = (v + 2.0) / 4.0;

    // 🔥 base color (fire)
    vec3 col = mix(
        vec3(0.6, 0.05, 0.0),
        vec3(1.0, 0.8, 0.1),
        n
    );

    // 🎯 edges
    float e = edge(v);
    col *= (1.0 - e * 0.3);

    // ✨ metallic
    float m = metallic(uv);
    col += m * 0.1;

    // 💎 gloss
    float l = light(uv);
    col += l * 0.6;

    // 🎯 depth
    col *= 0.9 + v * 0.1;

    gl_FragColor = vec4(col, 1.0);
}
`;
