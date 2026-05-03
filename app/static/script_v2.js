const fragmentShaderSource = `
precision mediump float;

uniform float time;
uniform float seed;

vec2 flow(vec2 p, float t){
    p.x += sin(p.y * 2.0 + t) * 0.14;
    p.y += cos(p.x * 2.0 - t) * 0.14;

    // 🔥 diagonal bias (natural pour direction)
    p += vec2(0.15, -0.1) * t * 0.1;

    return p;
}

float field(vec2 uv, float t){

    uv = flow(uv, t);
    uv = flow(uv * 1.3, t * 0.6);
    uv = flow(uv * 1.7, t * 0.3);

    float f =
        sin(uv.x * 2.0 + t) +
        cos(uv.y * 2.0 - t);

    f = f * 0.5 + 0.5;

    float d =
        sin(uv.x * 6.0 - t) *
        cos(uv.y * 6.0 + t);

    d = d * 0.5 + 0.5;

    return mix(f, d, 0.6);
}

void main(){

    vec2 uv = gl_FragCoord.xy / vec2(800.0,300.0);
    float t = time * 0.5 + seed * 10.0;

    float f = field(uv, t);

    float density = pow(f, 1.6);

    vec3 deep  = vec3(0.02, 0.05, 0.12);
    vec3 mid   = vec3(0.0, 0.45, 0.85);
    vec3 light = vec3(0.3, 0.9, 1.0);

    vec3 color = mix(deep, mid, density);
    color = mix(color, light, density * density);

    float e = 0.0015;
    float fx = field(uv + vec2(e,0.0), t);
    float fy = field(uv + vec2(0.0,e), t);

    float edge = abs(fx - f) + abs(fy - f);

    float veins = smoothstep(0.015, 0.05, edge);
    veins *= 0.8 + sin(uv.x * 10.0 + t) * 0.2;

    vec3 normal = normalize(vec3(
        fx - f,
        fy - f,
        1.0
    ));

    // 🔥 DEPTH SHADING (NEW)
    float depth = pow(f, 2.0);
    color *= 0.7 + depth * 0.6;

    // ✨ METALLIC GOLD (IMPROVED)
    vec3 goldDark   = vec3(0.3, 0.22, 0.08);
    vec3 goldBright = vec3(1.0, 0.9, 0.4);

    float metal = pow(max(dot(normal, normalize(vec3(0.5,0.5,1.0))),0.0), 5.0);

    // 🔥 anisotropic effect (metal shift)
    metal += sin(uv.x * 20.0 + t) * 0.2;

    vec3 gold = mix(goldDark, goldBright, metal);

    color = mix(color, gold, veins * 0.9);

    // 💡 STRONG RESIN GLOSS (NEW)
    vec3 lightDir = normalize(vec3(-0.6, 0.7, 1.0));
    vec3 reflectDir = reflect(-lightDir, normal);

    float spec = pow(max(dot(vec3(0,0,1), reflectDir), 0.0), 120.0);

    color += spec * (0.6 + veins * 1.8);

    // 🔥 FINAL CONTRAST BOOST
    color = pow(color, vec3(0.85));

    gl_FragColor = vec4(color,1.0);
}
`;
