/* js[global] */

function numberFromStr(str) {
	return +str.replace(/[^\d,\.-]/g, "");
}
