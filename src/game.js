import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Timer } from 'three/addons/misc/Timer.js'
import GUI from 'lil-gui'
import { Sky } from 'three/addons/objects/Sky.js'
import { FirstPersonControls } from 'three/examples/jsm/Addons.js'

let controls, renderer, scene, camera

export function init() {
    // Canvas
    const canvas = document.querySelector('canvas.webgl')

    // Scene
    scene = new THREE.Scene()

    // Debug
    const gui = new GUI()




    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader()

    //Floor
    const floorAlphaTexture = textureLoader.load('./floor/alpha.jpg')
    const floorColorTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_diff_1k.jpg')
    const floorARMTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_arm_1k.jpg')
    const floorNormalTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_nor_gl_1k.jpg')
    const floorDispTexture = textureLoader.load('./floor/coast_sand_rocks_02_1k/coast_sand_rocks_02_disp_1k.jpg')

    floorARMTexture.repeat.set(8,8)
    floorNormalTexture.repeat.set(8,8)
    floorDispTexture.repeat.set(8,8)
    floorColorTexture.repeat.set(8,8)
    floorColorTexture.wrapS = THREE.RepeatWrapping
    floorColorTexture.wrapT = THREE.RepeatWrapping
    floorARMTexture.wrapS = THREE.RepeatWrapping
    floorARMTexture.wrapT = THREE.RepeatWrapping
    floorNormalTexture.wrapS = THREE.RepeatWrapping
    floorNormalTexture.wrapT = THREE.RepeatWrapping
    floorDispTexture.wrapS = THREE.RepeatWrapping
    floorDispTexture.wrapT = THREE.RepeatWrapping

    floorColorTexture.colorSpace = THREE.SRGBColorSpace


    // Axes Helper
    const axisHelper = new THREE.AxesHelper(5)
    scene.add(axisHelper)


    // Floor
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(20,20,100,100),
        new THREE.MeshStandardMaterial({
            alphaMap: floorAlphaTexture, 
            transparent: true,
            map: floorColorTexture,
            aoMap: floorARMTexture,
            roughnessMap: floorARMTexture,
            metalnessMap: floorARMTexture,
            normalMap: floorNormalTexture,
            displacementMap: floorDispTexture,
            displacementScale: 0.3,
            displacementBias: -.2 
        })
    )
    floor.rotation.x = - Math.PI/2

    scene.add(floor)




    /**
     * Lights
     */
    // Ambient light
    const ambientLight = new THREE.AmbientLight('#86cdff', 0.275)
    scene.add(ambientLight)

    // Directional light
    const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
    directionalLight.position.set(3, 2, -8)
    scene.add(directionalLight)







    /**
     * Sizes
     */
    const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }

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
    })





    /**
     * Camera
     */
    // Base camera
    camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
    camera.position.x = 4
    camera.position.y = 2
    camera.position.z = 5
    scene.add(camera)




    /**
     * Renderer
     */
    renderer = new THREE.WebGLRenderer({
        canvas: canvas
    })
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    // Controls
    controls = new FirstPersonControls(camera, renderer.domElement)
    controls.movementSpeed = .001;
    controls.lookSpeed = 0.0007;

    // controls.enableDamping = true




    /**
     * Sky
     */
    const sky = new Sky()
    sky.scale.set(100,100,100)
    scene.add(sky)

    sky.material.uniforms['turbidity'].value = 10
    sky.material.uniforms['rayleigh'].value = 3
    sky.material.uniforms['mieCoefficient'].value = 0.1
    sky.material.uniforms['mieDirectionalG'].value = 0.95
    sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

    /**
     * Fog
     */
    // scene.fog = new THREE.Fog('#ff0000', 10, 13)
    scene.fog = new THREE.FogExp2('#02343f', 0.1)

}

/**
 * Animate
 */
const timer = new Timer()
export function animate()
{

    // Timer
    timer.update()

    const elapsedTime = timer.getElapsed()
    // Update controls

    controls.update(elapsedTime)

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(animate)
}
