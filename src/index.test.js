import sum from "./try.js";
import View from "./view.js";
import Model from "./model.js";
import Controller from "./controller.js";

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
