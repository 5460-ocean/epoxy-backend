
const canvas = document.getElementById("glcanvas");

const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertex = `
attribute vec2 position;

void main() {

    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `

precision highp float;

uniform vec2 uResolution;
uniform float uTime;

#define PI 3.14159265359

float hash(vec2 p) {

    return fract(
        sin(dot(p, vec2(127.1,311.7))) * 43758.5453123
    );
}

float noise(vec2 p) {

    vec2 i = floor(p);

    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);

    float b = hash(i + vec2(1.0,0.0));

    float c = hash(i + vec2(0.0,1.0));

    float d = hash(i + vec2(1.0,1.0));

    return mix(
        mix(a,b,f.x),
        mix(c,d,f.x),
        f.y
    );
}

float fbm(vec2 p) {

    float v = 0.0;

    float a = 0.5;

    for(int i=0;i<6;i++) {

        v += noise(p) * a;

        p *= 2.0;

        a *= 0.5;
    }

    return v;
}

vec2 riverFlow(vec2 uv) {

    float t = uTime * 0.18;

    vec2 flow = uv;

    flow.x += sin(flow.y * 2.5 + t) * 0.9;

    flow.y += cos(flow.x * 2.0 - t * 0.7) * 0.6;

    flow += vec2(t * 0.15, t * 0.05);

    return flow;
}

void main() {

    vec2 uv =
        gl_FragCoord.xy /
        uResolution.xy;

    uv.x *=
        uResolution.x /
        uResolution.y;

    vec2 flowUV =
        riverFlow(uv * 2.0);

    /*
    =========================
    LARGE OCEAN MASSES
    =========================
    */

    float basin =
        fbm(flowUV * 0.6);

    basin =
        smoothstep(
            0.25,
            0.85,
            basin
        );

    /*
    =========================
    FLOW CHANNELS
    =========================
    */

    float channels =
        fbm(
            flowUV * 3.0
        );

    channels =
        pow(channels, 2.2);

    /*
    =========================
    FLOW RIDGES
    =========================
    */

    float ridge =
        abs(
            channels - basin
        );

    ridge =
        smoothstep(
            0.08,
            0.22,
            ridge
        );

    /*
    =========================
    GOLD BOUNDARIES
    =========================
    */

    float goldMask =
        ridge *
        smoothstep(
            0.4,
            0.9,
            channels
        );

    /*
    =========================
    FOAM REGIONS
    =========================
    */

    float foam =
        fbm(
            flowUV * 12.0
        );

    foam =
        smoothstep(
            0.72,
            0.9,
            foam
        );

    foam *= ridge;

    /*
    =========================
    OCEAN DEPTH
    =========================
    */

    vec3 deepOcean =
        vec3(
            0.01,
            0.05,
            0.12
        );

    vec3 cyanOcean =
        vec3(
            0.0,
            0.35,
            0.48
        );

    vec3 shallow =
        vec3(
            0.0,
            0.55,
            0.72
        );

    vec3 ocean =
        mix(
            deepOcean,
            cyanOcean,
            basin
        );

    ocean =
        mix(
            ocean,
            shallow,
            channels * 0.5
        );

    /*
    =========================
    GOLD
    =========================
    */

    vec3 gold =
        vec3(
            1.0,
            0.82,
            0.28
        );

    ocean +=
        gold *
        goldMask *
        1.8;

    /*
    =========================
    FOAM
    =========================
    */

    ocean +=
        foam *
        0.45;

    /*
    =========================
    DEPTH FOG
    =========================
    */

    float depth =
        fbm(
            uv * 0.8
        );

    ocean *=
        0.75 + depth * 0.5;

    gl_FragColor =
        vec4(ocean, 1.0);
}
`;

function shader(type, source) {

    const s = gl.createShader(type);

    gl.shaderSource(s, source);

    gl.compileShader(s);

    return s;
}

const program = gl.createProgram();

gl.attachShader(
    program,
    shader(gl.VERTEX_SHADER, vertex)
);

gl.attachShader(
    program,
    shader(gl.FRAGMENT_SHADER, fragment)
);

gl.linkProgram(program);

gl.useProgram(program);

const vertices = new Float32Array([
    -1,-1,
     1,-1,
    -1, 1,
    -1, 1,
     1,-1,
     1, 1
]);

const buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const position =
    gl.getAttribLocation(
        program,
        "position"
    );

gl.enableVertexAttribArray(position);

gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);

const uTime =
    gl.getUniformLocation(
        program,
        "uTime"
    );

const uResolution =
    gl.getUniformLocation(
        program,
        "uResolution"
    );

function render(time) {

    time *= 0.001;

    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );

    gl.uniform1f(uTime, time);

    gl.uniform2f(
        uResolution,
        canvas.width,
        canvas.height
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

window.addEventListener("resize", () => {

    canvas.width = window.innerWidth;

    canvas.height = window.innerHeight;
});

