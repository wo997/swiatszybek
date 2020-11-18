/* js[global] */

// also array.php
function getRowById(array, id, id_name = "id") {
  return array.find((e) => {
    return e[id_name] == id;
  });
}

Array.prototype.last = function () {
  return this[this.length - 1];
};
