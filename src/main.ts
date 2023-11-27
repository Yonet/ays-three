import { createNoise2D } from 'simplex-noise';
import { ACESFilmicToneMapping, BoxGeometry, Color, CylinderGeometry, DoubleSide, FloatType, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, PCFSoftShadowMap, PMREMGenerator, PerspectiveCamera, PointLight, SRGBColorSpace, Scene, SphereGeometry, TextureLoader, Vector2, WebGLRenderer } from 'three';
import { OrbitControls, RGBELoader } from 'three/examples/jsm/Addons.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

const textureLoader = new TextureLoader();
const maxHexHeight = 10;
const stoneHeight = maxHexHeight * 0.8;
const dirtHeight = maxHexHeight * 0.7;
const grassHeight = maxHexHeight * 0.5;
const sandHeight = maxHexHeight * 0.3;
const dirt2Height = maxHexHeight * 0;

let dirtGeo: any = new BoxGeometry( 0, 0, 0 );
let dirt2Geo: any = new BoxGeometry( 0, 0, 0 );
let grassGeo: any = new BoxGeometry( 0, 0, 0 );
let sandGeo: any = new BoxGeometry( 0, 0, 0 );
let stoneGeo: any = new BoxGeometry( 0, 0, 0 );

const scene = new Scene();
scene.background = new Color( "#FFEECC" );

const camera = new PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set( -17, 31, 33 );

const renderer = new WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.toneMapping = ACESFilmicToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = PCFSoftShadowMap;
document.body.appendChild( renderer.domElement );

// Lights
const pointLight = new PointLight( new Color( "#FFCB8E" ).convertSRGBToLinear().convertSRGBToLinear(), 500 * Math.PI, 200 );
pointLight.position.set( 10, 20, 10 );
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 512 * Math.PI;
pointLight.shadow.mapSize.height = 512 * Math.PI;
pointLight.shadow.camera.near = 0.5;
pointLight.shadow.camera.far = 500;
scene.add( pointLight );

// Controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 0, 0 );
controls.dampingFactor = 0.05;
controls.enableDamping = true;

let envTexture = await new RGBELoader().setDataType( FloatType ).loadAsync( '/public/envmap.hdr' );
let pmRem = new PMREMGenerator( renderer );
let envmap = pmRem.fromEquirectangular( envTexture ).texture;

// let sphereMesh = new Mesh(
//     new SphereGeometry( 5, 10, 10 ),
//     new MeshStandardMaterial( {
//         envMap: envmap,
//         roughness: 0,
//         metalness: 1,
//     } ) );

// scene.add( sphereMesh );

const textures = [
    await textureLoader.loadAsync( '/public/dirt.png' ),
    await textureLoader.loadAsync( '/public/dirt2.jpg' ),
    await textureLoader.loadAsync( '/public/grass.jpg' ),
    await textureLoader.loadAsync( '/public/sand.jpg' ),
    await textureLoader.loadAsync( '/public/stone.png' ),
    await textureLoader.loadAsync( '/public/water.jpg' ),
];

// Create Hexagons
const noise2D = createNoise2D();

for ( let i = -10; i <= 10; i++ ) {
    for ( let j = -10; j <= 10; j++ ) {
        let pos = tileToPosition( i, j );
        if ( pos.length() > 16 ) continue;

        let noise = ( noise2D( i * 0.1, j * 0.1 ) + 1 ) * 0.5;
        createHex( noise * maxHexHeight, pos );
    }
}

// let hexagonMesh = new Mesh(
//     hexagonGeometries,
//     new MeshStandardMaterial( {
//         envMap: envmap,
//         flatShading: true,
//     } ) );
// scene.add( hexagonMesh );

let dirtMesh = createHexMesh( dirtGeo, textures[0] );
let dirt2Mesh = createHexMesh( dirt2Geo, textures[1] );
let grassMesh = createHexMesh( grassGeo, textures[2] );
let sandMesh = createHexMesh( sandGeo, textures[3] );
let stoneMesh = createHexMesh( stoneGeo, textures[4] );

let seaMesh = new Mesh(
    new CylinderGeometry( 17, 17, maxHexHeight * 0.2, 50 ),
    new MeshPhysicalMaterial( {
        envMap: envmap,
        color: new Color( "#55aaff" ).convertSRGBToLinear().multiplyScalar( 3 ),
        ior: 1.4,
        transmission: 1,
        transparent: true,
        thickness: 1.5,
        envMapIntensity: 0.2,
        roughness: 1,
        metalness: 0.025,
        roughnessMap: textures[5],
        metalnessMap: textures[5],
    } )
);
seaMesh.receiveShadow = true;
seaMesh.position.y = maxHexHeight * 0.1;

let mapContainer = new Mesh(
    new CylinderGeometry( 17.1, 17.1, maxHexHeight * 0.25, 50, 1, true ),
    new MeshPhysicalMaterial( {
        envMap: envmap,
        map: textures[0],
        envMapIntensity: 0.2,
        side: DoubleSide
    } )
);

let mapFloor = new Mesh(
    new CylinderGeometry( 18.5, 18.5, maxHexHeight * 0.1, 50 ),
    new MeshPhysicalMaterial( {
        envMap: envmap,
        map: textures[1],
        envMapIntensity: 0.1,
        side: DoubleSide
    } )
);

scene.add( dirtMesh, dirt2Mesh, grassMesh, sandMesh, stoneMesh, seaMesh, mapContainer, mapFloor );

clouds();

function animate () {
    requestAnimationFrame( animate );

    controls.update();
    renderer.render( scene, camera );
}
animate();

function createHexGeometry ( height: number, position: Vector2 ) {

    let geo = new CylinderGeometry( 1, 1, height, 6, 1, false );
    geo.translate( position.x, height * 0.5, position.y );
    return geo;
}

function createHex ( height: number, position: Vector2 ) {
    let geo = createHexGeometry( height, position );
    if ( height > stoneHeight ) {
        stoneGeo = mergeGeometries( [stoneGeo, geo] );
        if ( Math.random() > 0.6 ) {
            stoneGeo = mergeGeometries( [stoneGeo, createStone( height, position )] );
        }
    } else if ( height > dirtHeight ) {
        dirtGeo = mergeGeometries( [dirtGeo, geo] );
        if ( Math.random() > 0.8 ) {
            grassGeo = mergeGeometries( [grassGeo, tree( height, position )] );
        }
    } else if ( height > grassHeight ) {
        grassGeo = mergeGeometries( [grassGeo, geo] );
    } else if ( height > sandHeight ) {
        sandGeo = mergeGeometries( [sandGeo, geo] );
        if ( Math.random() > 0.6 ) {
            stoneGeo = mergeGeometries( [stoneGeo, createStone( height, position )] );
        }
    } else if ( height > dirt2Height ) {
        dirt2Geo = mergeGeometries( [dirt2Geo, geo] );
    }
}

function tileToPosition ( x, y ) {
    // creates the alternating grid pattern
    return new Vector2( ( x + ( y % 2 ) * 0.5 ) * 1.77, y * 1.535 );
}

function createHexMesh ( geo, map ) {
    let mat = new MeshPhysicalMaterial( {
        envMap: envmap,
        envMapIntensity: 0.135,
        flatShading: true,
        map
    } );

    let mesh = new Mesh( geo, mat );
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
};

function createStone ( height, position ) {
    const px = Math.random() * 0.4;
    const pz = Math.random() * 0.4;

    const geo = new SphereGeometry( Math.random() * 0.3 + 0.1, 7, 7 );
    geo.translate( position.x + px, height, position.y + pz );

    return geo;
}

function clouds () {
    let geo: any = new SphereGeometry( 0, 0, 0 );
    let count = Math.floor( Math.pow( Math.random(), 0.45 ) * 10 );

    for ( let i = 0; i < count; i++ ) {
        const puff1 = new SphereGeometry( 1.2, 7, 7 );
        const puff2 = new SphereGeometry( 1.5, 7, 7 );
        const puff3 = new SphereGeometry( 0.9, 7, 7 );

        puff1.translate( -1.85, Math.random() * 0.3, 0 );
        puff2.translate( 0, Math.random() * 0.3, 0 );
        puff3.translate( 1.85, Math.random() * 0.3, 0 );

        const cloudGeo = mergeGeometries( [puff1, puff2, puff3] );
        cloudGeo.translate(
            Math.random() * 20 - 10,
            Math.random() * 7 + 7,
            Math.random() * 20 - 10
        );
        cloudGeo.rotateY( Math.random() * Math.PI * 2 );
        geo = mergeGeometries( [geo, cloudGeo] );
    }

    const mesh = new Mesh(
        geo,
        new MeshStandardMaterial( {
            envMap: envmap,
            envMapIntensity: 0.75,
            flatShading: true,
            transparent: true,
            opacity: 0.85,
        } )
    );

    scene.add( mesh );
}

function tree ( height, position ) {
    const treeHeight = Math.random() * 1 + 1.25;

    const geo = new CylinderGeometry( 0, 1.5, treeHeight, 3 );
    geo.translate( position.x, height + treeHeight * 0 + 1, position.y );

    const geo2 = new CylinderGeometry( 0, 1.15, treeHeight, 3 );
    geo2.translate( position.x, height + treeHeight * 0.6 + 1, position.y );

    const geo3 = new CylinderGeometry( 0, 0.8, treeHeight, 3 );
    geo3.translate( position.x, height + treeHeight * 1.25 + 1, position.y );

    return mergeGeometries( [geo, geo2, geo3] );
}
