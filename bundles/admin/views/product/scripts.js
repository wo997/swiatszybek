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
				<div class="custom-toolbar">
					<span class="title">Cecha produktu</span>
					<button class="btn primary" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
				</div>
				<div class="scroll-panel scroll-shadow panel-padding">
					<product-feature-comp></product-feature-comp>
				</div>
			</div>
		</div>
	`);

	fetchProductFeatures();

	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	productComp(product_comp, undefined, {
		id: 5,
		name: "asdsad",
		sell_by: "qty",
		variants: [
			{
				feature_id: 3,
				options: [{ option_id: 4 }, { option_id: 5 }],
			},
			{
				feature_id: 4,
				options: [{ option_id: 8 }],
			},
		],
	});

	const name_input = product_comp._child(`product-comp [data-bind="name"]`);
	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(name_input._get_value());
		});
	};
	name_input.addEventListener("change", nameChange);
	nameChange();

	/** @type {ProductFeatureComp} */
	// @ts-ignore
	const product_feature_comp = $("#productFeature product-feature-comp");

	productFeatureComp(product_feature_comp, undefined, { name: "", feature_id: -1, options: [] });

	/** @type {SelectProductFeaturesComp} */
	// @ts-ignore
	const select_product_features_comp = $("#selectProductFeatures select-product-features-modal-comp");

	selectProductFeaturesComp(select_product_features_comp, undefined);
});
