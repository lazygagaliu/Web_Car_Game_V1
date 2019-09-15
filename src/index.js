import * as THREE from 'three';
import * as CANNON from "cannon";
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import OrbitControls from 'three-orbitcontrols';
import * as PostProcessing from "postprocessing";

/* ------ Variables ------ */
let renderer, scene, camera, light, controls;
let arrows = document.querySelectorAll("img");
let showControl = document.querySelector(".fade-wrapper");
let gotIt = document.querySelector(".control-read");

let car;

// Load Car Model
let load = () => {
  return new Promise( (resolve, reject) => {
    let mtlLoader = new MTLLoader();
    mtlLoader.setTexturePath("asset/chevrolet/");
    mtlLoader.setPath("asset/chevrolet/");
    mtlLoader.load("chevrolet.mtl", materials => {
      materials.preload();
      let objLoader = new OBJLoader();
      objLoader.setMaterials(materials);
      objLoader.setPath("asset/chevrolet/");
      objLoader.load("chevrolet.obj", obj => {
        obj.scale.set(0.5, 0.5, 0.5);
        obj.castShadow = true;
        obj.receiveShadow = false;
        scene.add(obj);
        resolve(obj);
      });
    });
  });
}

/* ------ Initialize index.html  ------ */
let init = () => {

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setClearColor( 0x000000 );
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  document.body.appendChild( renderer.domElement );

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.set( 100, 40, 270 );
  scene.add(camera);

  // let light1 = new THREE.PointLight( 0xffffff, 2 );
  // light1.position.set( 200, 200, 0 );
  // scene.add(light1);
  // let light2 = new THREE.PointLight( 0xffffff, 2 );
  // light2.position.set( 0, 200, -100 );
  // scene.add(light2);
  // let light3 = new THREE.PointLight( 0xffffff, 2 );
  // light3.position.set( 200, 200, 0 );
  // scene.add(light3);
  // let light4 = new THREE.PointLight( 0xffffff, 2 );
  // light4.position.set( 0, 200, 100 );
  // scene.add(light4);

  let light5 = new THREE.SpotLight( 0xfffff0, 2);
  light5.position.set( 100, 300, 60 );
  light5.castShadow = true;
  light5.angle = 0.7;
  light5.penumbra = 0.4;
  light5.decay = 1.2;

  // light5.shadow.mapSize.width = 1000;  // default
  // light5.shadow.mapSize.height = 100; // default
  // light5.shadow.camera.near = 1;       // default
  // light5.shadow.camera.far = 1000;
  scene.add(light5);
  var helper = new THREE.CameraHelper( light5.shadow.camera );
  scene.add( helper );

  let spotLightHelper = new THREE.SpotLightHelper( light5 );
  // scene.add( spotLightHelper );

  let composer = new PostProcessing.EffectComposer(renderer);
  let effectPass = new PostProcessing.EffectPass( camera, new PostProcessing.BloomEffect() );
  effectPass.renderToScreen = true;

  composer.addPass( new PostProcessing.RenderPass(scene, camera) );
  composer.addPass(effectPass);

  controls = new OrbitControls(camera, renderer.domElement);

  let matFloor = new THREE.MeshPhongMaterial();
  let geoFloor = new THREE.PlaneBufferGeometry( 800, 800 );
  let mshFloor = new THREE.Mesh( geoFloor, matFloor );
  mshFloor.rotation.x = - 2 * Math.PI / 360 * 90;
  mshFloor.position.set( 0, -40, 40 );
  mshFloor.receiveShadow = true;
  scene.add(mshFloor);

  let render = () => {
    requestAnimationFrame(render);
    // renderer.render( scene, camera );
    helper.update();
    composer.render();
    // car.rotation.y -= 0.005;   // Make car rotate or not ?!
  }

  let loadCar = load();
  loadCar.then( obj => {
    car = obj;
    render();
  });

}

init();


// Options
document.body.addEventListener("keydown", e => {
  if(e.keyCode === 38 || e.keyCode === 40){
    arrows.forEach(arrow=>{
      arrow.classList.toggle("arrow-hidden");
    });
  } else if(e.keyCode === 13 && arrows[2].classList.contains("arrow-hidden")){
    location.href = "game.html";
  } else if(e.keyCode === 13 && arrows[1].classList.contains("arrow-hidden")){
    showControl.style.display = "block";
  }
});

// Close the controls instruction window
gotIt.addEventListener("click", e => {
  showControl.style.display = "none";
});
