import * as THREE from 'three';
import { Timer } from 'three/addons/misc/Timer.js';
import GUI from 'lil-gui';
import { Sky } from 'three/addons/objects/Sky.js';
import Controls from './controls';
import Displace from './displacement';
import Stats from 'three/examples/jsm/libs/stats.module.js';

let controls, renderer, scene, camera, stats;

export function init() {
    // Canvas
    const canvas = document.querySelector('canvas.webgl');

    // Scene
    scene = new THREE.Scene();

    // Debug
    const gui = new GUI();

    // Stats
    stats = new Stats();
    document.body.appendChild(stats.dom);


    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader();

    //Floor
    const floorAlphaTexture = textureLoader.load('./floor/alpha.jpg');
    const floorColorTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg');
    const floorARMTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg');
    const floorNormalTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg');
    

    floorARMTexture.repeat.set(20,20);
    floorNormalTexture.repeat.set(20,20);
    floorColorTexture.repeat.set(20,20);
    floorColorTexture.wrapS = THREE.RepeatWrapping;
    floorColorTexture.wrapT = THREE.RepeatWrapping;
    floorARMTexture.wrapS = THREE.RepeatWrapping;
    floorARMTexture.wrapT = THREE.RepeatWrapping;
    floorNormalTexture.wrapS = THREE.RepeatWrapping;
    floorNormalTexture.wrapT = THREE.RepeatWrapping;


    floorColorTexture.colorSpace = THREE.SRGBColorSpace;


    // Axes Helper
    const axisHelper = new THREE.AxesHelper(5);
    scene.add(axisHelper);


    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(200,200,100,100),
        new THREE.MeshStandardMaterial({
            transparent: true,
            map: floorColorTexture,
            aoMap: floorARMTexture,
            roughnessMap: floorARMTexture,
            metalnessMap: floorARMTexture,
            normalMap: floorNormalTexture,
            wireframe: true
        })
    );
    floor.rotation.x = - Math.PI/2;
    const floorDispTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/dispMap.png', (texture) => {
        Displace(floor.geometry, texture, 100, -.2);
    });
    scene.add(floor);
    



    /**
     * Lights
     */
    // Ambient light
    const ambientLight = new THREE.AmbientLight('#86cdff', 2);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight('#86cdff', 1);
    directionalLight.position.set(3, 2, -8);
    // scene.add(directionalLight);







    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    window.addEventListener('resize', () =>
    {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    });





    /**
     * Camera
     */
    // Base camera
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
    camera.position.x = 0;
    camera.position.y = 10;
    camera.position.z = 0;
    scene.add(camera);




    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
        canvas: canvas
    });
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


    // Controls
    const collidables = [floor];
    controls = new Controls(camera, document.body, collidables);
    


    /**
     * Sky
     */
    const sky = new Sky();
    sky.scale.set(200,100,200);
    sky.position.y = 50;
    scene.add(sky);

    sky.material.uniforms['turbidity'].value = 1;
    sky.material.uniforms['rayleigh'].value = 3;
    sky.material.uniforms['mieCoefficient'].value = 0.1;
    sky.material.uniforms['mieDirectionalG'].value = 0.95;
    sky.material.uniforms['sunPosition'].value.set(1, 3, 10);

    gui.add(sky.material.uniforms['turbidity'], 'value').min(0).max(20).step(0.1).name('Turbidity');
    gui.add(sky.material.uniforms['rayleigh'], 'value').min(0).max(10).step(0.1).name('Rayleigh');  
    gui.add(sky.material.uniforms['mieCoefficient'], 'value').min(0).max(0.1).step(0.001).name('Mie Coefficient');  
    gui.add(sky.material.uniforms['mieDirectionalG'], 'value').min(0).max(1).step(0.001).name('Mie Directional G'); 
    gui.add(sky.material.uniforms['sunPosition'].value, 'x').min(-10).max(10).step(0.1).name('Sun X');  
    gui.add(sky.material.uniforms['sunPosition'].value, 'y').min(-10).max(10).step(0.1).name('Sun Y');  
    gui.add(sky.material.uniforms['sunPosition'].value, 'z').min(-10).max(10).step(0.1).name('Sun Z');  


    /**
     * Fog
     */
    // scene.fog = new THREE.Fog('#ff0000', 10, 13)
    // scene.fog = new THREE.FogExp2('#02343f', .01);

}

/**
 * Animate
 */
const timer = new Timer();
export function animate()
{
    // Stats
    stats.begin();

    // Timer
    timer.update();

    const elapsedTime = timer.getElapsed();
    const deltaTime = timer.getDelta();

    // Update Controls
    controls.update(deltaTime);

    // Render
    renderer.render(scene, camera);

    stats.end();

    // Call tick again on the next frame
    window.requestAnimationFrame(animate);
}

export { controls };
export { scene };
