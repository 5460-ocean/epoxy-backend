precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_theme;

float hash(vec2 p){
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);
}

float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x) +
           (c-a)*u.y*(1.0-u.x) +
           (d-b)*u.x*u.y;
}

// STRONG directional flow (no circles)
vec2 flow(vec2 p){
    float t = u_time * 0.2;

    float n = noise(p + t);
    float n2 = noise(p + vec2(3.0,7.0) - t);

    // stretch in one direction (THIS kills circles)
    return p + vec2(n * 1.2, n2 * 0.3);
}

void main(){
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.x *= u_resolution.x / u_resolution.y;

    // zoom
    uv *= 2.5;

    // APPLY FLOW MULTIPLE TIMES (important)
    uv = flow(uv);
    uv = flow(uv * 1.5);
    uv = flow(uv * 0.7);

    // layered noise (elongated)
    float n =
        noise(uv * vec2(1.5,0.5)) * 0.6 +
        noise(uv * vec2(3.0,1.0)) * 0.3 +
        noise(uv * vec2(6.0,2.0)) * 0.1;

    // VEINS (not blobs)
    float veins = smoothstep(0.45, 0.55, n);

    // metallic highlight
    float highlight = pow(1.0 - abs(n - 0.5) * 2.0, 8.0);

    vec3 c1;
    vec3 c2;

    if(u_theme < 0.5){
        c1 = vec3(0.0,0.2,0.5);
        c2 = vec3(0.0,0.8,0.9);
    }
    else if(u_theme < 1.5){
        c1 = vec3(0.6,0.0,0.0);
        c2 = vec3(1.0,0.7,0.0);
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

    // DARK EDGE DEPTH (important)
    color *= 0.7 + 0.3 * n;

    // veins add structure
    color -= veins * 0.25;

    // metallic shine
    color += highlight * 0.5;

    gl_FragColor = vec4(color,1.0);
}
