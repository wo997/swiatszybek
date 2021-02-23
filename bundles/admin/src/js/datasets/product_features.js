/* js[!admin] */

/**
 * @typedef {{
 * product_feature_id: number
 * name: string
 * options?: string
 * }} ProductFeatureData
 *
 */

/**
 * @type {ProductFeatureData[]}
 */
let product_features = [];

/**
 * @typedef {{
 * product_feature_option_id: number
 * product_feature_id: number
 * parent_product_feature_option_id: number
 * name: string
 * feature_name?: string
 * }} ProductFeatureOptionData
 *
 */

/**
 * @type {ProductFeatureOptionData[]}
 */
let product_feature_options = [];

function loadedProductFeatures() {
	product_features.forEach((feature) => {
		feature.options = product_feature_options
			.filter((e) => e.product_feature_id === feature.product_feature_id)
			.map((e) => e.name)
			.join(", ");
	});

	product_feature_options.forEach((option) => {
		const feature = product_features.find((feature) => feature.product_feature_id === option.product_feature_id);
		option.feature_name = feature ? feature.name : "";
	});
}

function refreshProductFeatures() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "product/feature/all_with_options",
		success: (res) => {
			product_features = res.features;
			product_feature_options = res.options;
			loadedProductFeatures();
			window.dispatchEvent(new CustomEvent("product_features_changed"));
		},
	});
}
