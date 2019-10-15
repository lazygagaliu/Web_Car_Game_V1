import { MTLLoader, OBJLoader } from "three-obj-mtl-loader";

class Model {
  constructor(){
    this.carsModel = [];
    // Load JSON
    fetch("./data.json").then( res => {
      return res.json();
    }).then( data => {
      this.data = data;
      this.data.cars.map( async car => {
        let carModel = await this.loadModel( car.path, car.mtl, car.obj );
        this.carsModel.push(carModel);
        if(this.carsModel.length === this.data.cars.length){
          this.onCarsLoaded(this.carsModel);
          this.onChosenCarChanged( this.data.cars, this.carsModel );
        }
      });
    });

     this.start = false;
     this.showControl = false;


  }

  // Load Model
  loadModel ( path, mtl, obj ) {
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
          resolve(object);
        });
      });
    });
  };

  // toggleCar for keyboard
  toggleCarKeyboard () {
    this.data.cars = this.data.cars.map( car => {
      return { id: car.id, path: car.path, mtl: car.mtl, obj: car.obj, chosen: !car.chosen };
    });
    this.onChosenCarChanged( this.data.cars, this.carsModel );
  };

  // toggleCar for clicking
  toggleCarClick (id) {
    this.data.cars = this.data.cars.map( car => {
      return car.id === id ? { id: car.id, path: car.path, mtl: car.mtl, obj: car.obj, chosen: true } : { id: car.id, path: car.path, mtl: car.mtl, obj: car.obj, chosen: false };
    });
    this.onChosenCarChanged( this.data.cars, this.carsModel );
  };

  startGame () {
    this.start = true;
  };

  showControl () {
    this.showControl = true;
  };

  bindAddCarsToScene (callback) {
    this.onCarsLoaded = callback;
  }

  bindChosenCarChanged (callback) {
    this.onChosenCarChanged = callback;
  };

}

export default Model;
