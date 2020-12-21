/* js[global] */

String.prototype.replacePolishLetters = function () {
	return replacePolishLetters(this);
};

String.prototype.capitalize = function () {
	return capitalize(this);
};

String.prototype.strCount = function (str_or_regexp) {
	return (this.match(new RegExp(`${str_or_regexp}`, "g")) || []).length;
};
