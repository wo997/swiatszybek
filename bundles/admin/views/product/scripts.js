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
				options: [{ option_id: 4 }],
			},
		],
	});

	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp");

	datatableComp(datatable_comp, undefined, {
		rows: [
			{ row: { pies_id: 5, kot: "aaaa" } },
			{ row: { pies_id: 6, kot: "aaaabb" } },
			{ row: { pies_id: 7, kot: "ggg" } },
			{ row: { pies_id: 8, kot: "ads" } },
			{ row: { pies_id: 9, kot: "v" } },
			{ row: { pies_id: 10, kot: "7777777" } },
			{ row: { pies_id: 11, kot: " " } },
			{ row: { pies_id: 12, kot: "fsfsfds" } },
		],
		columns: [
			{ label: "Pies", key: "pies_id", width: "100px", primary: true },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
			{ label: "Kot", key: "kot", width: "200px" },
		],
	});

	setTimeout(() => {
		datatable_comp._data.rows = [
			{ row: { pies_id: 12, kot: "fsfsfds" } },
			{ row: { pies_id: 5, kot: "aaaa" } },
			{ row: { pies_id: 6, kot: "aaaabb" } },
			{ row: { pies_id: 7, kot: "ggg" } },
			{ row: { pies_id: 8, kot: "ads" } },
			{ row: { pies_id: 9, kot: "v" } },
			{ row: { pies_id: 10, kot: "7777777" } },
			{ row: { pies_id: 11, kot: " " } },

			// { row: { pies_id: 6, kot: "aaaabb" } },
			// { row: { pies_id: 5, kot: "aaaa" } },
			// { row: { pies_id: 10, kot: "7777777" } },
			// { row: { pies_id: 8, kot: "ads" } },
			// { row: { pies_id: 9, kot: "v" } },
			// { row: { pies_id: 11, kot: " " } },
			// { row: { pies_id: 12, kot: "fsfsfds" } },
			// { row: { pies_id: 7, kot: "ggg" } },

			// { row: { pies_id: 6, kot: "aaaabb" } },
			// { row: { pies_id: 5, kot: "aaaa" } },
			// { row: { pies_id: 11, kot: " " } },
			// { row: { pies_id: 7, kot: "ggg" } },
			// { row: { pies_id: 9, kot: "v" } },
			// { row: { pies_id: 10, kot: "7777777" } },
			// { row: { pies_id: 12, kot: "fsfsfds" } },
			// { row: { pies_id: 8, kot: "ads" } },
		];
		// console.time();
		// for (let i = 0; i < 20; i++) {
		// 	datatable_comp._data.rows.push({ row: { pies_id: i + 100, kot: "c" } });
		// }
		datatable_comp._set_data();
		// console.timeEnd();
	}, 1000);
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
