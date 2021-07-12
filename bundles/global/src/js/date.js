/* js[global] */

const m_pol = [
	"stycznia",
	"lutego",
	"marca",
	"kwietnia",
	"maja",
	"czerwca",
	"lipca",
	"sierpnia",
	"września",
	"października",
	"listopada",
	"grudnia",
];

/**
 *
 * @param {Date | string} str
 * @param {boolean} include_time
 * @returns
 */
function niceDate(str, include_time = false) {
	/** @type {Date} */
	let datetime;
	if (typeof str === "string") {
		datetime = getDateFromString(str);
	} else {
		datetime = str;
	}

	let d = datetime.getDate() + " " + m_pol[datetime.getMonth()] + " " + datetime.getFullYear();

	if (include_time) {
		d += " " + leadingZeros(datetime.getHours()) + ":" + leadingZeros(datetime.getMinutes());
	}

	return d;
}

/**
 *
 * @param {number | string} num
 * @param {number} len
 * @returns
 */
function leadingZeros(num, len = 2) {
	return ("0".repeat(len) + num.toString()).slice(-len);
}

function dateToString(datetime, type = "") {
	var mon = datetime.getMonth() + 1;
	var day = datetime.getDate();

	if (mon < 10) mon = "0" + mon;
	if (day < 10) day = "0" + day;

	return type == "dmy" ? day + "-" + mon + "-" + datetime.getFullYear() : datetime.getFullYear() + "-" + mon + "-" + day;
}

function reverseDateString(dateString, splitter) {
	return dateString.split(splitter).reverse().join(splitter);
}

function changeDateTime(datetimeString, diff) {
	var datetime = new Date(datetimeString);
	datetime.setTime(datetime.getTime() + diff);
	return dateToString(datetime);
}

/**
 *
 * @param {string} datetime_str
 * @returns
 */
function getDateFromString(datetime_str) {
	return new Date(datetime_str.replace(" ", "T"));
}
