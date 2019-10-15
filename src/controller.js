class Controller {
  constructor(model, view){
    this.model = model;
    this.view = view;

    this.model.bindAddCarsToScene(this.onCarsLoaded);
    this.model.bindChosenCarChanged(this.onChosenCarChanged);

    this.view.bindHandleChooseCarByClick(this.handleChooseCarByClick);
    this.view.bindHandleChooseCarByKeydown(this.handleChooseCarByKeydown);
  }

  onCarsLoaded = carsModel => {
    this.view.addCarsToScene( carsModel );
  };

  onChosenCarChanged = (carsData, carsModel) => {
    if(carsData && carsModel){
      this.view.showChosenCar( carsData, carsModel );
    }
  };

  handleChooseCarByClick = (id) => {
    this.model.toggleCarClick(id)
;  };

  handleChooseCarByKeydown = (id) => {
    this.model.toggleCarKeyboard(id);
  };

}

export default Controller;
