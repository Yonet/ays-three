import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let group;
let container, stats;
const particlesData = [];
let camera, scene, renderer;
let positions, colors;
let particles;
let pointCloud;
let particlePositions;
let linesMesh;

const maxParticleCount = 1000;
let particleCount = 500;
const r = 800;
const rHalf = r / 2;

const effectController = {
    showDots: true,
    showLines: true,
    minDistance: 150,
    limitConnections: false,
    maxConnections: 20,
    particleCount: 500
};

init();
animate();

function initGUI () {

    const gui = new GUI();

    gui.add( effectController, 'showDots' ).onChange( function ( value ) {

        pointCloud.visible = value;

    } );
    gui.add( effectController, 'showLines' ).onChange( function ( value ) {

        linesMesh.visible = value;

    } );
    gui.add( effectController, 'minDistance', 10, 300 );
    gui.add( effectController, 'limitConnections' );
    gui.add( effectController, 'maxConnections', 0, 30, 1 );
    gui.add( effectController, 'particleCount', 0, maxParticleCount, 1 ).onChange( function ( value ) {

        particleCount = value;
        particles.setDrawRange( 0, particleCount );

    } );

}

function init () {

    initGUI();

    container = document.getElementById( 'app' );

    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    camera.position.z = 1750;

    const controls = new OrbitControls( camera, container );
    controls.minDistance = 1000;
    controls.maxDistance = 3000;

    scene = new THREE.Scene();


    group = new THREE.Group();
    scene.add( group );

    const helper = new THREE.BoxHelper( new THREE.Mesh( new THREE.BoxGeometry( r, r, r ) ) );
    helper.material.color.setHex( 0x474790 );
    helper.material.blending = THREE.AdditiveBlending;
    helper.material.transparent = true;
    group.add( helper );

    const segments = maxParticleCount * maxParticleCount;//1000000

    positions = new Float32Array( segments * 3 );
    colors = new Float32Array( segments * 3 );

    // Vertex Colors
    const color = new THREE.Color();
    const arrayBuffer = new ArrayBuffer( particles * 16 );

    // the following typed arrays share the same buffer
    const interleavedFloat32Buffer = new Float32Array( arrayBuffer );
    const interleavedUint8Buffer = new Uint8Array( arrayBuffer );

    const interleavedBuffer8 = new THREE.InterleavedBuffer( interleavedUint8Buffer, 16 );
    const n = 800, n2 = n / 2; // particles spread in the cube

    for ( let i = 0; i < interleavedFloat32Buffer.length; i += 4 ) {

        // position (first 12 bytes)

        const x = Math.random() * n - n2;
        const y = Math.random() * n - n2;
        const z = Math.random() * n - n2;

        interleavedFloat32Buffer[i + 0] = x;
        interleavedFloat32Buffer[i + 1] = y;
        interleavedFloat32Buffer[i + 2] = z;

        // color (last 4 bytes)

        const vx = ( x / n ) + 0.5;
        const vy = ( y / n ) + 0.5;
        const vz = ( z / n ) + 0.5;

        color.setRGB( vx, vy, vz, THREE.SRGBColorSpace );

        const j = ( i + 3 ) * 4;

        interleavedUint8Buffer[j + 0] = color.r * 255;
        interleavedUint8Buffer[j + 1] = color.g * 255;
        interleavedUint8Buffer[j + 2] = color.b * 255;
        interleavedUint8Buffer[j + 3] = 0; // not needed

    }

    /////////////////////////

    particles = new THREE.BufferGeometry();
    particlePositions = new Float32Array( maxParticleCount * 3 );
    // const particleColors = new Float32Array( maxParticleCount * 3 );

    for ( let i = 0; i < maxParticleCount; i++ ) {

        const x = Math.random() * r - r / 2;
        const y = Math.random() * r - r / 2;
        const z = Math.random() * r - r / 2;
        // console.log( 'x,y,z', x, y, z );
        particlePositions[i * 3] = x;
        particlePositions[i * 3 + 1] = y;
        particlePositions[i * 3 + 2] = z;
        // console.log( 'particlePositions', particlePositions );
        // add it to the geometry
        particlesData.push( {
            velocity: new THREE.Vector3( - 1 + Math.random() * 2, - 1 + Math.random() * 2, - 1 + Math.random() * 2 ),
            numConnections: 0
        } );

        colors[i * 3] = ( ( x / r ) + 0.5 );
        colors[i * 3 + 1] = ( ( y / r ) + 0.5 );
        colors[i * 3 + 2] = ( ( z / r ) + 0.5 );

    }
    particles.setDrawRange( 0, particleCount );
    particles.setAttribute( 'position', new THREE.BufferAttribute( particlePositions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
    particles.setAttribute( 'color', new THREE.InterleavedBufferAttribute( interleavedBuffer8, 3, 12, true ) );


    const pMaterial = new THREE.PointsMaterial( {
        color: 0xFccFFF,
        size: 15,
        blending: THREE.AdditiveBlending,
        transparent: true,
        // vertexColors: true
    } );

    // create the particle system
    pointCloud = new THREE.Points( particles, pMaterial );
    group.add( pointCloud );

    const geometry = new THREE.BufferGeometry();

    geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ).setUsage( THREE.DynamicDrawUsage ) );
    geometry.setAttribute( 'color', new THREE.BufferAttribute( colors, 3 ).setUsage( THREE.DynamicDrawUsage ) );
    // geometry.setAttribute( 'color', new THREE.InterleavedBufferAttribute( interleavedBuffer8, 3, 12, true ) );
    geometry.computeBoundingSphere();

    geometry.setDrawRange( 0, 0 );

    const material = new THREE.LineBasicMaterial( {
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true
    } );

    linesMesh = new THREE.LineSegments( geometry, material );
    group.add( linesMesh );

    //

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );

    //

    stats = new Stats();
    container.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate () {

    let vertexpos = 0;
    let colorpos = 0;
    let numConnected = 0;

    for ( let i = 0; i < particleCount; i++ )
        particlesData[i].numConnections = 0;

    for ( let i = 0; i < particleCount; i++ ) {

        // get the particle
        const particleData = particlesData[i];

        particlePositions[i * 3] += particleData.velocity.x;
        particlePositions[i * 3 + 1] += particleData.velocity.y;
        particlePositions[i * 3 + 2] += particleData.velocity.z;

        if ( particlePositions[i * 3 + 1] < - rHalf || particlePositions[i * 3 + 1] > rHalf )
            particleData.velocity.y = - particleData.velocity.y;

        if ( particlePositions[i * 3] < - rHalf || particlePositions[i * 3] > rHalf )
            particleData.velocity.x = - particleData.velocity.x;

        if ( particlePositions[i * 3 + 2] < - rHalf || particlePositions[i * 3 + 2] > rHalf )
            particleData.velocity.z = - particleData.velocity.z;

        if ( effectController.limitConnections && particleData.numConnections >= effectController.maxConnections )
            continue;

        // Check collision
        for ( let j = i + 1; j < particleCount; j++ ) {

            const particleDataB = particlesData[j];
            if ( effectController.limitConnections && particleDataB.numConnections >= effectController.maxConnections )
                continue;

            const dx = particlePositions[i * 3] - particlePositions[j * 3];
            const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
            const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
            const dist = Math.sqrt( dx * dx + dy * dy + dz * dz );

            if ( dist < effectController.minDistance ) {

                particleData.numConnections++;
                particleDataB.numConnections++;

                const alpha = 1.0 - dist / effectController.minDistance;

                positions[vertexpos++] = particlePositions[i * 3];
                positions[vertexpos++] = particlePositions[i * 3 + 1];
                positions[vertexpos++] = particlePositions[i * 3 + 2];

                positions[vertexpos++] = particlePositions[j * 3];
                positions[vertexpos++] = particlePositions[j * 3 + 1];
                positions[vertexpos++] = particlePositions[j * 3 + 2];

                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;

                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;
                colors[colorpos++] = alpha;

                numConnected++;

            }

        }

    }


    linesMesh.geometry.setDrawRange( 0, numConnected * 2 );
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    pointCloud.geometry.attributes.position.needsUpdate = true;

    requestAnimationFrame( animate );

    stats.update();
    render();

}

function render () {

    const time = Date.now() * 0.001;

    group.rotation.y = time * 0.1;
    renderer.render( scene, camera );

}
