/* js[!admin] */

/**
 * @typedef {{
 * product_feature_id: number
 * name: string
 * data_type: string
 * options?: string
 * physical_measure?: string
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
 * value: string
 * feature_name?: string
 * full_value?: string
 * all_ids?: number[]
 * }} ProductFeatureOptionData
 *
 */

/**
 * @type {ProductFeatureOptionData[]}
 */
let product_feature_options = [];

function loadedProductFeatures() {
	product_features.forEach((feature) => {
		if (feature.data_type.endsWith("_list")) {
			feature.options = product_feature_options
				.filter((e) => e.product_feature_id === feature.product_feature_id)
				.map((e) => e.value)
				.join(", ");
		} else {
			const data_type_data = feature_data_types[feature.data_type];
			if (data_type_data) {
				feature.options = data_type_data.description;
			} else {
				feature.options = "";
			}
		}
	});

	product_feature_options.forEach((option) => {
		const feature = product_features.find((feature) => feature.product_feature_id === option.product_feature_id);
		option.feature_name = feature ? feature.name : "";
	});

	product_feature_options.forEach((option) => {
		let full_name = option.feature_name + " " + option.value;
		let all_ids = [option.product_feature_option_id];
		let parent = option;
		while (true) {
			if (parent.parent_product_feature_option_id === -1) {
				break;
			}
			parent = product_feature_options.find((e) => e.product_feature_option_id === parent.parent_product_feature_option_id);
			if (!parent) {
				break;
			}
			full_name = parent.feature_name + " " + parent.value + " | " + full_name;
			all_ids.push(parent.product_feature_option_id);
		}
		option.full_value = full_name;

		option.parent_product_feature_option_id;
		option.all_ids = all_ids;
	});
}

function refreshProductFeatures(callback = undefined) {
	xhr({
		url: STATIC_URLS["ADMIN"] + "/product/feature/all_with_options",
		success: (res) => {
			product_features = res.features;
			product_feature_options = res.options;
			loadedProductFeatures();
			window.dispatchEvent(new CustomEvent("product_features_changed"));
		},
	});
}
