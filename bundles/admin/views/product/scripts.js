/* js[view] */

//let select_feature_options_html = "";
/**
 * @type {{
 * feature_id: number,
 * name: string,
 * options: {
 *  option_id: number,
 *  name: string
 * }[]
 * }[]}
 */
let product_features = [];
function fetchProductFeatures() {
	product_features = [
		{
			feature_id: 3,
			name: "Kolor",
			options: [
				{ option_id: 4, name: "Czerwony" },
				{ option_id: 5, name: "Zielony" },
				{ option_id: 6, name: "Żółty" },
			],
		},
		{
			feature_id: 4,
			name: "Pojemość dysku",
			options: [
				{ option_id: 8, name: "64 GB" },
				{ option_id: 9, name: "128 GB" },
				{ option_id: 10, name: "256 GB" },
			],
		},
	];

	// select_feature_options_html = "";

	// for (const feature of features) {
	// 	select_feature_options_html += `<option value='${feature.feature_id}'>${feature.name}</option>`;
	// }

	// $$(".feature_list").forEach((e) => {
	// 	e._set_content(select_feature_options_html);
	// });
}

domload(() => {
	registerModalContent(html`
		<div id="selectProductFeatures" data-expand data-dismissable>
			<div class="modal-body">
				<select-product-features-modal-comp></select-product-features-modal-comp>
			</div>
		</div>
	`);

	registerModalContent(html`
		<div id="productFeature" data-expand data-dismissable>
			<div class="modal-body">
				<product-feature-modal-comp></product-feature-modal-comp>
			</div>
		</div>
	`);

	fetchProductFeatures();

	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	productComp(product_comp, undefined, {
		id: -1,
		name: "",
		sell_by: "qty",
		variants: [],
		products: [],
	});

	/** @type {ProductFeatureModalComp} */
	// @ts-ignore
	const product_feature_modal_comp = $("#productFeature product-feature-modal-comp");

	productFeatureModalComp(product_feature_modal_comp, undefined, { product_feature: { name: "", feature_id: -1, options: [] } });

	/** @type {SelectProductFeaturesModalComp} */
	// @ts-ignore
	const select_product_features_modal_comp = $("#selectProductFeatures select-product-features-modal-comp");

	selectProductFeaturesModalComp(select_product_features_modal_comp, undefined);

	// finally
	const name_input = product_comp._child(`product-comp [data-bind="name"]`);
	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(name_input._get_value());
		});
	};
	name_input.addEventListener("change", nameChange);
	nameChange();
});
