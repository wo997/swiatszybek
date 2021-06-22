/* js[!admin] */

/**
 * @typedef {{
 * vat_id: number
 * value: number
 * description: string
 * }} VatData
 *
 */

/**
 * @type {VatData[]}
 */
let vats = [];

function loadedVats() {
	vats.forEach((v) => {
		v.value = +v.value; // a decimal is a string lol
	});
}

function refreshVats() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "/vat/all",
		success: (res) => {
			vats = res;
			loadedVats();
			window.dispatchEvent(new CustomEvent("vats_changed"));
		},
	});
}
