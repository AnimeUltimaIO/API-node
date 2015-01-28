exports.isNumber = function (input) {
  return !Number.isNaN(parseInt(input, 10));
}

exports.capitalize = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}