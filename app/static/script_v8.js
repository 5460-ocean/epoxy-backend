
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

/*
====================
LUXURY RESIN
====================
*/

// deep black epoxy
vec3 deep =
         vec3(
                    0.003,
                    0.004,
                    0.010
          );

// submerged blue
vec3 blue =
         vec3(
                    0.02,
                    0.06,
                    0.16
          );

// subtle cyan energy
vec3 cyan =
         vec3(
                    0.03,
                    0.11,
                    0.20
          );

/*
====================
PRESSURE BASINS
====================
*/

float resinMask =
         smoothstep(
                    0.35,
                    0.85,
                    basin
          );

vec3 color =
         mix(
                    deep,
                    blue,
                    resinMask * 0.65
          );

color =
         mix(
                    color,
                    cyan,
                    channels * 0.08
          );

// carve black depth
color *=
         1.0 -
         pow(
              1.0 - resinMask,
              2.5
         ) * 0.55;

/*
====================
FRACTURE HIERARCHY
====================
*/

// major gold rivers
float trunkVeins =
       smoothstep(
              0.72,
              0.735,
              fbm(uv * 1.4 + 2.0)
       );

// secondary branches
float branchVeins =
       smoothstep(
              0.76,
              0.775,
              fbm(uv * 5.5 - 4.0)
       );

// micro metallic cracks
float microVeins =
       smoothstep(
              0.82,
              0.826,
              fbm(uv * 13.0 + 7.0)
       );

float fractureMask =
       max(
            trunkVeins,
            branchVeins * 0.7
       );

fractureMask =
       max(
            fractureMask,
            microVeins *
            branchVeins *
            0.5
       );

/*
====================
METALLIC GOLD
====================
*/

vec3 gold =
         vec3(
                    1.0,
                    0.82,
                    0.28
          );

// thick metallic rivers
color +=
         gold *
         trunkVeins *
         0.22;

// secondary branching
color +=
         gold *
         branchVeins *
         0.10;

// micro metallic filaments
color +=
         gold *
         microVeins *
         0.04;

// embedded metallic depth
color *=
         1.0 -
         fractureMask *
         0.08;

/*
====================
GLASS CLEARCOAT
====================
*/

float clearcoat =
       pow(
            1.0 - abs(uv.y - 0.5),
            10.0
       );

// lacquer reflections
color +=
         vec3(1.0) *
         clearcoat *
         0.045;

// subtle polished contrast
color =
       pow(
            color,
            vec3(0.92)
       );

/*
====================
FINAL OUTPUT
====================
*/

gl_FragColor =
       vec4( color, 1.0 );
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
