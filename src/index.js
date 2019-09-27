import * as THREE from 'three';
import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";
import OrbitControls from 'three-orbitcontrols';
import * as PostProcessing from "postprocessing";

/* ------ Variables ------ */
let renderer, scene, camera, light, controls;
let arrows = document.querySelectorAll("img");
let showControl = document.querySelector(".fade-wrapper");
let gotIt = document.querySelector(".control-read");
let carOptions = document.querySelectorAll(".car-option");

let bgm = document.getElementById("bgm");
bgm.playing = false;
let clickLr = document.getElementById("clicklr");
let clickUd = document.getElementById("clickud");

let startBtn = document.querySelector("#start");
let controlBtn = document.querySelector("#control");

let cars = [];

let carData = [
  {
    id: 0,
    path: "asset/chevrolet/",
    mtl: "chevrolet.mtl",
    obj: "chevrolet.obj"
  },
  {
    id: 1,
    path: "asset/lam/",
    mtl: "Lamborghini.mtl",
    obj: "Lamborghini.obj"
  }
];

// Load Car Model
let load = ( path, mtl, obj ) => {
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
        object.scale.set(0.5, 0.5, 0.5);
        object.castShadow = true;
        object.receiveShadow = false;
        // scene.add(object);
        resolve(object);
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
  camera.position.set( 100, 30, 200 );
  scene.add(camera);

  let light5 = new THREE.SpotLight( 0xfffff0, 2);
  light5.position.set( 100, 300, 60 );
  light5.castShadow = true;
  light5.angle = 0.7;
  light5.penumbra = 0.4;
  light5.decay = 1.2;

  light5.shadow.mapSize.width = 1000;  // default
  light5.shadow.mapSize.height = 100; // default
  light5.shadow.camera.near = 1;       // default
  light5.shadow.camera.far = 1000;
  scene.add(light5);

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

  let rotate = car => {
    car.rotation.y -= 0.005;
  }

  let render = () => {
    requestAnimationFrame(render);
    composer.render();
    cars.forEach( car => {
      rotate(car);
    });
  }

  let addCars = async carData => {
    let loadCars = carData.map( async data => {
      let car = await load( data.path, data.mtl, data.obj );
      cars.push(car);
      scene.add(car);
      if( cars[1] ){
        cars[1].visible = false;
      }

      localStorage.setItem("chosencar", JSON.stringify(carData[0]));

      render();
      return car;
    });
  };

  addCars(carData);

}

init();


// Options
document.body.addEventListener("keydown", e => {
  if(e.keyCode === 38 || e.keyCode === 40){
    clickud.play();
    arrows.forEach(arrow=>{
      arrow.classList.toggle("arrow-hidden");
    });
  } else if(e.keyCode === 13 && arrows[2].classList.contains("arrow-hidden")){
    location.href = "game.html";
  } else if(e.keyCode === 13 && arrows[1].classList.contains("arrow-hidden")){
    showControl.style.display = "block";
  } else if( e.keyCode === 37 || e.keyCode === 39 ){
    clickLr.play();
    let chosencar = JSON.parse( localStorage.getItem("chosencar") );
    carData.forEach( car => {
      if( chosencar.id === 0 ){
        localStorage.setItem("chosencar", JSON.stringify(carData[1]));
        console.log(localStorage);
      }else if( chosencar.id === 1 ){
        localStorage.setItem("chosencar", JSON.stringify(carData[0]));
        console.log(localStorage);
      }
    });

    cars.forEach( car => {
      if( car.visible === true ){
        car.visible = false;
      } else{
        car.visible = true;
      }
    });
    carOptions.forEach( option => {
      if( option.classList.contains("selected") ){
        option.classList.remove("selected");
      }else {
        option.classList.add("selected");
      }
    });
  }

});

// Close the controls instruction window
gotIt.addEventListener("click", e => {
  showControl.style.display = "none";
});

// Play the background music
document.querySelector(".onoff").addEventListener("click", e => {
  if( !bgm.playing ){
    e.target.style.backgroundImage = 'url("./asset/imgs/on.png")';
    bgm.play();
    bgm.playing = true;
  } else {
    e.target.style.backgroundImage = 'url("./asset/imgs/off.png")';
    bgm.pause();
    bgm.playing = false;
  }

});

//////
startBtn.addEventListener("click", () => {
  location.href = "game.html";
});

controlBtn.addEventListener("click", () => {
  arrows[0].classList.remove("arrow-hidden");
  showControl.style.display = "block";
});

for( let i = 0; i < carOptions.length; i++ ){
  carOptions[i].addEventListener("click", (e) => {
    // let chosenCar = JSON.parse(document.cookie);

    let chosencar = JSON.parse( localStorage.getItem("chosencar") );
    cars.forEach( car => {
      if( car.visible === true ){
        car.visible = false;
      } else{
        car.visible = true;
      }
    });
    carOptions.forEach( option => {
      if( option.classList.contains("selected") ){
        option.classList.remove("selected");
      }else {
        option.classList.add("selected");
      }
    });
    switch (true) {
      case e.target.classList.contains("car-1"):
      document.cookie = JSON.stringify(carData[0]);
      localStorage.setItem("chosencar", JSON.stringify(carData[0]));
      break;

      case e.target.classList.contains("car-2"):
      document.cookie = JSON.stringify(carData[1]);
      localStorage.setItem("chosencar", JSON.stringify(carData[1]));
      break;
    }
  });
}


//////
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
});
