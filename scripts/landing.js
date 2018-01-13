/*
var animatePoints = function() {

         var points = document.getElementsByClassName('point');

         var revealFirstPoint = function() {
             points[0].style.opacity = 1;
             points[0].style.transform = "scaleX(1) translateY(0)";
             points[0].style.msTransform = "scaleX(1) translateY(0)";
             points[0].style.WebkitTransform = "scaleX(1) translateY(0)";
         };

         var revealSecondPoint = function() {
             points[1].style.opacity = 1;
             points[1].style.transform = "scaleX(1) translateY(0)";
             points[1].style.msTransform = "scaleX(1) translateY(0)";
             points[1].style.WebkitTransform = "scaleX(1) translateY(0)";
         };

         var revealThirdPoint = function() {
             points[2].style.opacity = 1;
             points[2].style.transform = "scaleX(1) translateY(0)";
             points[2].style.msTransform = "scaleX(1) translateY(0)";
             points[2].style.WebkitTransform = "scaleX(1) translateY(0)";
         };

         revealFirstPoint();
         revealSecondPoint();
         revealThirdPoint();

     };







     animatePoints();
     Refactor the individual style calls of the landing.js script to be a single function named revealPoint that:
     takes a single argument: the index of the points class node element, and
     gets called in a for loop.


OOPS!
var animatePoints = function() {

  var revealPoint = function(i) {
    var points = document.getElementsByClassName('point');

      for(i = 0; i < points.length; i++) {
        points[i].style.opacity = 1;
        points[i].style.transform = "scaleX(1) translateY(0)";
        points[i].style.msTransform = "scaleX(1) translateY(0)";
        points[i].style.WebkitTransform = "scaleX(1) translateY(0)";
      }

      revealPoint(i);
  }
}
OOPS!
*/


var animatePoints = function() {

  var points = document.getElementsByClassName('point');

  var revealPoint = function(index) {
    points[index].style.opacity = 1;
    points[index].style.transform = "scaleX(1) translateY(0)";
    points[index].style.msTransform = "scaleX(1) translateY(0)";
    points[index].style.WebkitTransform = "scaleX(1) translateY(0)";
  }

  for (var i = 0; i < points.length; i++) {
    revealPoint(i);
  }
};
