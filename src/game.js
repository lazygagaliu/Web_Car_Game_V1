import * as THREE from 'three';
import * as CANNON from "cannon";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import OrbitControls from 'three-orbitcontrols';

/* --- Variables --- */
let renderer, scene, camera, light, world, sky, floor, wall, player, driver, components;

let body = document.querySelector("body");
let loading = document.querySelector(".loading");

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
  this.cannonShape = new CANNON.Box( new CANNON.Vec3( 5, 3, 12 ) );
  this.cannonBody = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(200, 15, 0),
    shape: this.cannonShape,
    material: this.cannonMaterial
  });

  // States
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
    this.car = this.loadModel("asset/chevrolet/", "chevrolet.mtl", "chevrolet.obj");
  }

  this.move = () => {

    // Run out of the time --> make car stop
    if( components.timeBar ){
      components.timeBarWidth = getComputedStyle(components.timeBar).width;
      if( components.timeBarWidth === "0px" ){
        this.movement = "stop";
      }
    }

    // use NOS -- SpeedUp -> true ----- change some states for nos
    if( this.speedUp ){
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
        console.log("back");
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
        this.speed -= this.decelaration;
        this.meter -= this.meterDecelaration;
        this.num -= this.numDecelaration;
        if( this.speed < 0 ){
          this.speed = 0;
          this.meter = 134;
          this.num = 0;
        }
      } else if( this.speed < 0 ){
        this.speed += this.decelaration;
        this.meter -= this.meterDecelaration;
        this.num -= this.numDecelaration;
        if( this.speed > 0 ){
          this.speed = 0;
          this.meter = 134;
          this.num = 0;
        }
      }

      break;
    }

    if( this.speed < 0 ){
      this.rotation -= this.radian;
    } else {
      this.rotation += this.radian;
    }

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
    // else{ stopSound.pause(); }


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

    if( this.meter === this.maxMeter ){
      // console.log(this.meter);
      components.needle.style.setProperty("--needle-vibrant", `${this.meter + 5}deg`);
      components.needle.setAttribute("class", "needle vibrant");
    } else {
      components.needle.setAttribute("class", "needle");
    }

    // Update the Number
    components.speedNum.textContent = Math.floor( Math.abs( this.num ) );

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

  // this.getNeedleDeg = () => {
  //   let deg = getComputedStyle(this.needle).transform;
  //   deg = deg.split("(")[1].split(")")[0].split(",");
  //   deg = Math.round(Math.atan2(deg[1], deg[0]) * (180/Math.PI)); // Transfer matrix number to deg
  //   return deg;
  // }

  this.meter = createElement("div", { className: "meter" }, body);
  this.needle = createElement("div", { className: "needle" }, this.meter);

  this.speedNum = createElement("div", { className: "meter-number", textContent: 0 }, body);
  this.speedNumUnit = createElement("div", { className: "meter-unit", textContent: "KM/H" }, body);

  this.nosWrapper = createElement("div", { className: "n-outer" }, body);
  this.nosLightning = createElement("img", { className: "lightning", src: "asset/imgs/lightning.png" }, this.nosWrapper);
  this.nosBar = createElement("div", { className: "n-inner" }, this.nosWrapper);
  this.nosBarHeight = getComputedStyle(this.nosBar).height;
  this.nosbarHeightNum = parseInt(this.nosBarHeight.match(/\d+/)[0]);


  this.timeWrapper = createElement("div", { className: "fuel-outer" }, body);
}




/* --------- Render it !  --------- */
  let render = () => {
    player.move();
    // cannonDebugRenderer.update();

    // Keep player's car updated
    player.updatePhysics(driver);

    requestAnimationFrame(render);
    renderer.render( scene, camera );

  }

/* ---------  Create WORLD !  --------- */
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

  // Add Some Elements
  components = new Components;

  // Add Car
  player.car.then( obj => {
    driver = obj;
    scene.add(obj);
    player.updatePhysics(obj);

    // Set loading div to display none when content has loaded
    loading.style.display = "none";

    // Countdown so player can be ready to play
    let n = 3;
    let countdown = setInterval( ()=>{
      createElement("div", { className: "countdown", textContent: n }, body);
      n -= 1;
      if(n < 0){
        clearInterval(countdown);
        return;
      }
      if(n < 1) {
        components.timeBar = createElement("div", { className: "fuel-inner" }, components.timeWrapper);
      }
    }, 1000 );

    // Render world after loading car model
    render();
  });

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
    }
    break;

    // case 73: // I for test
    // player.speedUp = false;
    // break;
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

    // case 32: // spacebar
    // car.speedUp = false;
    // break;
  }
} );
