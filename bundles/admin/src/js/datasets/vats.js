/* js[!global] */

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

function loadedVats() {}

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
