import * as THREE from 'three';
import * as CANNON from "cannon";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
// import OrbitControls from 'three-orbitcontrols';


/* --------- Variables --------- */
let renderer, scene, camera, light, clock, world, sky, floor, wall, player, driver, components, checkpoints, finishLine, audio, speedUpPoints, alphaInit, gammaInit;

// Web Audio API
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
// let AudioContext = window.AudioContext || window.webkitAudioContext;
// let audioContext = new window.AudioContext;

// DOMS from HTML
let body = document.querySelector("body");
let loading = document.querySelector(".loading");

// THREE TextureLoader
let loader = new THREE.TextureLoader();

// Helper
// let axes, box, cannonDebugRenderer;

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
  	{c:2}, {c:2}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:2}, {c:1, s:"lu"}, {c:1, s:"rd"}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:4}, {c:4}, {c:4}, {c:4}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:1}, {c:0}, {c:1},
  	{c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:2}, {c:1}, {c:0}, {c:1}, {c:2}, {c:2}, {c:1}, {c:0}, {c:0}, {c:1}, {c:2}, {c:2}, {c:4}, {c:3}, {c:3}, {c:3}, {c:3}, {c:3}, {c:1}, {c:0}, {c:1},
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
  world.gravity.set( 0, -9.82, 0 );  //-9.82
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

  // Add clock
  // clock = new THREE.Clock();

  // Add helper
  // axes = new THREE.AxisHelper(800);

  // scene.add(axes);
  // const controls = new OrbitControls(camera, renderer.domElement);
}

// Create Element to render on the screen
let createElement = (tag, atrs, parentElement) => {
  let obj = document.createElement(tag);
  if(atrs){setAttributes(obj, atrs);}
  if(parentElement instanceof Element){parentElement.appendChild(obj);}
	return obj;
}

let setAttributes = (obj, atrs) => {
  for(let key in atrs){
		obj[key] = atrs[key];
	}
	return obj;
}

/* -------------  Settings for World Objs !  ------------- */
// Car Obj with Car Model
function Car () {
  // Shape related
  this.cannonMaterial = new CANNON.Material();
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 5, 3, 13 ) );
  this.cannonBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(200, 15, 0),
    shape: this.cannonShape,
    material: this.cannonMaterial,
    // angularDamping: 0.3,
    // linearDamping: 0.3
  });

  // Game state
  this.finished = false;
  this.failed = false;

  // Car States
  this.movement = "stop";
  this.speedUp = false;
  // Speed
  this.speed = 0;
  this.accelaration = 0.1; // nos 0.3  back -0.05
  this.decelaration = 0.03;
  this.brake = 0.05;
  this.maxSpeed = 4;  // nos 7  back -2
  // Meter
  this.meter = 134;
  this.meterAccelaration = 7.9; // nos 23.7  back 4
  this.meterDecelaration = 2.4;
  this.meterBrake = 4;
  this.maxMeter = 454; // nos 694  back 294
  // Num
  this.num = 0;
  this.numAccelaration = 2.5; // nos 7.5  back 1.25
  this.numDecelaration = 0.75;
  this.numBrake = 1.25;
  this.maxNum = 100;  // nos 175  back 50

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
  }

  // NOS effect objs
  this.speedUpObjs = [];

  // Objs for adding NOS effect
  this.speedUpPoints = function SpeedUpPoints(x, z) {
    // speedUpAnimation data
    this.pointsNum = 100;
    this.pointsSpeed = 0.01;
    this.size = 20;
    this.dir = [];
    this.texture = loader.load("asset/imgs/smoke.png");

    let geometry = new THREE.Geometry();
    let material = new THREE.PointsMaterial({
      size: this.size,
      color: new THREE.Color( 0x38e3f6 ),  //0xdd4238
      blending: THREE.AdditiveBlending,
      depthTest: false,
      map: this.texture,
      transparent: true,
      opacity: 0.1
     });

     for( let i = 0; i < this.pointsNum; i++ ){
       let vertex = new THREE.Vector3( x, -5, z );
       geometry.vertices.push(vertex);

       let r = this.pointsSpeed * THREE.Math.randFloat(0, 1) + 5;
       let theta = Math.random() * Math.PI * 2;
       let phi = Math.random() * Math.PI;
       this.dir.push({
         x: r * Math.sin(phi) * Math.cos(theta),
         y: r * Math.sin(phi) * Math.sin(theta),
         z: r * Math.cos(phi)
       });
     }

     this.object = new THREE.Points(geometry, material);
     player.speedUpObjs.push(this.object);
     scene.add(this.object);

    /////// new it before first nos
     this.update = () => {
       let p = this.pointsNum;
       let d = this.dir;

       while( p-- ){
         let particle = this.object.geometry.vertices[p];
         particle.x += d[p].x;
         particle.y = -11 + Math.random() * 0.0001;
         particle.z += d[p].z;
       }

       this.object.geometry.verticesNeedUpdate = true;
     }

     this.destroy = () => {
       player.speedUpObjs.forEach( obj => {
         obj.geometry.dispose();
         scene.remove(obj);
       });
       this.dir.length = 0;
       player.speedUpObjs = [];
     }
  }

  // Movement of Car
  this.move = () => {

    if( this.finished ){
      this.movement = "stop";
      components.timeBar.remove();
      components.finalTime();
      console.log("finished");
    }

    // Run out of the time --> make car stop
    if( components.timeBar ){
      components.timeBarWidth = getComputedStyle(components.timeBar).width;
      // console.log(components.timeBarWidth);
      if( components.timeBarWidth === "0px" && !this.finished ){
          this.movement = "stop";
          this.failed = true;
          console.log("failed");

      } else if( !this.finished ){
        components.runningTime();
      }

    } else{
      this.movement = "stop";

    }

    // use NOS -- SpeedUp -> true ----- change some states for nos
    if( this.speedUp ){
      if( player.speedUpObjs.length < 8 ){
        speedUpPoints = new this.speedUpPoints(
          driver.position.x + Math.sin(this.rotation)*10, driver.position.z + Math.cos(this.rotation)*10
        );
        console.log("fire");
      }
      this.accelaration = 0.3;
      this.maxSpeed = 7;
      this.meterAccelaration = 23.7;
      this.maxMeter = 694;
      this.numAccelaration = 7.5;
      this.maxNum = 175;
    } else if( this.speed < 0 || this.speed == 0 && this.movement === "back" ){
      this.accelaration = -0.05;
      this.maxSpeed = -2;
      this.meterAccelaration = 4;
      this.maxMeter = 294;
      this.numAccelaration = 1.25;
      this.maxNum = 50;
    } else {
      if(speedUpPoints && this.speedUpObjs.length !== 0){
        speedUpPoints.destroy();
      }
      this.accelaration = 0.1;
      this.maxSpeed = 4;
      this.meterAccelaration = 7.9;
      this.maxMeter = 454;
      this.numAccelaration = 2.5;
      this.maxNum = 100;
    }

    switch (this.movement) {
      case "forward":
      if( this.speed >= 0 ){
        audio.play("startSound");
        this.speed += this.accelaration;
        this.meter += this.meterAccelaration;
        this.num += this.numAccelaration;
        if( this.speed > this.maxSpeed ){
          this.speed = this.maxSpeed;
          this.meter = this.maxMeter;
          this.num = this.maxNum;
        }

      } else {
        this.speed += this.brake;
        this.meter -= this.meterBrake;
        this.num -= this.numBrake;
      }
      break;


      case "back":
      if( this.speed <= 0 ){
        audio.play("startSound");
        this.speed += this.accelaration;
        this.meter += this.meterAccelaration;
        this.num += this.numAccelaration;
        if( this.speed < this.maxSpeed ){
          this.speed = this.maxSpeed;
          this.meter = this.maxMeter;
          this.num = this.maxNum;
        }

      } else {
        console.log("brake");
        this.speed -= this.brake;
        this.meter -= this.meterBrake;
        this.num -= this.numBrake;
      }

      break;


      case "stop":
      // meter.setAttribute("class", "needle");
      if( this.speed > 0 ){
        audio.play("slowSound");
        this.speed -= this.decelaration;
        this.meter -= this.meterDecelaration;
        this.num -= this.numDecelaration;
        if( this.speed < 0 ){
          audio.play("stopSound");
          this.speed = 0;
          this.meter = 134;
          this.num = 0;
        }
      } else if( this.speed < 0 ){
        audio.play("slowSound");
        this.speed += this.decelaration;
        this.meter -= this.meterDecelaration;
        this.num -= this.numDecelaration;
        if( this.speed > 0 ){
          audio.play("stopSound");
          this.speed = 0;
          this.meter = 134;
          this.num = 0;
        }
      }

      break;
    }

    // if( alphaInit === undefined ){
      if( this.speed < 0 ){
        this.rotation -= this.radian;
      } else {
        this.rotation += this.radian;
      }
    // }

    // Update NosBarHeight
    components.nosBarHeight = getComputedStyle(components.nosBar).height;
    components.nosBarHeightNum = parseInt(components.nosBarHeight.match(/\d+/)[0]);

    if( !this.speedUp && components.nosBarHeightNum < 1  ){
      components.nosBar.setAttribute("class", "n-inner accumulation");
    } else if( !this.speedUp && components.nosBarHeightNum > 128 ){
      components.nosBar.style.setProperty("--bar-height", components.nosBarHeight);
    } else if( this.speedUp && components.nosBarHeightNum > 128 ){
      components.nosBar.style.removeProperty("--bar-height");
      components.nosBar.setAttribute("class", "n-inner speed-up");
    } else if( this.speedUp && components.nosBarHeightNum < 1 ){
      this.speedUp = false;
      components.nosBar.setAttribute("class", "n-inner accumulation");
    } else if( !this.speedUp && components.nosBarHeightNum > 1 && components.nosbarHeightNum < 128 ){
      components.nosBar.setAttribute("class", "n-inner accumulation");
    }

    if( this.speed === 0 ){
      if( this.failed && !finishLine.failWindow && !this.finished ){
        finishLine.failWindow = finishLine.showFinishWindow("DON'T GIVE UP!", "WANNA TRY AGAIN ?");
      }

      components.nosBar.classList.remove("accumulation");
      if( !this.speedUp ){
        components.nosBar.style.setProperty("--bar-height", components.nosBarHeight);
      } else if( this.speedUp && components.nosBarHeightNum > 128 ){
        components.nosBar.style.removeProperty("--bar-height");
        components.nosBar.setAttribute("class", "n-inner speed-up");
      } else if( this.speedUp && components.nosBarHeightNum < 1 ){
        this.speedUp = false;
        components.nosBar.setAttribute("class", "n-inner accumulation");
      }
      return;
    }


    let x = Math.sin(this.rotation) * this.speed;
    let z = Math.cos(this.rotation) * this.speed;

    // Update Car position
    this.cannonBody.quaternion.setFromAxisAngle( new CANNON.Vec3(0, 1, 0), 2*Math.PI/360*180 + this.rotation);
    this.cannonBody.position.z -= z;  //driver
    this.cannonBody.position.x -= x;  //driver

    // Update Camera position
    camera.rotation.y = this.rotation;
    camera.position.x = driver.position.x + Math.sin(this.rotation)*50;
    camera.position.z = driver.position.z + Math.cos(this.rotation)*50;

    // Update the Meter
    components.needle.style.transform = `rotate(${this.meter}deg)`;

    // Update needle transformed degree
    // components.needleR = components.getNeedleDeg();
    components.needle.style.setProperty("--needle-rotation", `${this.meter}deg`);
    // Update the Number
    components.speedNum.textContent = Math.floor( Math.abs( this.num ) );

    if( this.meter === this.maxMeter ){
      if( !this.speedUp && components.nosBarHeightNum > 1 && components.nosBarHeightNum < 128 ){

        components.needle.remove();
        components.needle = createElement("div", { className: "needle" }, components.meter);
        components.needle.style.setProperty("--needle-rotation", `${this.meter}deg`);

        // components.needle.style.setProperty("--needle-vibrant", `${this.meter + 5}deg`);
      }

      components.needle.style.setProperty("--needle-vibrant", `${this.meter + 5}deg`);
      components.needle.setAttribute("class", "needle vibrant");

      let randomMax = Math.random() * 25 / 16;
      components.speedNum.textContent = Math.floor( Math.abs( this.num + randomMax ) );

    } else {
      components.needle.setAttribute("class", "needle");
    }

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
  this.threeTexture = loader.load("asset/imgs/road.jpg"); //tarmac_light.png
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
    // console.log(this.cannonBody);
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
      case "lu":
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
    return this.body;
  }

  this.updatePhysics = (mesh, body) => {
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

// Add some elements
function Components () {

  this.meter = createElement("div", { className: "meter" }, body);
  this.needle = createElement("div", { className: "needle" }, this.meter);

  this.speedNum = createElement("div", { className: "meter-number", textContent: 0 }, body);
  this.speedNumUnit = createElement("div", { className: "meter-unit", textContent: "KM/H" }, body);

  this.nosWrapper = createElement("div", { className: "n-outer" }, body);
  this.nosLightning = createElement("img", { className: "lightning", src: "asset/imgs/lightning.png" }, this.nosWrapper);
  this.nosBar = createElement("div", { className: "n-inner" }, this.nosWrapper);
  this.nosBarHeight = getComputedStyle(this.nosBar).height;
  this.nosbarHeightNum = parseInt(this.nosBarHeight.match(/\d+/)[0]);

  this.timeCount = createElement("div", { className: "running-time", textContent: `00:00:00` }, body);
  // Time Bar Wrapper
  this.timeWrapper = createElement("div", { className: "fuel-outer" }, body);

  this.elements = [
    this.meter, this.speedNum, this.speedNumUnit, this.timeCount, this.timeWrapper, this.nosLightning
  ];

  this.showUI = () => {
    this.elements.forEach( el => {
      el.style.display = "block";
    });
    this.nosWrapper.style.display = "flex";
  }

  // Method for creating running time
  this.runningTime = () => {
    // Initialize the start time
    if( !this.startTime ){
      this.startTime = Date.now();
    }
    let ms = Math.floor( Date.now() - this.startTime );
    let s = Math.floor( ms / 1000 );
    let m = Math.floor( s / 60 );

    ms = parseInt(ms.toString().slice(ms.toString().length-2)); // Take the last two positions of the integer
    if( s > 59 ){
      s = s % 60;
    }
    s = parseInt(s.toString().slice(s.toString().length-2));
    m = parseInt(m.toString().slice(m.toString().length-2));

    let timeArr = [ms, s, m];
    let timeShow = [];
    for(let i = 0; i < timeArr.length; i++){
      if(timeArr[i].toString().length < 2){
        timeShow[i] = `0${timeArr[i]}`;
      } else{
        timeShow[i] = timeArr[i];
      }
    }
    this.timeCount.textContent = `${timeShow[2]}:${timeShow[1]}:${timeShow[0]}`;
  }

  this.finalTime = () => {
    this.timeCount.textContent = this.timeCount.textContent;
  }

}

// Add the Checkpoints
function Checkpoints () {
  // coordinates of Checkpoints
  this.data = [
    {x: 200, z: -100, t: 25},
    {x: 1350, z: -850, t: 20},
    {x: 1350, z: 950, t: 18},
    {s: 90, x: 50, z: 1350, t: 20},
    {s: 90, x: -1050, z: 1050, t: 18},
    {x: -1350, z: 50, t: 25},
    {x: -350, z: -1150, t: 25},
    {s: 45, x: -150, z: 550, t: 15, last: true},
  ];
  this.checkpoints = [];
  this.aniNum = 0;
  this.axis = new CANNON.Vec3(0, 1, 0);

  // CANNON Part
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 100, 13, 3 ) );

  // THREE part
  this.threeGeometry = new THREE.TorusGeometry(15, 2, 12, 16);
  this.threeMaterial = new THREE.MeshLambertMaterial({color: 0xffd306});

  // Methed for creating the THREE Checkpoint
  this.createCheckpoint = () => {
    this.checkpoint = new THREE.Mesh( this.threeGeometry, this.threeMaterial );
    return this.checkpoint;
  }

  // Method for detect the collision
  this.collision = (e) => {
    console.log("colliding!!!");

    components.timeBar.remove();
    components.timeBar = createElement("div", { className: "fuel-inner" }, components.timeWrapper);
    components.timeBar.style.setProperty("--left-time", `${e.target.time}s`);

    if( e.target.last ){
      finishLine.addLine();
    }
    e.target.removeEventListener("collide", this.collision);
  }

  // Method for creating the CANNON Checkpoint
  this.createBody = (s, x, z, t, last) => {
    switch (s) {
      case 90:
      this.cannonBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3( x, 10, z ),
        shape: this.cannonShape,
      });
      this.cannonBody.quaternion.setFromAxisAngle( this.axis, 2*Math.PI/360*90 );
      break;
      case 45:
      this.cannonBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3( x, 10, z ),
        shape: this.cannonShape,
      });
      this.cannonBody.quaternion.setFromAxisAngle( this.axis, 2*Math.PI/360*45 );
      break;

      default:
      this.cannonBody = new CANNON.Body({
        mass: 0,
        position: new CANNON.Vec3( x, 10, z ),
        shape: this.cannonShape,
      });
    }
    this.cannonBody.collisionResponse = false;
    this.cannonBody.time = t;
    if(last){
      this.cannonBody.last = last;
    }
    this.cannonBody.addEventListener("collide", this.collision);
    return this.cannonBody;
  }

  this.updatePhysics = (mesh, body) => {
    mesh.position.copy(body.position);
    mesh.quaternion.copy(body.quaternion);
  }

  // Method for adding checkpoints to the world
  this.addCheckpoint = () => {
    this.data.forEach( mesh => {
      let checkpoint = this.createCheckpoint();
      let body = this.createBody(mesh.s, mesh.x, mesh.z, mesh.t, mesh.last);
      world.add( body );
      scene.add( checkpoint );
      this.checkpoints.push( checkpoint );
      this.updatePhysics(checkpoint, body);
    });
  }

  this.animation = n => {
    this.checkpoints.forEach( mesh => {
      mesh.scale.y = Math.abs( Math.sin(n) );
    });
  }
}

function FinishLine () {

  this.finished = e => {
    player.finished = true;
    finishLine.showFinishWindow( "YOUR BEST RECORD", components.timeCount.textContent );
    e.target.removeEventListener("collide", this.finished);
  }

  // CANNON Part   ////// Make it less width
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 100, 13, 3 ) );
  this.cannonBody = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3( 200, 10, 0 ),
    shape: this.cannonShape,
  });
  this.cannonBody.collisionResponse = false;
  this.cannonBody.addEventListener("collide", this.finished );

  // THREE part
  this.threeTexture = loader.load("asset/imgs/finishline.png");
  this.threeTexture.wrapS = this.threeTexture.wrapT = THREE.RepeatWrapping;
  this.threeTexture.repeat.set( 1, 6 );
  this.threeMaterial = new THREE.MeshLambertMaterial( { map: this.threeTexture } );
  this.line = new THREE.Mesh( new THREE.PlaneBufferGeometry( 200, 60 ), this.threeMaterial );
  this.line.position.set( 200 , - 10, 30 );
  this.line.rotation.x = - Math.PI / 2;
  this.line.receiveShadow = true;

  this.addLine = () => {
    world.add( this.cannonBody );
    scene.add( this.line );
  }

  // Finish PopUp Window
  this.showFinishWindow = ( title, content ) => {
    let finishWrapper = createElement("div", {className: "finish-wrapper"}, body);
    let recordWrapper = createElement("div", {className: "record-wrapper"}, finishWrapper);

    let playerRecordWrapper = createElement("div", {className: "player-record-wrapper"}, recordWrapper);
    createElement("div", {className: "player-record", textContent: title}, playerRecordWrapper);
    createElement("div", {className: "player-record", textContent: content}, playerRecordWrapper);

    if(player.finished){
      let records = createElement("img", {src: "asset/imgs/trophy.png"}, recordWrapper);
    }

    let finishOptions = createElement("div", {className: "finish-options"}, recordWrapper);
    let restart = createElement("div", {className: "finish-option", textContent: "RESTART"}, finishOptions);
    let exit = createElement("div", {className: "finish-option", textContent: "EXIT"}, finishOptions);

    restart.addEventListener("click", e => {
      location.reload();
    });

    exit.addEventListener("click", e => {
      location.href = "./";
    });

    return finishWrapper;

  }

}

// Add audios
function Audio () {
  // Audio files
  this.data = [
    "asset/audio/eminem_feat_ludacris_lil_wayne_second_chance.mp3",
    // "asset/audio/rocket.mp3", // 3.5
    "asset/audio/start.mp3",  // < 4
    "asset/audio/stop.mp3", // 8
    // "asset/audio/maxdrive.ogg", // 20
    "asset/audio/slowdown.mp3" // 8.22
    // "asset/audio/maxdrivenos.ogg" // 4
  ];

  // Store decoded audios for future use
  this.audioNodesBuffer = [];
  this.audioNodesData = [];
  this.audioNames = [
    "startSound",
    "slowSound",
    "stopSound",
    "themeSong"
  ];

  // The data for the startSound to loop the max speed period
  // this.loopStart = 1.018;
  // this.loopEnd = 1.037;

  // Method for comparing the audios length for sorting them out
  this.compare = (a, b) => {
    let audioA = a.duration;
    let audioB = b.duration;
    let comparison = 0;
    if( audioA > audioB ){
      comparison = 1;
    } else if( audioA < audioB ){
      comparison = -1;
    }
    return comparison;
  }

  // Create Audio Objs
  function Obj ( buffer, name ) {
    this.buffer = buffer;
    this.playing = false;
    this.name = name
  }

  // Create Countdown Sound
  this.countdownSound = f => {
    let countdownSound = audioContext.createOscillator();
    countdownSound.type = "triangle";
    countdownSound.frequency.value = f;
    countdownSound.connect(audioContext.destination);
    countdownSound.start();
    return countdownSound;
  }


  // Method for decoding the audios
  this.decode = (audio) => {
    return new Promise( (resolve, reject) => {
      audioContext.decodeAudioData( audio, buffer =>{
        resolve(buffer);
      },
      e => { console.log("Error with decoding the audio", e.err); });
    });
  }



  // Methed to get Audio Data
  this.getData = () => {

    this.data.forEach( url => {
      let xhr = new XMLHttpRequest();
      xhr.open( "GET", url, true );
      xhr.responseType = "arraybuffer";
      xhr.onload = () => {
        let audioData = xhr.response;
        audioContext.decodeAudioData(audioData, buffer => {
          this.audioNodesBuffer.push(buffer);
          let n = 0;
          if( this.audioNodesBuffer.length === this.data.length ){
            this.audioNodesBuffer.sort(this.compare);
            this.audioNodesBuffer.forEach( buffer => {
              let audioData = new Obj( buffer, this.audioNames[n] );
              this.audioNodesData.push(audioData);
              n++;
            });
          }
        });
      }
      xhr.send();
    });

    // this.data.forEach( url => {
    //   let xhr = new XMLHttpRequest();
    //
    //   xhr.open( "GET", url, true );
    //   xhr.responseType = "arraybuffer";
    //   xhr.onload = () => {
    //
    //     let audioData = xhr.response;
    //     let xhrDone = this.decode(audioData);
    //     xhrDone.then( buffer => {
    //       this.audioNodesBuffer.push(buffer);
    //       let n = 0;
    //       if( this.audioNodesBuffer.length === this.data.length ){
    //         this.audioNodesBuffer.sort(this.compare);
    //         this.audioNodesBuffer.forEach( buffer => {
    //           let audioData = new Obj( buffer, this.audioNames[n] );
    //           this.audioNodesData.push(audioData);
    //           n++;
    //         });
    //         console.log(this.audioNodesData); //////
    //       }
    //     });
    //
    //   }
    //   xhr.send();
    // });
  }

  this.startPlay = (buffer, loopStart, loopEnd, realTime) => {
    let audio = audioContext.createBufferSource();
    audio.buffer = buffer;
    audio.connect(audioContext.destination);
    audio.loopStart = loopStart;
    audio.loopEnd = loopEnd;
    audio.loop = true;
    audio.start(0, realTime);
    return audio;
  }

  // for calculating the start point of engine sound
  this.realTime = 0;
  this.ratio = 0;

  // Method for replaying the audios since BufferSourceNode can only be used once --> create a new one BufferSourceNode using the same buffer
  this.play = (currentAudio) => {
    this.ratio = player.speed / player.maxSpeed;

    if( currentAudio === "startSound" ){
      this.realTime = 1.037 * this.ratio;
    } else if( currentAudio === "slowSound" ){
      this.realTime = ( 8.22 - 3.45 ) * (1 - this.ratio) + 3.45;
    } //1.037 / 10 * 3

    this.loopStart = currentAudio === "startSound" ? 1.018 : 0;
     // this.loopStart = 0;
     // this.loopEnd = this.audioNodesData[i].buffer.duration;

    for( let i = 0; i < this.audioNodesData.length - 1; i++ ){
      this.loopEnd = currentAudio === "startSound" ? 1.037 : this.audioNodesData[i].buffer.duration;
      // this.loopEnd = this.audioNodesData[i].buffer.duration;
      if( this.audioNodesData[i].name === currentAudio && this.audioNodesData[i].playing === false ){
        console.log(this.realTime);
        this[this.audioNodesData[i].name] = this.startPlay( this.audioNodesData[i].buffer, this.loopStart, this.loopEnd, this.realTime );
        this.audioNodesData[i].playing = true;
      } else if( this.audioNodesData[i].name !== currentAudio && this.audioNodesData[i].playing === true ){
        this[this.audioNodesData[i].name].disconnect(audioContext);
        this.audioNodesData[i].playing = false;
      }
    }
  }

  //////
  this.stopPlay = () => {
    this.startSound.disconnect(audioContext);
    this.audioNodesData[1].playing = false;
  }


}


/* --------- Render it !  --------- */
  let render = () => {

    if( player.speedUp && speedUpPoints && player.speedUpObjs.length !== 0 ){
      console.log("update fire");
      speedUpPoints.update();
    }

    player.move();

    // cannonDebugRenderer.update();
    // box.update();

    // Keep player's car updated
    player.updatePhysics(driver);

    // Checkpoints Animation
    checkpoints.aniNum += 0.05;
    checkpoints.animation( checkpoints.aniNum );

    requestAnimationFrame(render);
    renderer.render( scene, camera );

  }

/* ---------  Create WORLD !  --------- */
let initWorld = () => {
  initCannon();
  initThree();
  ////// Helper
  // cannonDebugRenderer = new THREE.CannonDebugRenderer( scene, world );

 let createObjs = () => {
   // Create Audio Obj
   audio = new Audio;

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

   // Add UI to screen
   components = new Components;

   // Add Checkpoints
   checkpoints = new Checkpoints;
   checkpoints.addCheckpoint();

   // Create FinishLine Obj
   finishLine = new FinishLine;

 }
  // Create Audio Obj
  audio = new Audio;

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

  // Add UI to screen
  components = new Components;

  // Add Checkpoints
  checkpoints = new Checkpoints;
  checkpoints.addCheckpoint();

  // Create FinishLine Obj
  finishLine = new FinishLine;

  ////////
  // speedUpPoints = new player.speedUpPoints(200, 10);


  let loadCarAudio = async () => {
    let data = JSON.parse( localStorage.getItem("chosencar") );
    // await createObjs();
    console.log("objs created")
    player.car = await player.loadModel( data.path, data.mtl, data.obj );
    console.log("load car")
    await audio.getData();
    console.log("load audio")

    driver = player.car;
    scene.add(player.car);
    player.updatePhysics(player.car);

    loading.style.display = "none";

    document.querySelectorAll(".permission-button")[0].addEventListener("click", e => {
      audioContext.resume().then( () => {
        document.querySelector(".permission-wrapper").style.display = "none";
        components.showUI();

        let n = 3;
        let countdownSounds = [];
        let countdown = setInterval( ()=>{
          let countdownSound;
          if( n === 0 ){
            countdownSound = audio.countdownSound(800);
          } else { countdownSound = audio.countdownSound(400); }

          if( n === 3 ){
            components.countdown = createElement("div", { className: "countdown", textContent: n }, body);
          }else if( n > 0 ) {
            components.countdown.textContent = n;
          }

          countdownSounds.push(countdownSound);
          n -= 1;

          if(n < -1 ){

            // ths longest one -> background music
            audio.startPlay( audio.audioNodesData[3].buffer, 0, audio.audioNodesData[3].buffer.duration, 0 );
            console.log("play theme");

            components.countdown.remove();
            components.timeBar = createElement("div", { className: "fuel-inner" }, components.timeWrapper);
            components.timeBar.style.setProperty("--left-time", `10s`);

            countdownSounds.forEach( sound => {
              sound.stop();
            });

            if( window.DeviceMotionEvent ){
              window.addEventListener("devicemotion", initOrientation );
            }

            clearInterval(countdown);
            return;
          }
        }, 1000 );


        // Render world after loading car model
        render();

      });
    });

  }

  loadCarAudio();

}

initWorld();

/*  ---------  Controls  ---------  */
document.body.addEventListener( "keydown", e => {
    switch( e.keyCode ){
    case 38: // ^
    player.movement = "forward";
    break;
    case 37: // <-
    player.radian = 2 * Math.PI / 360 * 1.5;
    break;
    case 40: // ˇ
    player.movement = "back";
    break;
    case 39: // ->
    player.radian = -2 * Math.PI / 360 * 1.5;
    break;

    case 32: // spacebar
    if( components.nosBarHeightNum > 128 ){
      player.speedUp = true;
      document.querySelector("#nosSound").play();
    }
    break;

    case 73: // I for test
    // player.speedUp = false;
    // components.showFinishWindow();
    // finishLine.addLine();
    // speedUpPoints = new player.speedUpPoints(
    //   driver.position.x + Math.sin(player.rotation)*-30, driver.position.z + Math.cos(player.rotation)*-30
    // );
    break;
  }
} );
document.body.addEventListener( "keyup", e => {
    switch( e.keyCode ){
    case 38: // ^
    player.movement = "stop";
    break;
    case 37: // <-
    player.radian = 0;
    break;
    case 40: // ->
    player.movement = "stop";
    break;
    case 39: // ˇ
    player.radian = 0;
    break;
  }
} );

document.querySelectorAll(".permission-button")[1].addEventListener("click", () => {
  location.href = "./";
});

document.getElementsByTagName("canvas")[0].addEventListener("touchstart", ()=>{
  player.movement = "forward";
});

// document.getElementsByTagName("canvas")[0].addEventListener("click", ()=>{
//   player.movement = "forward";
// });

let turnLandscape = () => {
  if( window.matchMedia( "(max-width: 768px)" ).matches ){
    camera.aspect = window.innerHeight / window.innerWidth;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerHeight, window.innerWidth );
  }
}
turnLandscape();

window.addEventListener("resize", () => {
  if( window.matchMedia( "(max-width: 768px)" ).matches ){
    camera.aspect = window.innerHeight / window.innerWidth;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerHeight, window.innerWidth );
  }else {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  }

});

 /* --- Mobile Control --- */
let initOrientation = e => {
  let radian = Math.round(e.accelerationIncludingGravity.y);
  let activeNos = Math.round(e.accelerationIncludingGravity.z);

  if( radian > 0 ){
    player.radian = 2 * Math.PI / 360 * 1.15;
  } else if( radian < 0 ) {
    player.radian = -2 * Math.PI / 360 * 1.15;
  } else {
    player.radian = 0;
  }

  if( activeNos < -9 && components.nosBarHeightNum > 128 ){
    player.speedUp = true;
    document.querySelector("#nosSound").play();
  }

};
