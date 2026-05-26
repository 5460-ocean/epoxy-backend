// ============================================================
// LUXURY EPOXY WEBGL SHADER — CLEAN STABLE VERSION
// ============================================================

const scene = new THREE.Scene();

const camera = new THREE.OrthographicCamera(
    -1,
    1,
    1,
    -1,
    0.1,
    10
);

camera.position.z = 1;

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(renderer.domElement);

const uniforms = {
    time: { value: 0 },
    resolution: {
        value: new THREE.Vector2(
            window.innerWidth,
            window.innerHeight
        )
    }
};

const material = new THREE.ShaderMaterial({

    uniforms,

    vertexShader: `

        varying vec2 vUv;

        void main() {

            vUv = uv;

            gl_Position = projectionMatrix *
                          modelViewMatrix *
                          vec4(position, 1.0);
        }

    `,

    fragmentShader: `

        precision highp float;

        uniform float u_time;
        uniform vec2 u_resolution;

        // ----------------------------------------------------
        // HASH
        // ----------------------------------------------------

        float hash(vec2 p) {

            return fract(
                sin(dot(p, vec2(127.1,311.7))) *
                43758.5453123
            );
        }

        // ----------------------------------------------------
        // NOISE
        // ----------------------------------------------------

        float noise(vec2 p) {

            vec2 i = floor(p);
            vec2 f = fract(p);

            float a = hash(i);
            float b = hash(i + vec2(1.0,0.0));
            float c = hash(i + vec2(0.0,1.0));
            float d = hash(i + vec2(1.0,1.0));

            vec2 u = f * f * (3.0 - 2.0 * f);

            return mix(a,b,u.x)
                + (c-a) * u.y * (1.0-u.x)
                + (d-b) * u.x * u.y;
        }

        // ----------------------------------------------------
        // FBM
        // ----------------------------------------------------

        float fbm(vec2 p) {

            float v = 0.0;
            float a = 0.5;

            for(int i = 0; i < 6; i++) {

                v += a * noise(p);

                p *= 2.0;
                a *= 0.5;
            }

            return v;
        }

        // ----------------------------------------------------
        // MAIN
        // ----------------------------------------------------

        void main() {

            vec2 uv = gl_FragCoord.xy / u_resolution.xy;

            vec2 p = (uv - 0.5) * 2.0;

            // ------------------------------------------------
            // LARGE FLOW FIELD
            // ------------------------------------------------

            vec2 flow = vec2(
                fbm(p * 0.6 + u_time * 0.03),
                fbm(p * 0.6 - u_time * 0.02 + 8.3)
            );

            p += flow * 1.4;

            vec2 flow2 = vec2(
                fbm(p * 1.2 + 4.1),
                fbm(p * 1.2 - 2.7)
            );

            p += flow2 * 0.25;

            // ------------------------------------------------
            // DEPTH
            // ------------------------------------------------

            float n1 = fbm(p * 1.8);
            float n2 = fbm(p * 3.5 + 5.7);
            float n3 = fbm(p * 7.0);

            // ------------------------------------------------
            // COLORS
            // ------------------------------------------------

            vec3 deep  = vec3(0.01, 0.015, 0.03);
            vec3 blue  = vec3(0.03, 0.08, 0.18);
            vec3 cyan  = vec3(0.02, 0.12, 0.16);
            vec3 basin = vec3(0.002, 0.003, 0.006);

            vec3 color = mix(
                deep,
                blue,
                n1 * 0.45
            );

            color = mix(
                color,
                cyan,
                n2 * 0.12
            );

            color = mix(
                color,
                basin,
                pow(n3, 2.0) * 0.45
            );

            // ------------------------------------------------
            // GOLD FRACTURES
            // ------------------------------------------------

            float trunkVeins = smoothstep(
                0.93,
                0.985,
                fbm(p * 2.0)
            );

            float branchVeins = smoothstep(
                0.94,
                0.992,
                fbm(p * 7.0)
            );

            float metallicFilament = max(
                trunkVeins,
                branchVeins * trunkVeins
            );

            metallicFilament = pow(
                metallicFilament,
                4.0
            );

            vec3 gold = vec3(
                1.0,
                0.82,
                0.32
            );

            color += gold * trunkVeins * 0.12;

            color += gold *
                    metallicFilament *
                    0.08;

            color *= 1.0 -
                    metallicFilament *
                    0.04;

            // ------------------------------------------------
            // CLEARCOAT
            // ------------------------------------------------

            float fresnel = pow(
                1.0 - abs(p.y),
                3.0
            );

            color += vec3(1.0) *
                    fresnel *
                    0.06;

            // ------------------------------------------------
            // FINAL
            // ------------------------------------------------

            color = pow(
                color,
                vec3(0.92)
            );

            gl_FragColor = vec4(color, 1.0);
        }
        }

    `
});

const geometry = new THREE.PlaneGeometry(2, 2);

const mesh = new THREE.Mesh(
    geometry,
    material
);

scene.add(mesh);

function animate(t) {

    requestAnimationFrame(animate);

    uniforms.time.value = t * 0.001;

    renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    uniforms.resolution.value.set(
        window.innerWidth,
        window.innerHeight
    );
});
