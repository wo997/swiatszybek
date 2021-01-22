/* js[global] */

String.prototype.replacePolishLetters = function () {
	return replacePolishLetters(this);
};

String.prototype.capitalize = function () {
	return capitalize(this);
};

function regexCount(str, reg_str) {
	return (str.match(new RegExp(`${reg_str}`, "g")) || []).length;
}

function kebabToSnakeCase(string) {
	return string.replace(/-([a-z])/gi, function (s, group1) {
		return group1.toUpperCase();
	});
}
