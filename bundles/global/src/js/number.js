/* js[global] */

function numberFromStr(str) {
	if (typeof str === "number") return str;
	return +str.replace(/[^\d,\.-]/g, "");
}

function round(num, decimalPlaces = 0) {
	num = Math.round(+(num + "e" + decimalPlaces));
	return Number(num + "e" + -decimalPlaces);
}
