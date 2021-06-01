/* js[!admin] */

/**
 * @typedef {{
 * rebate_code_id: number
 * code: string
 * value: number
 * qty: string
 * available_from: string
 * available_till: string
 * general_products_json: string
 * users_json: string
 * }} RebateCodeData
 */

/** @type {RebateCodeData[]} */
let rebate_codes;

function loadedRebateCodes() {}

function refreshRebateCodes() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "/rebate_code/all",
		success: (res) => {
			rebate_codes = res;
			loadedRebateCodes();
			window.dispatchEvent(new CustomEvent("rebate_codes_changed"));
		},
	});
}
