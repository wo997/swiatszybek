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
	fetchProductFeatures();

	/** @type {ProductComp} */
	// @ts-ignore
	const my_list_node = $("product-comp");

	productComp(my_list_node, undefined, {
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
				options: [{ option_id: 4 }],
			},
		],
	});
});

registerModalContent(/*html*/ `
    <div id="selectProductVariant" data-expand data-dismissable>
        <div class="modal-body">
            <div class="custom-toolbar">
                <span class="title">Cechy produktów</span>
                <button class="btn primary" onclick="hideParentModal(this)">Ukryj <i class="fas fa-times"></i></button>
            </div>
            <div class="stretch-vertical">
                Cechy produktów tutaj
            </div>
        </div>
    </div>
`);
