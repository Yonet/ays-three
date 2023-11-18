import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, DirectionalLight } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';

// Set up scene, camera, renderer
// Import js

// Set up scene, camera, and renderer
const scene = new Scene();
const camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 5;
const renderer = new WebGLRenderer();
const controls = new OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Create a non-Euclidean box
const boxGeometry = new BoxGeometry( 1, 1, 1 );
const materials = [
    new MeshBasicMaterial( { color: 0xff0000 } ), // Right face
    new MeshBasicMaterial( { color: 0x00ff00 } ), // Left face
    new MeshBasicMaterial( { color: 0x0000ff } ), // Top face
    new MeshBasicMaterial( { color: 0xffff00 } ), // Bottom face
    new MeshBasicMaterial( { color: 0xff00ff } ), // Front face
    new MeshBasicMaterial( { color: 0x00ffff } ), // Back face
];
const box = new Mesh( boxGeometry, materials );
box.position.set( 0, 0, -5 );
// camera.lookAt( box.position );
scene.add( box );

controls.update();

const light = new DirectionalLight( 0xffffff, 1 );
scene.add( light );

// Set up cameras for each face of the box
const cameras = [
    new PerspectiveCamera( 90, 1, 0.1, 1000 ), // Right
    new PerspectiveCamera( 90, 1, 0.1, 1000 ), // Left
    new PerspectiveCamera( 90, 1, 0.1, 1000 ), // Top
    new PerspectiveCamera( 90, 1, 0.1, 1000 ), // Bottom
    new PerspectiveCamera( 90, 1, 0.1, 1000 ), // Front
    new PerspectiveCamera( 90, 1, 0.1, 1000 ), // Back
];

// Set camera positions for each face
cameras[0].position.set( 1, 0, 0 ); // Right
cameras[1].position.set( -1, 0, 0 ); // Left
cameras[2].position.set( 0, 1, 0 ); // Top
cameras[3].position.set( 0, -1, 0 ); // Bottom
cameras[4].position.set( 0, 0, 1 ); // Front
cameras[5].position.set( 0, 0, -1 ); // Back

// Animation loop
const animate = function () {
    requestAnimationFrame( animate );

    // Rotate the entire box
    box.rotation.x += 0.01;
    box.rotation.y += 0.01;
    controls.update();

    // Render each face of the box with its respective camera
    for ( let i = 0; i < 6; i++ ) {
        renderer.setRenderTarget( null );
        renderer.setViewport( i * window.innerWidth / 6, 0, window.innerWidth / 6, window.innerHeight );
        renderer.render( scene, cameras[i] );
    }
};

// Handle window resize
window.addEventListener( 'resize', function () {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();


    renderer.setSize( newWidth, newHeight );
} );

// Run the animation loop
animate();
