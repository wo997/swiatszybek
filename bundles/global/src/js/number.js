/* js[global] */

function numberFromStr(str) {
	if (!str) return 0;
	if (typeof str === "number") return str;
	return parseFloat(str.replace(/,/g, ".").replace(/[^\d\.\-\+e]/g, ""));
}

function round(num, decimalPlaces = 0) {
	num = Math.round(+(num + "e" + decimalPlaces));
	return Number(num + "e" + -decimalPlaces);
}
