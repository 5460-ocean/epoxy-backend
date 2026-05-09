const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

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

//////////////////////////////////////////////////////////
// RANDOM
//////////////////////////////////////////////////////////

float random(vec2 st) {

    return fract(
        sin(dot(st.xy, vec2(12.9898,78.233))) *
        43758.5453123
    );
}

//////////////////////////////////////////////////////////
// NOISE
//////////////////////////////////////////////////////////

float noise(vec2 st) {

    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x)
        + (c - a) * u.y * (1.0 - u.x)
        + (d - b) * u.x * u.y;
}

//////////////////////////////////////////////////////////
// FBM
//////////////////////////////////////////////////////////

float fbm(vec2 st) {

    float value = 0.0;
    float amplitude = 0.5;

    for(int i = 0; i < 6; i++) {

        value += amplitude * noise(st);

        st *= 2.0;
        amplitude *= 0.5;
    }

    return value;
}

//////////////////////////////////////////////////////////
// FLOW FIELD
//////////////////////////////////////////////////////////

vec2 riverFlow(vec2 uv) {

    vec2 p = uv;

    for(int i = 0; i < 5; i++) {

        p.x += sin(
            p.y * 1.5 +
            float(i) * 0.7 +
            uTime * 0.08
        ) * 0.25;

        p.y += cos(
            p.x * 1.2 +
            float(i) * 0.5
        ) * 0.2;
    }

    return p;
}

//////////////////////////////////////////////////////////
// MAIN
//////////////////////////////////////////////////////////

void main() {

    vec2 uv = vUv;

    uv -= 0.5;

    uv.x *= uResolution.x / uResolution.y;

    //////////////////////////////////////////////////////
    // LARGE FLOW
    //////////////////////////////////////////////////////

    vec2 flowUV = riverFlow(uv * 1.5);

    float n1 = fbm(flowUV * 1.2);

    float n2 = fbm(flowUV * 2.5 + 4.0);

    //////////////////////////////////////////////////////
    // OCEAN COLORS
    //////////////////////////////////////////////////////

    vec3 deepOcean = vec3(0.01, 0.03, 0.09);

    vec3 blue = vec3(0.02, 0.2, 0.35);

    vec3 cyan = vec3(0.0, 0.55, 0.65);

    vec3 foam = vec3(0.92, 0.96, 1.0);

    vec3 color = mix(
        deepOcean,
        blue,
        n1
    );

    color = mix(
        color,
        cyan,
        smoothstep(
            0.45,
            0.9,
            n2
        )
    );

    //////////////////////////////////////////////////////
    // GOLD BOUNDARIES
    //////////////////////////////////////////////////////

    float edge =
        abs(dFdx(n1)) +
        abs(dFdy(n1));

    edge = smoothstep(
        0.02,
        0.08,
        edge
    );

    vec3 gold = vec3(
        1.0,
        0.82,
        0.3
    );

    color += gold * edge * 0.6;

    //////////////////////////////////////////////////////
    // FOAM CELLS
    //////////////////////////////////////////////////////

    float cells =
        smoothstep(
            0.72,
            0.9,
            fbm(flowUV * 8.0)
        );

    cells *= edge;

    color += foam * cells * 0.25;

    //////////////////////////////////////////////////////
    // SUBSURFACE DEPTH
    //////////////////////////////////////////////////////

    float depthNoise =
        fbm(flowUV * 10.0);

    color += depthNoise * 0.05;

    //////////////////////////////////////////////////////
    // PEARL SHIMMER
    //////////////////////////////////////////////////////

    float pearl = sin(
        flowUV.x * 120.0 +
        flowUV.y * 90.0
    );

    pearl = smoothstep(
        0.95,
        1.0,
        pearl
    );

    color += pearl * 0.06;

    //////////////////////////////////////////////////////
    // CONTRAST
    //////////////////////////////////////////////////////

    color = pow(
        color,
        vec3(0.9)
    );

    gl_FragColor = vec4(color, 1.0);
}
`;

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    console.log(gl.getShaderInfoLog(shader));

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

const position = gl.getAttribLocation(
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

const uTime = gl.getUniformLocation(
    program,
    "uTime"
);

const uResolution = gl.getUniformLocation(
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

    gl.clear(gl.COLOR_BUFFER_BIT);

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
