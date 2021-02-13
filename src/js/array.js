/* js[global] */

// also array.php
function getRowById(array, id, id_name = "id") {
	return array.find((e) => {
		return e[id_name] == id;
	});
}

// meh, ide doesn't love it
/*Array.prototype.last = function () {
	return this[this.length - 1];
};*/

function getLast(arr) {
	if (arr.length === 0) {
		return undefined;
	}
	return arr[arr.length - 1];
}

function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}
