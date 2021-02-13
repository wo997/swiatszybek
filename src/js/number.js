/* js[global] */

function numberFromStr(str) {
	if (typeof str === "number") return str;
	return +str.replace(/[^\d,\.-]/g, "");
}

function strNumerical(str) {
	return str.replace(/[^\d,\.-]/g, "").length > 0;
}
