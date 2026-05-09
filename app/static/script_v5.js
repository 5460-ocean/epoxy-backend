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

#extension GL_OES_standard_derivatives : enable
precision highp float;


varying vec2 vUv;

uniform float uTime;

float random(vec2 st) {

    return fract(
        sin(dot(st.xy, vec2(12.9898,78.233))) *
        43758.5453123
    );
}

float noise(vec2 st) {

    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0,0.0));
    float c = random(i + vec2(0.0,1.0));
    float d = random(i + vec2(1.0,1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a,b,u.x)
        + (c-a)*u.y*(1.0-u.x)
        + (d-b)*u.x*u.y;
}

float fbm(vec2 st) {

    float value = 0.0;
    float amp = 0.5;

    for(int i = 0; i < 5; i++) {

        value += amp * noise(st);

        st *= 2.0;

        amp *= 0.5;
    }

    return value;
}

void main() {

    vec2 uv = vUv;

    uv -= 0.5;

    float t = uTime * 0.05;

    vec2 flow = uv;

    flow.x += sin(flow.y * 3.0 + t) * 0.4;
    flow.y += cos(flow.x * 2.5 - t) * 0.3;

    float n1 = fbm(flow * 3.0);

    float n2 = fbm(flow * 6.0 + 5.0);

    vec3 deep =
        vec3(0.01, 0.03, 0.08);

    vec3 blue =
        vec3(0.0, 0.22, 0.45);

    vec3 cyan =
        vec3(0.0, 0.55, 0.65);

    vec3 color = mix(
        deep,
        blue,
        smoothstep(
            0.1,
            0.85,
            n1
        )
    );

    color = mix(
        color,
        cyan,
        smoothstep(
            0.35,
            0.95,
            n2
        ) * 0.55
    );

    //////////////////////////////////////////////////////
    // RESIN DEPTH LAYER
    //////////////////////////////////////////////////////

    float resinDepth =
        fbm(flow * 10.0);

    color += resinDepth * 0.04;

    float goldEdge =
        abs(n1 - n2);

    goldEdge = smoothstep(
        0.02,
        0.08,
        goldEdge
    );

    vec3 gold =
        vec3(1.0, 0.82, 0.3);

    float goldNoise =
        fbm(flow * 18.0);

    float goldMask =
        smoothstep(
            0.45,
            0.8,
            goldNoise
        );

    color +=
        gold *
        goldEdge *
        goldMask *
        0.32;

    float foam =
        fbm(flow * 14.0);

    foam =
        smoothstep(
            0.72,
            0.92,
            foam
        );

    foam *= smoothstep(
        0.03,
        0.12,
        goldEdge
    );

    color +=
        vec3(0.92,0.96,1.0) *
        foam *
        0.18;


    //////////////////////////////////////////////////////
    // OCEAN GLOW
    //////////////////////////////////////////////////////

    float glow =
        smoothstep(
            0.4,
            1.0,
            n2
        );

    color += vec3(
        0.0,
        0.12,
        0.18
    ) * glow * 0.18;

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
