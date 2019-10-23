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
          this.setDefaultChosenCarForStorage(this.data.cars); // JSON.parse( localStorage.getItem("chosencar") ) ||
        }
      });
    });

    this.arrowState = 0; // 0 start 1 control
    this.start = false;
    this.showControlState = false;

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
    const chosenCar = this.getChosenCarForStorage(this.data.cars);
    this._updateCar( this.data.cars, this.carsModel, chosenCar );
  };

  // toggleCar for clicking
  toggleCarClick (id) {
    this.data.cars = this.data.cars.map( car => {
      return car.id === id ? { id: car.id, path: car.path, mtl: car.mtl, obj: car.obj, chosen: true } : { id: car.id, path: car.path, mtl: car.mtl, obj: car.obj, chosen: false };
    });
    const chosenCar = this.getChosenCarForStorage(this.data.cars);
    this._updateCar( this.data.cars, this.carsModel, chosenCar );
  };

  getChosenCarForStorage (carsData) {
    return carsData.filter( car => car.chosen === true );
  }

  setDefaultChosenCarForStorage (carsData) {
    const chosenCar = this.getChosenCarForStorage(carsData);
    localStorage.setItem( "chosencar", JSON.stringify(chosenCar) );
  }

  toggleArrow () {
    if(this.arrowState === 0){
      this.arrowState = 1;
    }else {
      this.arrowState = 0;
    }
    this.onArrowStateChanged();
    return this.arrowState;
  }

  startGame () {
    this.start = true;
    this.onGameStateChanged();
  };

  showControl (show) {
    this.showControlState = show;
    this.onShowControlChanged(this.showControlState);
  };

  returnAction () {
    if(this.arrowState === 0){
      this.startGame();
    }else {
      this.showControl(true);
    }
  }

  bindAddCarsToScene (callback) {
    this.onCarsLoaded = callback;
  }

  bindChosenCarChanged (callback) {
    this.onChosenCarChanged = callback;
  };

  bindShowControl (callback) {
    this.onShowControlChanged = callback;
  };

  bindArrowChanged (callback) {
    this.onArrowStateChanged = callback;
  }

  bindStartGame (callback) {
    this.onGameStateChanged = callback;
  }

  _updateCar(carsData, carsModel, chosenCar){
    this.onChosenCarChanged( carsData, carsModel );
    localStorage.setItem( "chosencar", JSON.stringify(chosenCar) );
  }

}

export default Model;
