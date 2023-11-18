import { Color, OrthographicCamera, Scene, WebGLRenderer } from 'three';
import './style.css';

const res = 800;
const scene = new Scene();
const camera = new OrthographicCamera( -res / 2, res / 2, res / 2, -res / 2, 1, 1000 );

const renderer = new WebGLRenderer( { antialias: true } );
renderer.setSize( res, res );
document.body.appendChild( renderer.domElement );

scene.background = new Color( 'rgb(34, 30, 27)' );

renderer.setAnimationLoop( () => { renderer.render( scene, camera ); } );
