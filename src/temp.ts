import {
    ACESFilmicToneMapping,
    AmbientLight,
    BoxGeometry,
    Clock,
    Color,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Object3D,
    PCFSoftShadowMap,
    PerspectiveCamera,
    PlaneGeometry,
    PointLight,
    Scene,
    WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let renderer: WebGLRenderer;
let camera: PerspectiveCamera;
let scene: Scene;
let controls: OrbitControls;
let materials: MeshBasicMaterial[] = [
    new MeshBasicMaterial( { color: 0xff0000 } ), // Right face
    new MeshBasicMaterial( { color: 0x00ff00 } ), // Left face
    new MeshBasicMaterial( { color: 0x0000ff } ), // Top face
    new MeshBasicMaterial( { color: 0xffff00 } ), // Bottom face
    new MeshBasicMaterial( { color: 0xff00ff } ), // Front face
    new MeshBasicMaterial( { color: 0x00ffff } ), // Back face
];;
let boxGeometry = new BoxGeometry( 1, 1, 1 );
let box: Mesh = new Mesh( boxGeometry, materials );




function init () {
    renderer = new WebGLRenderer( { antialias: true } );
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    scene = new Scene();
    camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.z = 5;

    controls = new OrbitControls( camera, renderer.domElement );

    controls.update();

    scene.add( box );

    animate();
}


function animate () {

    requestAnimationFrame( animate );

    box.rotation.x += 0.01;
    box.rotation.y += 0.01;

    // required if controls.enableDamping or controls.autoRotate are set to true
    controls.update();

    renderer.render( scene, camera );

}

function onWindowResize () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

init();
animate();

window.addEventListener( 'resize', onWindowResize, false );

function addLights () { }
function createBox () {

}
