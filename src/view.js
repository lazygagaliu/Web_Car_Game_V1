import * as THREE from 'three';
import * as PostProcessing from "postprocessing";

class View {
  constructor(){
    // Renderer
    this.renderer = new THREE.WebGLRenderer( { antialias: true } );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    this.renderer.setClearColor( 0x000000 );
    document.body.appendChild( this.renderer.domElement );

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 3000 );
    this.camera.position.set( 100, 30, 200 );
    this.scene.add(this.camera);

    // Light
    this.light = new THREE.SpotLight( 0xfffff0, 2);
    this.light.position.set( 100, 300, 60 );
    this.light.angle = 0.7;
    this.light.penumbra = 0.4;
    this.light.decay = 1.2;
    this.scene.add(this.light);

    // PostProcessing
    this.composer = new PostProcessing.EffectComposer(this.renderer);
    this.effectPass = new PostProcessing.EffectPass( this.camera, new PostProcessing.BloomEffect() );
    this.effectPass.renderToScreen = true;

    this.composer.addPass( new PostProcessing.RenderPass(this.scene, this.camera) );
    this.composer.addPass(this.effectPass);

    // Floor
    this.matFloor = new THREE.MeshPhongMaterial();
    this.geoFloor = new THREE.PlaneBufferGeometry( 800, 800 );
    this.mshFloor = new THREE.Mesh( this.geoFloor, this.matFloor );
    this.mshFloor.rotation.x = - 2 * Math.PI / 360 * 90;
    this.mshFloor.position.set( 0, -40, 40 );
    this.mshFloor.receiveShadow = true;
    this.scene.add(this.mshFloor);

    this.carsOption = document.querySelectorAll(".car-option");

    this.controlPopUp = document.querySelector(".fade-wrapper");

    this.bgm = this.createElement("audio", {id: "bgm"}, "source", {src: "asset/audio/JAEGER_Until_Dawn.mp3", type: "audio/mp3"});
    console.log(this.bgm);
  }

  createElement (tag, attr, childTag, attrChild) {
    const el = document.createElement(tag);
    let child;
    if(attr){ this.setAttributes(el, attr); }
    if(childTag){ child = document.createElement(childTag); }
    if(attrChild){ this.setAttributes(child, attrChild); }
    el.appendChild(child);
    return el;
  }

  setAttributes (el, attr) {
    for( let key in attr ){
      el[key] = attr[key];
    }
  }

  addCarsToScene = (carsModel) => {
    carsModel.forEach( carModel => {
      this.scene.add(carModel);
    });
  };

  showChosenCar (carsData, carsModel) {
    for(let i = 0; i < carsData.length; i++){
      if(carsData[i].chosen){
        carsModel[i].visible = true;
        this.carsOption[i].classList.add("selected");
      }else {
        carsModel[i].visible = false;
        this.carsOption[i].classList.remove("selected");
      }
    }
  };

  showArrow (state) {
    document.querySelectorAll(".arrow").forEach( arrow => {
      if(arrow.classList.contains("arrow-hidden")){
        arrow.classList.remove("arrow-hidden");
      }else {
        arrow.classList.add("arrow-hidden");
      }
    });
  }

  showControl (show) {
    if(show){
      this.controlPopUp.style.display = "block";
    }else {
      this.controlPopUp.style.display = "none";
    }
  };

  startGame () {
    location.href = "game.html";
  }

  bindHandleChooseCarByClick (handler) {
    document.querySelector(".car-options-wrapper").addEventListener("click", e => {
      if(e.target.classList.contains("car-option")){
        const id = parseInt(e.target.id);
        handler(id);
      }
    });
  }

  bindHandleChooseCarByKeydown (handler, keycode1, keycode2) {
    document.body.addEventListener("keydown", e => {
      if(e.keyCode === keycode1 || e.keyCode === keycode2){
        handler();
      }
    });
  }

  bindHandleClickShowControl (handler) {
    document.body.addEventListener("click", e => {
      if(e.target.id === "control"){
        handler(true);
      } else if(e.target.id === "start"){
        handler();
      } else {
        handler(false);
      }
    });
  }

  resize () {
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    });
  }

  render = () => {
    requestAnimationFrame(this.render);
    this.composer.render();
  }

}

export default View;
