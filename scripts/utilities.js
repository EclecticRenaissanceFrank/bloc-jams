"use strict";

/*

Write a function named forEach in the utilities.js file.
For educational purposes, DO NOT use the built-in Array.prototype.forEach
function mentioned in the callback resource.
The goal is to write your own function named forEach. It should:

Use a loop to go through all elements in the points array.
Execute a callback for each element.
Replace the for loop in the animatePoints function with a forEach block
and confirm that the selling points still animate properly.


var forEach = function () {

for(var i = 0; i < pointsArray.length; i++){


};


};


*/

function forEach(array, callback) {
  for(var i = 0; i < array.length; i++) {
    callback(array[i]);
  }
}
