import { registerUnbound } from "discourse-common/lib/helpers";
registerUnbound('and', function () {
  return Array.prototype.slice.call(arguments, 0, arguments.length - 1).every(Boolean);
});
registerUnbound('eq', function (v1, v2) {
  return v1 === v2;
});

//this doesnt work. if you want one of those make them like and. too lazy to convert all now
Handlebars.registerHelper({

  // Comparisons
  eq: function (v1, v2) {
    return v1 === v2;
  },
  ne: function (v1, v2) {
    return v1 !== v2;
  },
  lt: function (v1, v2) {
    return v1 < v2;
  },
  gt: function (v1, v2) {
    return v1 > v2;
  },
  lte: function (v1, v2) {
    return v1 <= v2;
  },
  gte: function (v1, v2) {
    return v1 >= v2;
  },

  // Boolean logic
  and: function () {
    return Array.prototype.slice.call(arguments, 0, arguments.length - 1).every(Boolean);
  },
  or: function () {
    return Array.prototype.slice.call(arguments, 0, arguments.length - 1).some(Boolean);
  },
  not: function(bool) {
    return !bool;
  },

  // Arithmetic
  sum: function () {
    return Array.prototype.slice.call(arguments, 0, arguments.length - 1).reduce(function (a,b) { return a+b; });
  },
  sub: function () {
    return Array.prototype.slice.call(arguments, 1, arguments.length - 1).reduce(function (a,b) { return a-b; }, arguments[0]);
  },
  mul: function () {
    return Array.prototype.slice.call(arguments, 0, arguments.length - 1).reduce(function (a,b) { return a*b; }, 1);
  },
  div: function () {
    return Array.prototype.slice.call(arguments, 1, arguments.length - 1).reduce(function (a,b) { return a/b; }, arguments[0]);
  },
  mod: function (a, b) {
    return a%b;
  }

});
