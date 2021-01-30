/* js[global] */

// also links.php
function replacePolishLetters(string) {
	const pl = [
		"ę",
		"Ę",
		"ó",
		"Ó",
		"ą",
		"Ą",
		"ś",
		"Ś",
		"ł",
		"Ł",
		"ż",
		"Ż",
		"ź",
		"Ź",
		"ć",
		"Ć",
		"ń",
		"Ń",
	];
	const en = [
		"e",
		"E",
		"o",
		"O",
		"a",
		"A",
		"s",
		"S",
		"l",
		"L",
		"z",
		"Z",
		"z",
		"Z",
		"c",
		"C",
		"n",
		"N",
	];

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

function snakeCase(str) {
	return str.replace(/-([a-z])/gi, function (s, gr1) {
		return gr1.toUpperCase();
	});
}
function camelCase(str) {
	let arr = str.split("-");
	let capital = arr.map((item, i) =>
		i
			? item.charAt(0).toUpperCase() + item.slice(1).toLowerCase()
			: item.toLowerCase()
	);
	// ^-- change here.
	let capitalString = capital.join("");

	console.log(capitalString);
}
