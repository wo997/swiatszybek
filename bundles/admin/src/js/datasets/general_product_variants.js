/* js[!admin] */

/**
 * @typedef {{
 * general_product_variant_id: number
 * general_product_id?: number
 * name?: string
 * }} GeneralProductVariantData
 *
 */

/**
 * @type {GeneralProductVariantData[]}
 */
let general_product_variants = [];

/**
 * @typedef {{
 * general_product_variant_option_id: number
 * general_product_variant_id: number
 * value: string
 * }} GeneralProductVariantOptionData
 *
 */

/**
 * @type {GeneralProductVariantOptionData[]}
 */
let general_product_variant_options = [];

function loadedGeneralProductVariants() {}

function refreshGeneralProductVariants() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "/general_product/variant/all_with_options",
		success: (res) => {
			general_product_variants = res.variants;
			general_product_variant_options = res.options;
			modifyGeneralProductVariants();
			loadedGeneralProductVariants();
			window.dispatchEvent(new CustomEvent("general_product_variants_changed"));
		},
	});
}

function modifyGeneralProductVariants() {
	const option_ids = [];

	window.dispatchEvent(
		new CustomEvent("modify_general_product_variants", {
			detail: {
				option_ids,
			},
		})
	);

	return option_ids;
}
