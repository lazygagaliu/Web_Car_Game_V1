import View from "./view.js";
import Model from "./model.js";
jest.mock('./model.js');
jest.mock('./view.js');

test("test", () => {
  const view = new View();
  view.createElement = function (tag, attr, childTag, attrChild) {
    const el = document.createElement(tag);
    let child;
    if(attr){ this.setAttributes(el, attr); }
    if(childTag){ child = document.createElement(childTag); }
    if(attrChild){ this.setAttributes(child, attrChild); }
    if(child !== undefined){el.appendChild(child)};
    return el;
  }
  expect(view.createElement("div")).toBeInstanceOf(HTMLDivElement);
});

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  Model.mockClear();
});

it('We can check if the class constructor has been called', () => {
  const model = new Model();
  expect(Model).toHaveBeenCalledTimes(1);
});
