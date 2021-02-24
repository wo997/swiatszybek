/* js[view] */

domload(() => {
	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	productComp(product_comp, undefined);

	$(".main_header .history_btns_wrapper").appendChild(product_comp._nodes.history);
	$(".main_header .save_btn_wrapper").appendChild(product_comp._nodes.save_btn);

	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(product_comp._data.name ? product_comp._data.name : "Nowy produkt");
		});
	};
	product_comp.addEventListener("change", nameChange);
	nameChange();

	//const d = `{"id":-1,"name":"","sell_by":"qty","features":[{"product_feature_id":1,"name":"Kolor","options":[{"product_feature_option_id":59,"product_feature_id":1,"name":"Czerwony"},{"product_feature_option_id":60,"product_feature_id":1,"name":"Beżowy"},{"product_feature_option_id":62,"product_feature_id":1,"name":"Zielony"}]},{"product_feature_id":3,"name":"dfghdfghd fghdfgh dfgh dfgh","options":[{"product_feature_option_id":39,"product_feature_id":3,"name":"sdfgsdgfsdfgdsfg"},{"product_feature_option_id":40,"product_feature_id":3,"name":"hfghfgh"}]}],"product_feature_option_ids":[59,60,39,40,62],"products":[],"products_dt":{"columns":[{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"dataset":[{"product_id":2,"name":"sadfas","gross_price":234,"net_price":40,"vat":23},{"product_id":3,"name":"a","gross_price":234,"net_price":12,"vat":23},{"product_id":4,"name":"b","gross_price":100,"net_price":40,"vat":5},{"product_id":5,"name":"c","gross_price":264,"net_price":4,"vat":8},{"product_id":6,"name":"b","gross_price":100,"net_price":40,"vat":5},{"product_id":7,"name":"c","gross_price":264,"net_price":4,"vat":8}],"label":"Pełna lista produktów","primary_key":"product_id","filters":[],"sort":false,"quick_search":"","pagination_data":{"page_id":0,"row_count":15,"total_rows":6,"page_count":1},"rows":[{"row":{"product_id":2,"name":"sadfas","gross_price":234,"net_price":40,"vat":23},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":3,"name":"a","gross_price":234,"net_price":12,"vat":23},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":4,"name":"b","gross_price":100,"net_price":40,"vat":5},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":5,"name":"c","gross_price":264,"net_price":4,"vat":8},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":6,"name":"b","gross_price":100,"net_price":40,"vat":5},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":7,"name":"c","gross_price":264,"net_price":4,"vat":8},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]}]},"product_feature_ids":[1,3]}`;
	//const d = `{"id":-1,"name":"","sell_by":"qty","features":[{"product_feature_id":1,"name":"Kolor","options":[{"product_feature_option_id":59,"product_feature_id":1,"name":"Czerwony"},{"product_feature_option_id":60,"product_feature_id":1,"name":"Beżowy"},{"product_feature_option_id":62,"product_feature_id":1,"name":"Zielony"}]},{"product_feature_id":3,"name":"Model","options":[{"product_feature_option_id":39,"product_feature_id":3,"name":"sdfgsdgfsdfgdsfg"},{"product_feature_option_id":40,"product_feature_id":3,"name":"hfghfgh"}]}],"product_feature_option_ids":[59,60,62,39,40],"products":[{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":59,"feature_3":39,"_row_id":-10001},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":59,"feature_3":40,"_row_id":-10002},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":60,"feature_3":39,"_row_id":-10003},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":60,"feature_3":40,"_row_id":-10004},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":62,"feature_3":39,"_row_id":-10005},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":62,"feature_3":40,"_row_id":-10006}],"products_dt":{"columns":[{"key":"feature_3","label":"Model","width":"10%","searchable":"string","sortable":true},{"key":"feature_1","label":"Kolor","width":"10%","searchable":"string","sortable":true},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"dataset":[{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":59,"feature_3":39,"_row_id":-10001},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":59,"feature_3":40,"_row_id":-10002},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":60,"feature_3":39,"_row_id":-10003},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":60,"feature_3":40,"_row_id":-10004},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":62,"feature_3":39,"_row_id":-10005},{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":62,"feature_3":40,"_row_id":-10006}],"label":"Pełna lista produktów","primary_key":"product_id","filters":[],"sort":false,"quick_search":"","pagination_data":{"page_id":0,"row_count":15,"total_rows":6,"page_count":1},"rows":[{"row":{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":59,"feature_3":39,"_row_id":-10001},"row_id":-10001},{"row":{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":59,"feature_3":40,"_row_id":-10002},"row_id":-10002},{"row":{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":60,"feature_3":39,"_row_id":-10003},"row_id":-10003},{"row":{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":60,"feature_3":40,"_row_id":-10004},"row_id":-10004},{"row":{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":62,"feature_3":39,"_row_id":-10005},"row_id":-10005},{"row":{"name":"asdads","gross_price":45.6,"net_price":45.2,"product_id":-1,"vat":77,"feature_1":62,"feature_3":40,"_row_id":-10006},"row_id":-10006}]},"product_feature_ids":[1,3]}`;
	const d = {
		id: -1,
		name: "abc product",
		sell_by: "qty",
		product_feature_ids: [1, 2],
		product_feature_option_ids: [59, 60, 62, 64, 56, 57, 58],
		missing_products_features: [
			{ 1: 59, 2: 56 },
			{ 1: 59, 2: 57 },
			{ 1: 59, 2: 58 },
			{ 1: 60, 2: 56 },
			{ 1: 60, 2: 57 },
			{ 1: 60, 2: 58 },
			{ 1: 62, 2: 56 },
			{ 1: 62, 2: 57 },
			{ 1: 62, 2: 58 },
			{ 1: 64, 2: 56 },
			{ 1: 64, 2: 57 },
			{ 1: 64, 2: 58 },
		],
		features: [
			{
				product_feature_id: 1,
				name: "Kolor",
				options: [
					{ product_feature_option_id: 59, product_feature_id: 1, name: "Czerwony", row_id: 59, row_index: 0, list_length: 4 },
					{ product_feature_option_id: 60, product_feature_id: 1, name: "Beżowy", row_id: 60, row_index: 1, list_length: 4 },
					{ product_feature_option_id: 62, product_feature_id: 1, name: "Zielony", row_id: 62, row_index: 2, list_length: 4 },
					{ product_feature_option_id: 64, product_feature_id: 1, name: "Żółty", row_id: 64, row_index: 3, list_length: 4 },
				],
				row_id: 1,
				row_index: 0,
				list_length: 2,
			},
			{
				product_feature_id: 2,
				name: "aaabbbb",
				options: [
					{ product_feature_option_id: 56, product_feature_id: 2, name: "a" },
					{ product_feature_option_id: 57, product_feature_id: 2, name: "b" },
					{ product_feature_option_id: 58, product_feature_id: 2, name: "c" },
				],
				row_id: 2,
				row_index: 1,
				list_length: 2,
			},
		],
		products_dt: {
			columns: [
				{ label: '<p-checkbox class="square select_all_rows shrink"></p-checkbox>', key: "", width: "38px" },
				{ key: "active", label: "Aktywny", width: "130px", sortable: true, searchable: "boolean", editable: "checkbox" },
				{ key: "net_price", label: "Cena Netto", width: "1", sortable: true, searchable: "number", editable: "number" },
				{ key: "vat", label: "Vat (stały?)", width: "1", sortable: true, editable: "number" },
				{ key: "gross_price", label: "Cena Brutto", width: "1", sortable: true, editable: "number" },
				{ key: "stock", label: "Stan magazynowy", width: "1", sortable: true, editable: "number" },
			],
			dataset: [
				{
					gross_price: 12.3,
					net_price: 66.9,
					product_id: -1,
					vat_id: 1,
					active: 1,
					feature_1: 59,
					is_necessary: false,
					_row_id: -1001,
					stock: 19,
				},
				{
					gross_price: 12.3,
					net_price: 50,
					product_id: -1,
					vat_id: 1,
					active: 1,
					feature_1: 60,
					is_necessary: false,
					_row_id: -1002,
					stock: 190,
				},
			],
			label: "Pełna lista produktów",
			selectable: true,
			filters: [],
			sort: false,
			quick_search: "",
			pagination_data: { page_id: 0, row_count: 15, total_rows: 2, page_count: 1 },
			rows: [
				{
					row_data: {
						gross_price: 12.3,
						net_price: 66.9,
						product_id: -1,
						vat_id: 1,
						active: 1,
						feature_1: 59,
						is_necessary: false,
						_row_id: -1001,
						stock: 19,
					},
					row_id: -1001,
				},
				{
					row_data: {
						gross_price: 12.3,
						net_price: 50,
						product_id: -1,
						vat_id: 1,
						active: 1,
						feature_1: 60,
						is_necessary: false,
						_row_id: -1002,
						stock: 190,
					},
					row_id: -1002,
				},
			],
			primary_key: "_row_id",
			selection: [],
		},
		unnecessary_product_ids: [-1, -1],
	};

	// ppp.products.forEach((d) => {
	// 	d.active = Math.random() < 0.8 ? 1 : 0;
	// 	d.stock = Math.floor(100 * Math.random());
	// });
	//const dt_ref = d.products_dt;
	//d.products_dt = {};

	// product_comp._data.product_feature_ids = d.product_feature_ids;
	// product_comp._data.product_feature_option_ids = d.product_feature_option_ids;
	// product_comp._data.products_dt.dataset = d.products_dt.dataset;
	// product_comp._data.name = d.name;
	// product_comp._data.general_product_id = 1;

	const data = product_comp._data;

	data.general_product_id = general_product_data ? general_product_data.general_product_id : -1;
	if (general_product_data) {
		data.name = general_product_data.name;

		data.product_feature_ids = [];
		for (const feature of general_product_data.features.sort((a, b) => Math.sign(a._meta_pos - b._meta_pos))) {
			data.product_feature_ids.push(feature.product_feature_id);
		}

		data.product_feature_option_ids = [];
		for (const feature of general_product_data.feature_options.sort((a, b) => Math.sign(a._meta_pos - b._meta_pos))) {
			data.product_feature_option_ids.push(feature.product_feature_option_id);
		}

		data.products_dt.dataset = [];
		for (const product of general_product_data.products) {
			product.feature_options.forEach((opt) => {
				const product_feature_option_id = opt.product_feature_option_id;
				const product_feature_option = product_feature_options.find((e) => e.product_feature_option_id === product_feature_option_id);
				if (product_feature_option) {
					const fkey = getFeatureKeyFromId(product_feature_option.product_feature_id);
					product[fkey] = product_feature_option_id;
				}
			});
			delete product.feature_options;

			data.products_dt.dataset.push(product);
		}

		product_comp._render();

		// rendering provides important informations
		product_comp._add_missing_products({ dont_ask: true });
	}
	product_comp._render();
});
