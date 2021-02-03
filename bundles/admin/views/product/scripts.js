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
	registerModalContent(/*html*/ `
        <div id="addProductFeature" data-expand data-dismissable>
            <div class="modal-body">
                <div class="custom-toolbar">
                    <span class="title">Cecha produktu</span>
                    <button class="btn primary" onclick="hideParentModal(this)">Ukryj <i class="fas fa-times"></i></button>
                </div>
                <div class="scroll-panel scroll-shadow panel-padding">
                    <product-feature-comp class="dt_product_features"></product-feature-comp>
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

	/** @type {DatatableComp} */
	// @ts-ignore
	const dt_product_features = $(".dt_product_features");

	datatableComp(dt_product_features, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "search_product_attributes",
		columns: [
			{ label: "Cecha", key: "name", width: "300px", sortable: true, searchable: "string" },
			{ label: "Typ danych", key: "data_type", width: "200px", sortable: true, searchable: "string" },
			{ label: "Wartości", key: "attr_values", width: "200px", sortable: true, searchable: "number" },
		],
		primary_key: "attribute_id",
		empty_html: /*html*/ `Brak cech`,
		label: "Cechy produktów",
		after_label: /*html*/ `
            <button class="add_feature_btn btn important">
                Dodaj <i class="fas fa-plus"></i>
            </button>
        `,
	});

	dt_product_features.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const add_feature_btn = target._parent(".add_feature_btn", { skip: 0 });
		if (add_feature_btn) {
			showModal("addProductFeature", {
				source: add_feature_btn,
			});
		}
	});
});
