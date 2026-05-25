const canvas =
    document.getElementById("glcanvas");

const gl =
    canvas.getContext("webgl");

const scale = 0.65;

canvas.width =
    window.innerWidth * scale;

canvas.height =
    window.innerHeight * scale;

gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
);

const vertexShaderSource = `
attribute vec2 aPosition;

varying vec2 vUv;

void main(){

    vUv =
        aPosition * 0.5 + 0.5;

    gl_Position =
        vec4(aPosition,0.0,1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform float uTime;

varying vec2 vUv;

float hash(vec2 p){

    return fract(
        sin(
            dot(
                p,
                vec2(127.1,311.7)
            )
        ) * 43758.5453123
    );
}

float noise(vec2 p){

    vec2 i = floor(p);
    vec2 f = fract(p);

    f =
        f * f *
        (3.0 - 2.0 * f);

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

    for(int i=0;i<4;i++){

        v += noise(p) * a;

        p *= 2.0;

        a *= 0.5;
    }

    return v;
}

void main(){

    vec2 uv = vUv - 0.5;

    uv.x *= 0.8;

    float t =
        uTime * 0.55;

    vec2 p =
        uv * 3.0;

float slab =
    fbm(
        uv * 0.22
    );

slab =
    smoothstep(
        0.28,
        0.78,
        slab
    );


    p += vec2(
        t * 1.4,
       -t * 0.55
    );

    vec2 velocity =
        vec2(0.0);

    for(int i=0;i<6;i++){

        vec2 flow =
            vec2(
                fbm(
                    p * 0.35 +
                    velocity
                ),
                fbm(
                    p * 0.35 +
                    velocity +
                    8.0
                )
            ) - 0.5;

        flow += vec2(
            -flow.y,
             flow.x
        ) * 0.65;

        velocity =
            mix(
                velocity,
                flow,
                0.08
            );

        p += velocity * 0.22;
    }

    
vec2 advected =
        p +
        velocity * 2.4;

    vec2 warp =
        vec2(
            fbm(
                advected * 0.6
            ),
            fbm(
                advected * 0.6 +
                12.0
            )
        ) - 0.5;

    advected +=
        warp * 1.8;

    vec2 heavyFlow =
        vec2(
            fbm(
                advected * 0.18
            ),
            fbm(
                advected * 0.18 +
                20.0
            )
        ) - 0.5;

    advected +=
        
heavyFlow * 1.4;

    advected +=
        normalize(
            warp + 0.001
        ) * 0.32;
;

    float n =
        fbm(
            advected * 0.9
        );

    n =
        pow(
            n,
            1.35
        );


    float depth =
        fbm(
            p * 0.45 +
            n
        );

    

float micro =
    fbm(
        advected * 4.5 +
        uTime * 0.12
    );

float compress =

        fbm(
            p * 0.22
        );

    p += vec2(
        
compress * 0.18 +
    micro * 0.008
,
       -compress * 0.08
    );

    
float deepCurrent =
    fbm(
        advected * 0.05 -
        uTime * 0.04
    );


float density =
    smoothstep(
        0.52,
        0.82,
        n
    );

n =
    mix(
        n,
        slab,
        0.22
    );

float ridgeLarge =
    abs(
        (n + deepCurrent * 0.12) - depth
    );

ridgeLarge =
    smoothstep(
        0.002,
        0.018,
        ridgeLarge
    );

float ridgeMedium =
    abs(
        (n * 1.2) - depth
    );

ridgeMedium =
    smoothstep(
        0.001,
        0.010,
        ridgeMedium
    );

float ridgeSmall =
    abs(
        fbm(
            advected * 2.8
        ) - depth
    );

ridgeSmall =
    smoothstep(
        0.0005,
        0.004,
        ridgeSmall
    );

float branchMask =
    fbm(
        advected * 0.45
    );

branchMask =
    smoothstep(
        0.42,
        0.82,
        branchMask
    );

float ridge =
    ridgeLarge * 1.0 +
    ridgeMedium * branchMask * 0.42 +
    ridgeSmall * branchMask * 0.08;

ridge =
    smoothstep(
        0.188,
        0.1895,
        ridge
    );

ridge =
    smoothstep(
        0.001,
        0.012,
        ridge
    );

ridge =
    pow(
        ridge,
        4.6
    );





float fracture =
    smoothstep(
        0.82,
        0.92,
        ridge
    );

fracture =
    pow(
        fracture,
        3.0
    );



float filament =
    pow(
        ridge,
        42.0
    );

float metallicFilament =
    smoothstep(
        0.92,
        1.0,
        filament
    );

float metallicCore =
    pow(
        ridge,
        18.0
    );

float metallicEdge =
    pow(
        ridge,
        5.5
    );

float absorption =
    smoothstep(
        0.15,
        0.85,
        n
    );

vec3 deep =

        vec3(
            0.01,
            0.03,
            0.08
        );

    vec3 blue =
        vec3(
            0.02,
            0.16,
            0.32
        );

    vec3 cyan =
        vec3(
            0.15,
            0.42,
            0.72
        );

    vec3 basin =
        vec3(
            0.55,
            0.74,
            0.82
        );

    
deep *=
    mix(
        1.4,
        0.55,
        absorption
    );

vec3 color =

        mix(
            deep,
            blue,
            n
        );

    color =
        mix(
            color,
            cyan,
            smoothstep(
                0.35,
                0.9,
                depth
            )
        );

    color =
        mix(
            color,
            basin,
            smoothstep(
                0.72,
                1.0,
                depth
            ) * 0.35
        );

    vec3 gold =
        vec3(
            1.0,
            0.82,
            0.35
        );

    float goldMask =
        ridge *
        smoothstep(
            0.48,
            0.82,
            n
        );

    color =
        mix(
            color,
            gold,
            


goldMask *
pow(
    ridge,
    3.8
) *

pow(
    ridge,
    3.8
) *


pow(
    ridge,
    2.8
) * 3.8


        );

    
float gloss =
    pow(
        ridge,
        3.5
    );

float glow =

        pow(
            smoothstep(
                0.45,
                1.0,
                n
            ),
            5.0
        );

    color +=
        (glow + gloss * 1.8) *
        vec3(
            0.2,
            0.35,
            0.55
        ) * 0.08;

    
color *=
    1.0 -
    ridgeLarge * 0.22;

color -=
    ridgeMedium * 0.045;



float clearcoat =
    pow(
        1.0 - abs(uv.y),
        8.0
    );

float specular =
    pow(
        max(
            ridge,
            0.0
        ),
        22.0
    );

color +=
    vec3(1.0) *
    clearcoat *
    0.025;

color +=
    vec3(1.0,0.92,0.72) *
    specular *
    0.06;




float shadowVein =
    pow(
        ridge,
        2.2
    );

color -=
    vec3(0.02,0.03,0.05) *
    shadowVein *
    0.65;




float sharpGloss =
    pow(
        max(
            ridge,
            0.0
        ),
        38.0
    );

color +=
    vec3(1.0,0.98,0.94) *
    sharpGloss *
    0.12;




color =
    pow(
        color,
        vec3(1.35)
    );




color =
    clamp(
        color,
        0.0,
        1.0
    );

color =
    pow(
        color,
        vec3(1.8)
    );




float lacquer =
    pow(
        1.0 - abs(uv.y * 0.8),
        24.0
    );

color +=
    vec3(1.0) *
    lacquer *
    0.035;




float resinDepth =
    smoothstep(
        0.18,
        0.82,
        depth
    );

color *=
    mix(
        0.55,
        1.0,
        resinDepth
    );




float lacquerBand =
    pow(
        1.0 -
        abs(
            uv.y + 0.15
        ),
        48.0
    );

color +=
    vec3(1.0) *
    lacquerBand *
    0.025;




float blackVein =
    pow(
        ridge,
        5.0
    );

color -=
    vec3(0.03,0.04,0.06) *
    blackVein *
    0.85;




float microSpec =

    pow(
        ridge,
        90.0
    );

color +=

    gold *

    microSpec *

    0.25;

color =
    pow(
        color,
        vec3(1.18)
    );

color *= 1.08;




color *=
    vec3(
        0.72,
        0.82,
        0.95
    );




float filamentLine =

    smoothstep(
        0.9985,
        0.9995,
        ridge
    );

color +=

    gold *

    filamentLine *

    0.85;


gl_FragColor =

        vec4(color,1.0);
}
`;

function compile(type, source){

    const shader =
        gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    if(
        !gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        )
    ){

        alert(
            gl.getShaderInfoLog(shader)
        );

        return null;
    }

    return shader;
}

const vs =
    compile(
        gl.VERTEX_SHADER,
        vertexShaderSource
    );

const fs =
    compile(
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
    );

const program =
    gl.createProgram();

gl.attachShader(program,vs);
gl.attachShader(program,fs);

gl.linkProgram(program);

gl.useProgram(program);

const vertices =
    new Float32Array([
        -1,-1,
         1,-1,
        -1, 1,
        -1, 1,
         1,-1,
         1, 1
    ]);

const buffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
);

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

gl.enableVertexAttribArray(
    aPosition
);

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

function render(time){

    time *= 0.001;

    gl.uniform1f(
        uTime,
        time
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        6
    );

    requestAnimationFrame(
        render
    );
}

requestAnimationFrame(render);

if(
    !gl.getProgramParameter(
        program,
        gl.LINK_STATUS
    )
){
    alert(
        gl.getProgramInfoLog(program)
    );
}
