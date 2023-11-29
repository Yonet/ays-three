import { AnimationClip, AnimationMixer, BoxGeometry, Clock, Color, DirectionalLight, Mesh, MeshBasicMaterial, MeshStandardMaterial, PMREMGenerator, PerspectiveCamera, PointLight, Scene, Vector3, VectorKeyframeTrack, WebGLRenderer } from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { GUI } from 'three/examples/jsm/libs/dat.gui.module.js';

import { MeshPhongMaterial } from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
let textMesh;
let mixer;

const clock = new Clock();
const scene = new Scene();

scene.background = new Color( 0xbfe3dd );
const camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( 0, 0, 120 );
const renderer = new WebGLRenderer( { antialias: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );

const pmremGenerator = new PMREMGenerator( renderer );
scene.environment = pmremGenerator.fromScene( new RoomEnvironment( renderer ), 0.04 ).texture;


document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.enablePan = false;
controls.enableDamping = true;
controls.target.set( 0, 1, 0 );
// LIGHTS

const dirLight = new DirectionalLight( 0xffffff, 0.4 );
dirLight.position.set( 0, 0, 1 ).normalize();
scene.add( dirLight );

const pointLight = new PointLight( 0xffffff, 4.5, 0, 0 );
pointLight.color.setHSL( Math.random(), 1, 0.5 );
pointLight.position.set( 0, 100, 90 );
scene.add( pointLight );

const materials = [
    new MeshStandardMaterial( { color: 0xffffff } ),
    new MeshPhongMaterial( { color: 0xffffff, flatShading: true } ), // front
    new MeshPhongMaterial( { color: 0xffffff } ) // side
];

let boxGeometry = new BoxGeometry( 1, 1, 1 );
let box: Mesh = new Mesh( boxGeometry, materials[0] );
scene.add( box );


loadFont();

// Create an animation for the mesh.
// const animationClip = new AnimationClip();
// animationClip.addTrack(
//     new VectorKeyframeTrack(
//         mesh.position,
//         [0, 1],
//         [
//             new Vector3( 0, 0, 0 ),
//             new Vector3( 0, 0, 10 ),
//         ]
//     )
// );
const animationMixer = new AnimationMixer( textMesh );
const kf = new VectorKeyframeTrack(
    'textMesh.position',
    [0, 1],
    [
        0, 0, 0, 0, 0, 10
    ]
);

// Create an animation mixer.
// const animationMixer = new AnimationMixer( mesh );

// Add the animation clip to the animation mixer.
// animationMixer.addClip( animationClip );

// // Play the animation.
// animationMixer.play( animationClip );

function animate () {
    requestAnimationFrame( animate );
    const delta = clock.getDelta();



    // Update the animation mixer.
    // animationMixer.update( renderer.renderClock.getDelta() );
    controls.update();
    renderer.render( scene, camera );
}
animate();

function onWindowResize () {

    const windowHalfX = window.innerWidth / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function loadFont () {

    const loader = new FontLoader();
    loader.load( 'src/assets/fonts/optimer_regular.typeface.json', function ( response ) {

        refreshText( response );

    } );

}

function refreshText ( font ) {
    // Create a text geometry using the TextGeometry class.
    const textGeometry = new TextGeometry( "Your Logo", {
        font: font,
        size: 10,
        height: 1,
    } );

    textGeometry.computeBoundingBox();
    const centerOffset = - 0.5 * ( textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x );
    textMesh = new Mesh( textGeometry, materials[0] );

    textMesh.position.x = centerOffset;
    textMesh.position.y = 0;
    textMesh.position.z = 0;

    scene.add( textMesh );

}
