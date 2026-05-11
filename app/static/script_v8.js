const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL not supported");
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener("resize", resize);
resize();

const vertexShaderSource = `
attribute vec2 aPosition;
varying vec2 vUv;

void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

varying vec2 vUv;

float hash(vec2 p) {
    return fract(
        sin(dot(p, vec2(127.1, 311.7))) *
        43758.5453123
    );
}

float noise(vec2 p) {

    vec2 i = floor(p);
    vec2 f = fract(p);

    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(
        mix(a, b, f.x),
        mix(c, d, f.x),
        f.y
    );
}

float fbm(vec2 p) {

    float v = 0.0;
    float a = 0.5;

    for(int i = 0; i < 6; i++) {
        v += noise(p) * a;
        p *= 2.0;
        a *= 0.5;
    }

    return v;
}

vec2 curl(vec2 p) {

    float e = 0.15;

    float n1 = fbm(p + vec2(0.0, e));
    float n2 = fbm(p - vec2(0.0, e));
    float n3 = fbm(p + vec2(e, 0.0));
    float n4 = fbm(p - vec2(e, 0.0));

    return vec2(
        n1 - n2,
        -(n3 - n4)
    );
}

vec2 advect(vec2 uv) {

    float t = uTime * 0.08;

    vec2 p = uv * 3.0;

    vec2 velocity = vec2(0.0);

    for(int i = 0; i < 5; i++) {

        vec2 c = curl(p);

        velocity += c;

        p += c * 0.45;

        p += vec2(
            0.03,
            0.008
        );
    }

    uv += velocity * 0.12;

    uv.x += sin(
        uv.y * 2.0 +
        t
    ) * 0.08;

    uv.y += cos(
        uv.x * 1.8 -
        t
    ) * 0.06;

    return uv;
}

void main() {

    vec2 uv = vUv;

    uv = advect(uv);

    vec2 drift = vec2(
        uTime * 0.004,
        uTime * 0.001
    );

    float d1 = fbm((uv + drift) * 2.0);
    float d2 = fbm((uv - drift) * 4.0);
    float d3 = fbm((uv + drift * 2.0) * 8.0);

    float density =
        d1 * 0.6 +
        d2 * 0.3 +
        d3 * 0.1;

    vec3 deep =
        vec3(0.01, 0.05, 0.12);

    vec3 blue =
        vec3(0.02, 0.22, 0.38);

    vec3 cyan =
        vec3(0.12, 0.42, 0.58);

    vec3 color =
        mix(deep, blue, density);

    color =
        mix(color, cyan, smoothstep(
            0.55,
            0.9,
            density
        ));

    // resin glow
    color +=
        smoothstep(
            0.7,
            1.0,
            density
        ) * 0.08;

    // soft gold energy lines
    float ridge =
        abs(dFdx(density)) +
        abs(dFdy(density));

    float gold =
        smoothstep(
            0.03,
            0.12,
            ridge
        );

    vec3 goldColor =
        vec3(1.0, 0.78, 0.28);

    color =
        mix(
            color,
            goldColor,
            gold * 0.18
        );

    gl_FragColor =
        vec4(color, 1.0);
}
`;

function createShader(type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    return shader;
}

const vertexShader =
    createShader(
        gl.VERTEX_SHADER,
        vertexShaderSource
    );

const fragmentShader =
    createShader(
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
    );

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

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

const aPosition =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

gl.enableVertexAttribArray(aPosition);

gl.vertexAttribPointer(
    aPosition,
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
