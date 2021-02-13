/* js[global] */

function numberFromStr(str) {
	return +str.replace(/[^\d,\.-]/g, "");
}

function strNumerical(str) {
	return str.replace(/[^\d,\.-]/g, "").length > 0;
}
