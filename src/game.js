import * as THREE from 'three';
import * as CANNON from "cannon";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import OrbitControls from 'three-orbitcontrols';

/* --- Variables --- */
let renderer, scene, camera, light, world, sky, floor, wall, player, driver;

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
// Car Obj with Car Model
function Car () {
  // Shape related
  this.cannonMaterial = new CANNON.Material();
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 5, 3, 12 ) );
  this.cannonBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(200, 15, 0),
    shape: this.cannonShape,
    material: this.cannonMaterial
  });

  // States
  this.move = "stop";
  this.accelaration = 0.1;
  this.decelaration = 0.03;
  this.meter = 134;
  this.num = 0;
  this.speed = 0;
  this.speedUp = false;
  this.accelarationMax = 0.1;
  this.maxSpeed = 4;
  this.maxSpeedUp = 5;
  this.radian = 0;
  this.rotation = 0;

  // Method for loading car model
  this.loadModel = (path, mtl, obj) => {
  return new Promise( (resolve, reject) => {
    let mtlLoader = new MTLLoader();
    mtlLoader.setTexturePath(path);
    mtlLoader.setPath(path);
    mtlLoader.load(mtl, materials => {
      materials.preload();
      let objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath(path);
      objLoader.load(obj, object => {
        object.scale.set(0.05, 0.05, 0.05);
          resolve(object);
        });
      });
    });
  };

  // Method for update the position of body and model
  this.updatePhysics = obj => {
    world.step( 1/60 );
    obj.position.copy(this.cannonBody.position);
    obj.quaternion.copy(this.cannonBody.quaternion);
  }

  // Method for returning Promise obj so we know the model has been loaded
  this.addCar = () => {
    this.cannonBody.quaternion.setFromAxisAngle( new CANNON.Vec3(0, 1, 0), 2*Math.PI/360*180 );
    world.add( this.cannonBody );
    this.car = this.loadModel("asset/chevrolet/", "chevrolet.mtl", "chevrolet.obj");
  }




}

// SkyBox Obj
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

// Floor Obj
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
    world.add( this.cannonBody );
    scene.add( this.floor );
  }
}

// Wall Obj
function Wall () {
  // data
  this.map = map;
  this.axis = new CANNON.Vec3(0, 1, 0);
  this.rotatedAngle = 2*Math.PI/360*45;
  this.x = this.z = -1450;
  this.coordinateDone = false;

  // CANNON part
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 50, 22.5, 50 ) );
  this.cannonShapeS = new CANNON.Box( new CANNON.Vec3( 50*Math.sqrt(2), 22.5, 50*Math.sqrt(2) ) );
  this.cannonMaterial = new CANNON.Material();

  // THREE part
  this.textures = [];
  this.imgs = [
    "asset/imgs/wall.png", "asset/imgs/wall.png", "asset/imgs/wall.png",
    "asset/imgs/wall.png", "asset/imgs/wall.png", "asset/imgs/wall.png"
  ];
  this.geometry = new THREE.BoxGeometry( 100, 45, 100 );
  this.geometryS = new THREE.BoxGeometry( 100*Math.sqrt(2), 45, 100*Math.sqrt(2) );

  // Method for sticking the textures to the wall
  this.stickTextures = () => {
    this.imgs.forEach( img => {
      this.side = new THREE.TextureLoader().load( img );
      this.textures.push( new THREE.MeshBasicMaterial({ map: this.side  }) );
    });
  }

  // Methed for creating the THREE wall in right size
  this.createWall = s => {
    switch(s){
      case "lu": //|| "rd" || "ld" || "ru":
      this.wall = new THREE.Mesh( this.geometryS, this.textures );
      break;
      case "rd":
      this.wall = new THREE.Mesh( this.geometryS, this.textures );
      break;
      case "ld":
      this.wall = new THREE.Mesh( this.geometryS, this.textures );
      break;
      case "ru":
      this.wall = new THREE.Mesh( this.geometryS, this.textures );
      break;

      default:
      this.wall = new THREE.Mesh( this.geometry, this.textures );
    }
    return this.wall;
  }

  // Method for creating the CANNON wall in right size
  this.createBody = (s, x, z) => {
    switch(s){
      case "lu":
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x-50, 0, z-50),
        shape: this.cannonShapeS,
        material: this.cannonMaterial
      });
      this.body.quaternion.setFromAxisAngle( this.axis, this.rotatedAngle );
      break;
      case "rd":
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x+50, 0, z+50),
        shape: this.cannonShapeS,
        material: this.cannonMaterial
      });
      this.body.quaternion.setFromAxisAngle( this.axis, this.rotatedAngle );
      break;
      case "ld":
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x-50, 0, z+50),
        shape: this.cannonShapeS,
        material: this.cannonMaterial
      });
      this.body.quaternion.setFromAxisAngle( this.axis, this.rotatedAngle );
      break;
      case "ru":
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x+50, 0, z-50),
        shape: this.cannonShapeS,
        material: this.cannonMaterial
      });
      this.body.quaternion.setFromAxisAngle( this.axis, this.rotatedAngle );
      break;

      default:
      this.body = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3(x, 0, z),
        shape: this.cannonShape,
        material: this.cannonMaterial
      });
    }
    // console.log(this.body);
    return this.body;
  }

  this.updatePhysics = (mesh, body) => {
    // world.step( 1/60 );
    // console.log(mesh, body);
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }


  // Method for add walls to scene/world
  this.addWall = () => {
    this.map.forEach( mesh => {
      if( this.x < 1451 ){
    			mesh.x = this.x;
    			mesh.z = this.z;
    			this.x += 100;
    		} else{
    			this.x = -1450;
    			this.z += 100;
    			mesh.x = this.x;
    			mesh.z = this.z;
    			this.x += 100;
    		}

        if( this.x === 1450 && this.z === 1450 ){
          this.coordinateDone = true;
        }
    });
    if( this.coordinateDone ){
      this.map.forEach( mesh => {
        if(mesh.c === 1){
          let wall = this.createWall(mesh.s);
          let body = this.createBody(mesh.s, mesh.x, mesh.z);
          scene.add( wall );
          world.add( body );
          this.updatePhysics(wall, body);
        }
      });
    }
  }
}

/* --- Render it !  --- */
  let render = () => {
    // move();
    // cannonDebugRenderer.update();

    // Keep player's car updated
    player.updatePhysics(driver);

    requestAnimationFrame(render);
    renderer.render( scene, camera );

  }

/* ---  Create WORLD !  --- */
let initWorld = () => {
  initCannon();
  initThree();

  // Load Car
  player = new Car;
  player.addCar();

  // Add SkyBox
  sky = new Skybox;
  sky.addSky();

  // Add Floor
  floor = new Floor;
  floor.addFloor();

  // Add Wall
  wall = new Wall;
  wall.stickTextures();
  wall.addWall();

  // Add Car
  player.car.then( obj => {
    driver = obj;
    scene.add(obj);
    player.updatePhysics(obj);

    // Render world after loading car model
    render();
  });

}

initWorld();
