precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_theme;

// simple random
float rand(vec2 p){
    return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
}

// directional flow ONLY (no radial math)
vec2 flow(vec2 p){
    float t = u_time * 0.3;

    float a = rand(floor(p) + t);
    float b = rand(floor(p + 1.0) - t);

    // force horizontal stretch
    return p + vec2(a * 1.5, b * 0.2);
}

void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;

    // zoom in
    uv *= 4.0;

    // APPLY FLOW MANY TIMES (this breaks ALL structure)
    uv = flow(uv);
    uv = flow(uv * 1.3);
    uv = flow(uv * 1.7);
    uv = flow(uv * 0.6);

    // build elongated streaks (NOT circular)
    float v = uv.x + uv.y * 0.3;

    // add variation (still directional)
    v += sin(uv.x * 2.0 + u_time) * 0.2;

    float n = fract(v);

    // sharpen into veins
    float veins = smoothstep(0.45, 0.55, n);

    // themes
    vec3 c1;
    vec3 c2;

    if(u_theme < 0.5){
        c1 = vec3(0.0,0.2,0.5);
        c2 = vec3(0.0,0.8,0.9);
    }
    else if(u_theme < 1.5){
        c1 = vec3(0.7,0.0,0.0);
        c2 = vec3(1.0,0.8,0.0);
    }
    else if(u_theme < 2.5){
        c1 = vec3(0.2,0.0,0.4);
        c2 = vec3(1.0,0.0,0.8);
    }
    else{
        c1 = vec3(0.9);
        c2 = vec3(0.3);
    }

    vec3 color = mix(c1, c2, n);

    // depth shading
    color *= 0.6 + 0.4 * n;

    // vein dark edges
    color -= veins * 0.3;

    // highlight
    float shine = pow(1.0 - abs(n - 0.5) * 2.0, 6.0);
    color += shine * 0.4;

    gl_FragColor = vec4(color,1.0);
}
