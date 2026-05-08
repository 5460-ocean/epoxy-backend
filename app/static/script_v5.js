//
// script_v5.js
//
// EXTENDS script_v4.js
//
// Adds:
// - epoxy resin cells
// - acrylic pour lacing
// - oceanic membranes
// - clustered gold particles
// - Voronoi cellular structures
// - multilayer fluid interaction
// - premium ocean epoxy preset
// - luxury metallic rendering
//

const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
attribute vec2 position;
varying vec2 vUv;

void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;

///////////////////////////////////////////////////////////
// HASH / NOISE
///////////////////////////////////////////////////////////

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
}

vec2 hash2(vec2 p) {
    return fract(
        sin(vec2(
            dot(p, vec2(127.1,311.7)),
            dot(p, vec2(269.5,183.3))
        )) * 43758.5453
    );
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));

    vec2 u = f*f*(3.0-2.0*f);

    return mix(a,b,u.x)
        + (c-a)*u.y*(1.0-u.x)
        + (d-b)*u.x*u.y;
}

///////////////////////////////////////////////////////////
// FBM
///////////////////////////////////////////////////////////

float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;

    for(int i=0;i<6;i++) {
        v += a * noise(p);
        p *= 2.0;
        a *= 0.5;
    }

    return v;
}

///////////////////////////////////////////////////////////
// VORONOI
///////////////////////////////////////////////////////////

float voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);

    float md = 8.0;

    for(int j=-1;j<=1;j++) {
        for(int i=-1;i<=1;i++) {

            vec2 g = vec2(float(i), float(j));
            vec2 o = hash2(n + g);

            o = 0.5 + 0.5*sin(uTime*0.2 + 6.2831*o);

            vec2 r = g + o - f;
            float d = dot(r,r);

            md = min(md,d);
        }
    }

    return md;
}

///////////////////////////////////////////////////////////
// FLOW FIELD
///////////////////////////////////////////////////////////

vec2 flow(vec2 uv) {

    float n1 = fbm(uv * 2.0 + uTime * 0.05);
    float n2 = fbm(uv * 4.0 - uTime * 0.04);

    uv.x += n1 * 0.15;
    uv.y += n2 * 0.12;

    uv += vec2(
        sin(uv.y * 3.0 + uTime * 0.2),
        cos(uv.x * 3.0 - uTime * 0.2)
    ) * 0.03;

    return uv;
}

///////////////////////////////////////////////////////////
// METALLIC FLAKES
///////////////////////////////////////////////////////////

float metallicFlakes(vec2 uv) {

    vec2 gv = fract(uv * 220.0) - 0.5;
    vec2 id = floor(uv * 220.0);

    float n = hash(id);

    float sparkle = smoothstep(
        0.02,
        0.0,
        length(gv)
    );

    sparkle *= step(0.985, n);

    return sparkle;
}

///////////////////////////////////////////////////////////
// GOLD PARTICLE CLUSTERS
///////////////////////////////////////////////////////////

float clusteredGold(vec2 uv) {

    float v = voronoi(uv * 8.0);

    float clusters = smoothstep(
        0.12,
        0.02,
        v
    );

    float sparkle = metallicFlakes(uv * 1.5);

    return clusters * 0.7 + sparkle;
}

///////////////////////////////////////////////////////////
// EPOXY CELLS
///////////////////////////////////////////////////////////

float epoxyCells(vec2 uv) {

    float cell1 = voronoi(uv * 6.0);
    float cell2 = voronoi(uv * 11.0 + 3.0);

    float cells = smoothstep(
        0.18,
        0.03,
        cell1
    );

    cells += smoothstep(
        0.10,
        0.02,
        cell2
    ) * 0.5;

    return cells;
}

///////////////////////////////////////////////////////////
// ACRYLIC LACING
///////////////////////////////////////////////////////////

float acrylicLacing(vec2 uv) {

    float n = fbm(uv * 10.0);

    float lace = sin(
        uv.x * 40.0 +
        n * 8.0 +
        uTime * 0.2
    );

    lace = abs(lace);

    lace = smoothstep(
        0.8,
        1.0,
        lace
    );

    return lace;
}

///////////////////////////////////////////////////////////
// OCEAN MEMBRANES
///////////////////////////////////////////////////////////

float oceanMembrane(vec2 uv) {

    uv.x += sin(uv.y * 2.5) * 0.4;
    uv.y += cos(uv.x * 2.0) * 0.25;

    float v = voronoi(uv * 5.0);

    float membrane = smoothstep(
        0.14,
        0.08,
        abs(v - 0.22)
    );

    membrane *= fbm(uv * 2.0);

    return membrane * 0.45;
}

///////////////////////////////////////////////////////////
// BLACK MARBLE CRACKS
///////////////////////////////////////////////////////////

float marbleCracks(vec2 uv) {

    float n = fbm(uv * 18.0);

    float cracks = abs(
        sin(
            uv.x * 12.0 +
            uv.y * 8.0 +
            n * 5.0
        )
    );

    cracks = smoothstep(
        0.94,
        1.0,
        cracks
    );

    return cracks;
}

///////////////////////////////////////////////////////////
// MULTI-LAYER DEPTH
///////////////////////////////////////////////////////////

vec3 epoxyLayer(vec2 uv, float scale, vec3 tint) {

    vec2 p = flow(uv * scale);

    float n = fbm(p);

    float cells = epoxyCells(p);

    float lace = acrylicLacing(p);

    float membrane = oceanMembrane(p);

    vec3 col = tint;

    col += n * 0.12;
    col += cells * 0.15;
    col += lace * 0.08;
    col += membrane * 0.18;

    return col;
}

///////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////

void main() {

    vec2 uv = vUv;

    uv -= 0.5;
    uv.x *= uResolution.x / uResolution.y;

    ///////////////////////////////////////////////////////
    // FLOW
    ///////////////////////////////////////////////////////

    vec2 p = flow(uv);

    ///////////////////////////////////////////////////////
    // OCEAN DEPTH COLORS
    ///////////////////////////////////////////////////////

    vec3 deepOcean = vec3(0.005, 0.015, 0.04);
    vec3 oceanBlue = vec3(0.02, 0.12, 0.24);
    vec3 cyan = vec3(0.0, 0.32, 0.42);
    vec3 foam = vec3(0.92, 0.97, 1.0);

    ///////////////////////////////////////////////////////
    // MULTILAYER EPOXY
    ///////////////////////////////////////////////////////

    vec3 layer1 = epoxyLayer(
        p * 0.8,
        2.0,
        deepOcean
    );

    vec3 layer2 = epoxyLayer(
        p * 1.2 + 3.0,
        4.0,
        oceanBlue
    );

    vec3 layer3 = epoxyLayer(
        p * 1.8 - 2.0,
        7.0,
        cyan
    );

    vec3 color = layer1;
    color = mix(color, layer2, 0.45);
    color = mix(color, layer3, 0.35);

    ///////////////////////////////////////////////////////
    // OCEANIC MEMBRANES
    ///////////////////////////////////////////////////////

    float membrane = oceanMembrane(p * 1.2);

    color += membrane * foam * 0.5;

    ///////////////////////////////////////////////////////
    // ACRYLIC POUR LACING
    ///////////////////////////////////////////////////////

    float lace = acrylicLacing(p * 1.4);

    color += lace * foam * 0.25;

    ///////////////////////////////////////////////////////
    // EPOXY CELLS
    ///////////////////////////////////////////////////////

    float cells = epoxyCells(p);

    color += vec3(
        0.12,
        0.18,
        0.22
    ) * cells;

    ///////////////////////////////////////////////////////
    // GOLD VEINS
    ///////////////////////////////////////////////////////

    float goldNoise = fbm(p * 12.0);

    float goldVein = smoothstep(
        0.68,
        0.82,
        goldNoise
    );

    vec3 gold = vec3(
        1.0,
        0.82,
        0.32
    );

    color += gold * goldVein * 0.55;

    ///////////////////////////////////////////////////////
    // CLUSTERED GOLD PARTICLES
    ///////////////////////////////////////////////////////

    float goldClusters = clusteredGold(p * 1.6);

    color += gold * goldClusters * 0.7;

    ///////////////////////////////////////////////////////
    // METALLIC FLAKES
    ///////////////////////////////////////////////////////

    float flakes = metallicFlakes(p);

    color += flakes * 0.9;

    ///////////////////////////////////////////////////////
    // BLACK MARBLE CRACKS
    ///////////////////////////////////////////////////////

    float cracks = marbleCracks(p);

    color -= cracks * 0.25;

    ///////////////////////////////////////////////////////
    // ANISOTROPIC METALLIC REFLECTIONS
    ///////////////////////////////////////////////////////

    float anisotropic = sin(
        (uv.x + uv.y) * 80.0
    );

    anisotropic *= 0.5 + 0.5*sin(uTime * 0.2);

    anisotropic = smoothstep(
        0.75,
        1.0,
        anisotropic
    );

    color += anisotropic * vec3(
        0.8,
        0.9,
        1.0
    ) * 0.18;

    ///////////////////////////////////////////////////////
    // GLOSSY RESIN FINISH
    ///////////////////////////////////////////////////////

    float fresnel = pow(
        1.0 - max(dot(normalize(vec3(uv,1.0)), vec3(0.0,0.0,1.0)), 0.0),
        3.0
    );

    color += fresnel * 0.25;

    ///////////////////////////////////////////////////////
    // CONTRAST / TONE
    ///////////////////////////////////////////////////////

    color = pow(color, vec3(0.92));

    ///////////////////////////////////////////////////////
    // FINAL
    ///////////////////////////////////////////////////////

    gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
}

gl.useProgram(program);

const vertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
    -1,  1,
     1, -1,
     1,  1
]);

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const position = gl.getAttribLocation(program, "position");

gl.enableVertexAttribArray(position);

gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

const uTime = gl.getUniformLocation(program, "uTime");
const uResolution = gl.getUniformLocation(program, "uResolution");

function render(time) {

    time *= 0.001;

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform1f(uTime, time);

    gl.uniform2f(
        uResolution,
        canvas.width,
        canvas.height
    );

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});
