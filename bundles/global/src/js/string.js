/* js[global] */

// also links.php
function replacePolishLetters(string) {
	const pl = ["ę", "Ę", "ó", "Ó", "ą", "Ą", "ś", "Ś", "ł", "Ł", "ż", "Ż", "ź", "Ź", "ć", "Ć", "ń", "Ń"];
	const en = ["e", "E", "o", "O", "a", "A", "s", "S", "l", "L", "z", "Z", "z", "Z", "c", "C", "n", "N"];

	var len = pl.length;
	for (let i = 0; i < len; i++) {
		string = string.replace(new RegExp(`${pl[i]}`, "g"), en[i]);
	}
	return string;
}

function capitalize(str) {
	const first = str.charAt(0);
	return str.replace(first, first.toUpperCase());
}

function regexCount(str, reg_str) {
	return (str.match(new RegExp(`${reg_str}`, "g")) || []).length;
}

// so wrong
// function snakeCase(str) {
// 	return str.replace(/-([a-z])/gi, (s, gr1) => gr1.toUpperCase());
// }

const kebabCase = (str) => {
	return str
		.split("")
		.map((letter, idx) => (letter.toUpperCase() === letter ? `${idx !== 0 ? "-" : ""}${letter.toLowerCase()}` : letter))
		.join("");
};

function camelCase(str) {
	let arr = str.split("-");
	let capital = arr.map((item, i) => (i ? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase() : item.toLowerCase()));
	return capital.join("");
}

function titleCase(str) {
	let arr = str.split("-");
	let capital = arr.map((item) => item.charAt(0).toUpperCase() + item.slice(1).toLowerCase());
	return capital.join("");
}

function compTitleCase(str) {
	str = titleCase(str);
	let arr = str.split("_");
	let capital = arr.map((item) => item.charAt(0).toUpperCase() + item.slice(1));
	return capital.join("_");
}

function escapeHTML(unsafeText) {
	let div = document.createElement("div");
	div.innerHTML = unsafeText;
	return div.innerText;
}

function escapeCSS(prop, val) {
	let div = document.createElement("div");
	div.style[prop] = val;
	return div.style[prop];
}

function escapeNumericalExpression(str) {
	return str.replace(/[^\d,.\*\-\+\/\(\)]*/g, "");
}

/**
 *
 * @param {string | number} str
 * @returns
 */
function escapeAttribute(str) {
	return (str + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
