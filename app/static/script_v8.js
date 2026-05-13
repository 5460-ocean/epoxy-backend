const canvas = document.getElementById("glcanvas");
const gl = canvas.getContext("webgl");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

gl.viewport(0, 0, canvas.width, canvas.height);

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

uniform float uTime;
varying vec2 vUv;

float hash(vec2 p){
    return fract(
        sin(dot(p, vec2(127.1,311.7))) *
        43758.5453123
    );
}

float noise(vec2 p){

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

float fbm(vec2 p){

    float v = 0.0;
    float a = 0.5;

    for(int i=0;i<6;i++){

        v += noise(p) * a;

        p *= 2.02;

        a *= 0.5;
    }

    return v;
}

vec2 flowField(vec2 p){

    float n1 =
        fbm(p * 1.2);

    float n2 =
        fbm(p * 1.7 + 4.0);

    float angle =
        (n1 + n2) * 6.2831;

    return vec2(
        cos(angle),
        sin(angle)
    );
}

void main(){

    vec2 uv = vUv;

    float t = uTime * 0.08;

    uv -= 0.5;

    uv.x *= 0.8;

    vec2 p = uv * 3.0;

    vec2 velocity = vec2(0.0);

    for(int i=0;i<8;i++){

        vec2 flow =
            flowField(
                p * 0.38 +
                velocity * 0.25
            );

        velocity =
            mix(
                velocity,
                flow,
                0.28
            );

        p += velocity * 0.08;

        p += vec2(0.008, -0.003);
    }

    p.x *= 1.15;

    p += vec2(
        sin(t * 0.3),
        cos(t * 0.2)
    ) * 0.03;

    float n =
        fbm(p * 0.8);

    float depth1 =
        fbm(p * 0.7);

    float depth2 =
        fbm(p * 1.5 + 8.0);

    float ridge =
        abs(depth1 - depth2);

    ridge =
        smoothstep(
            0.04,
            0.16,
            ridge
        );

    vec3 deep =
        vec3(0.01,0.03,0.07);

    vec3 blue =
        vec3(0.02,0.18,0.34);

    vec3 cyan =
        vec3(0.15,0.45,0.7);

    vec3 basin =
        vec3(0.55,0.72,0.78);

    vec3 color =
        mix(deep, blue, n);

    color =
        mix(
            color,
            cyan,
            smoothstep(
                0.45,
                0.9,
                depth1
            )
        );

    color =
        mix(
            color,
            basin,
            smoothstep(
                0.72,
                1.0,
                depth2
            ) * 0.45
        );

    vec3 gold =
        vec3(
            1.0,
            0.82,
            0.32
        );

    float goldMask =
        ridge *
        smoothstep(
            0.52,
            0.82,
            n
        );

    float veinFlow =
        fbm(
            vec2(
                p.x * 3.5,
                p.y * 0.45
            )
        );

    goldMask *=
        smoothstep(
            0.35,
            0.85,
            veinFlow
        );

    goldMask *= 1.35;

    color =
        mix(
            color,
            gold,
            goldMask * 0.75
        );

    float highlight =
        pow(
            smoothstep(
                0.5,
                1.0,
                n
            ),
            6.0
        );

    color +=
        highlight *
        vec3(
            0.4,
            0.55,
            0.7
        ) * 0.12;

    float foam =
        smoothstep(
            0.72,
            0.92,
            fbm(
                p * 4.0 +
                ridge * 3.0
            )
        );

    color +=
        foam *
        vec3(
            0.15,
            0.22,
            0.25
        ) * 0.18;

    gl_FragColor =
        vec4(color,1.0);
}
`;

function compile(type, source){

    const shader =
        gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){

        alert(gl.getShaderInfoLog(shader));

        console.error(gl.getShaderInfoLog(shader));

        return null;
    }

    return shader;
}

const vs =
    compile(gl.VERTEX_SHADER, vertexShaderSource);

const fs =
    compile(gl.FRAGMENT_SHADER, fragmentShaderSource);

const program =
    gl.createProgram();

gl.attachShader(program, vs);
gl.attachShader(program, fs);

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

const buffer =
    gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);

const aPosition =
    gl.getAttribLocation(program, "aPosition");

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
    gl.getUniformLocation(program, "uTime");

function render(time){

    time *= 0.001;

    gl.uniform1f(uTime, time);

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );

    requestAnimationFrame(render);
}

requestAnimationFrame(render);
