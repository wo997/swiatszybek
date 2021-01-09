/* js[global] */

// also array.php
function getRowById(array, id, id_name = "id") {
	return array.find((e) => {
		return e[id_name] == id;
	});
}

/*Array.prototype.last = function () {
	return this[this.length - 1];
};*/

function getLast(arr) {
	if (arr.length === 0) {
		return undefined;
	}
	return arr[arr.length - 1];
}
