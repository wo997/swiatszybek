/* js[global] */

/**
 *
 * @param {string} str
 * @returns
 */
function numberFromStr(str) {
	if (!str) return 0;
	if (typeof str === "number") return str;

	str = str.replace(/,/g, ".");
	const match_number = str.match(/[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/);
	if (match_number) {
		return parseFloat(match_number[0]);
	}
	return 0;
}

function round(num, decimalPlaces = 0) {
	num = Math.round(+(num + "e" + decimalPlaces));
	return Number(num + "e" + -decimalPlaces);
}

function floor(num, decimalPlaces = 0) {
	num = Math.floor(+(num + "e" + decimalPlaces));
	return Number(num + "e" + -decimalPlaces);
}

/**
 *
 * @param {number} num
 */
function prettyPrice(num) {
	if (!num) {
		return "0";
	}
	if (typeof num === "string") {
		num = +num;
	}
	return num.toFixed(2);
}

function clamp(min, val, max) {
	return Math.max(min, Math.min(val, max));
}
