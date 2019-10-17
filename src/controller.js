import OrbitControls from 'three-orbitcontrols';

class Controller {
  constructor(model, view){
    this.model = model;
    this.view = view;

    this.model.bindAddCarsToScene(this.onCarsLoaded);
    this.model.bindChosenCarChanged(this.onChosenCarChanged);
    this.model.bindShowControl(this.onShowControlChanged);
    this.model.bindArrowChanged(this.onArrowStateChanged);
    this.model.bindStartGame(this.onGameStateChanged);

    this.view.bindHandleChooseCarByClick(this.handleChooseCarByClick);
    this.view.bindHandleChooseCarByKeydown(this.handleChooseCarByKeydown, 37, 39);
    this.view.bindHandleChooseCarByKeydown(this.handleOptionsByKeydown, 38, 40);
    this.view.bindHandleChooseCarByKeydown(this.handleReturnKeydown, 13, "");
    this.view.bindHandleClickShowControl(this.handleClickShowControl);

    this.controls = new OrbitControls(this.view.camera, this.view.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
  }

  onCarsLoaded = carsModel => {
    this.view.addCarsToScene( carsModel );
  };

  onChosenCarChanged = (carsData, carsModel) => {
    if(carsData && carsModel){
      this.view.showChosenCar( carsData, carsModel );
    }
  };

  onShowControlChanged = show => {
    this.view.showControl(show);
  }

  onArrowStateChanged = () => {
    this.view.showArrow();
  }

  onGameStateChanged = () => {
    this.view.startGame();
  }

  handleChooseCarByClick = (id) => {
    this.model.toggleCarClick(id);
  };

  handleChooseCarByKeydown = () => {
    this.model.toggleCarKeyboard();
  };

  handleOptionsByKeydown = (state) => {
    this.model.toggleArrow(state);
  };

  handleClickShowControl = (show) => { // Change names
    if(show === undefined){
      this.model.startGame();
    } else {
      this.model.showControl(show);
    }
  }

  handleReturnKeydown = () => {
    this.model.returnAction();
  }

}

export default Controller;
