import * as THREE from 'three';
import * as CANNON from "cannon";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import OrbitControls from 'three-orbitcontrols';

/* --- Variables --- */
let renderer, scene, camera, light,
    world, blocks, blockBodies;

let loader = new THREE.TextureLoader();

let axes;


/* --- Track Data --- */
const map = [
  	{c:2}, {c:2}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2},
  	{c:2}, {c:1}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2},
  	{c:2}, {c:1}, {c:0}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:0}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:0}, {c:0}, {c:1, s:"ru"}, {c:1}, {c:1}, {c:1}, {c:2},
  	{c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1, s:"ld"}, {c:0}, {}, {c:1, s:"lu"}, {c:0}, {c:1, s:"rd"}, {}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1},
  	{c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:1, s:"ld"}, {c:0}, {c:0}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:0}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:1, s:"ld"}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:1, s:"ld"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:2}, {}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:4}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1, s:"ru"}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:4}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:1, s:"ru"}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:1, s:"ru"}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"ld"}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:0}, {c:1},
  	{c:2}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:1}, {c:2}
  ]


/* -------------   Functions  ------------- */
/* ---  Initialize CANNON !  --- */
let initCannon = () => {
  world = new CANNON.World();
  world.gravity.set( 0, -9.82, 0 );
  world.broadphase = new CANNON.NaiveBroadphase();
}

/* ---  Initialize THREE !  --- */
let initThree = () => {
  // Initialize renderer
  renderer = new THREE.WebGLRenderer( { antialias:true } ); // renders the edges of shapes more smoothly
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( "black", 1 ); //sets our background to a light gray colour
  document.body.appendChild( renderer.domElement );

  // Initialize scene
  scene = new THREE.Scene();

  // Initialize camera
  camera = new THREE.PerspectiveCamera( 70, window.innerWidth/window.innerHeight, 0.1, 3100); // first param -> the greater the amount of scene the camera will show
  scene.add(camera);
  camera.position.set(200, 0, 50); // move back a bit so we can see the whole obj

  // Initialize light
  scene.add( new THREE.AmbientLight( 0x666666 ) );
	let light = new THREE.DirectionalLight( 0xdfebff, 1 );
	light.position.set( 50, 1000, 100 );
	light.position.multiplyScalar( 1.3 );
	light.castShadow = true;
	light.shadow.mapSize.width = 1024;
	light.shadow.mapSize.height = 1024;
	let d = 300;
	light.shadow.camera.left = - d;
	light.shadow.camera.right = d;
	light.shadow.camera.top = d;
	light.shadow.camera.bottom = - d;
	light.shadow.camera.far = 1000;
	scene.add( light );

  // Add helper
  axes = new THREE.AxisHelper(200);
  // scene.add(axes);
  const controls = new OrbitControls(camera, renderer.domElement);
}

/* ---  Settings for World Objs !  --- */
// SkyBox
function Skybox () {
  this.textures = [];
  this.imgs = [
    "asset/skybox/clouds1_west.bmp", "asset/skybox/clouds1_east.bmp", "asset/skybox/clouds1_up.bmp",
    "asset/skybox/clouds1_down.bmp", "asset/skybox/clouds1_south.bmp", "asset/skybox/clouds1_north.bmp"
  ];
  this.geometry = new THREE.BoxGeometry( 3000, 3000, 3000 );
  this.addSky = () => {
    this.imgs.forEach( img => {
      this.side = loader.load(img);
      this.textures.push( new THREE.MeshBasicMaterial({ map: this.side  }) );
    });
    for(let i = 0; i < 6; i++){
      this.textures[i].side = THREE.BackSide;
    }
    this.sky = new THREE.Mesh( this.geometry, this.textures );
    this.sky.position.y = 300;
    scene.add( this.sky );
  }
}

// Floor
function Floor () {
  // CANNON Part
  this.cannonShape = new CANNON.Plane();
  this.cannonMaterial = new CANNON.Material();
  this.cannonBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, -8, 0),
    shape: this.cannonShape,
    material: this.cannonMaterial
  });
  this.cannonBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1, 0, 0), -2*Math.PI/360*90 );
  // THREE part
  this.threeTexture = loader.load("asset/imgs/tarmac_light.png");
  this.threeTexture.wrapS = this.threeTexture.wrapT = THREE.RepeatWrapping;
  this.threeTexture.repeat.set( 500, 500 );
  this.threeTexture.anisotropy = 16;
  this.threeMaterial = new THREE.MeshLambertMaterial( { map: this.threeTexture } );
  this.floor = new THREE.Mesh( new THREE.PlaneBufferGeometry( 4000, 4000 ), this.threeMaterial );
  this.floor.position.y = - 10;
  this.floor.rotation.x = - Math.PI / 2;
  this.floor.receiveShadow = true;
  // Method
  this.addFloor = () => {
    console.log("add");
    world.add( this.cannonBody );
    scene.add( this.floor );
  }
}

/* ---  Create WORLD !  --- */
let createWorld = () => {
  // Add SkyBox
  let sky = new Skybox;
  sky.addSky();

  // Add Floor
  let floor = new Floor;
  floor.addFloor();

  // Wall


}

/* --- Render it !  --- */
  let render = () => {
    // move();
    // updatePhysicsAll(driver, driverBody);
    // cannonDebugRenderer.update();
    requestAnimationFrame(render);
    renderer.render( scene, camera );
  }

initCannon();
initThree();
createWorld();
render();
