/* js[view] */

function refreshProductFeatures() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "product/feature/all",
		success: (res) => {
			product_features = res;
		},
	});

	xhr({
		url: STATIC_URLS["ADMIN"] + "product/feature/option/all",
		success: (res) => {
			product_feature_options = res;
		},
	});

	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	// HEY, it watches removals only, what about changes????
	product_comp._data.features = product_comp._data.features.filter((curr_feature) => {
		return !!product_features.find((feature) => {
			return feature.product_feature_id === curr_feature.product_feature_id;
		});
	});

	// rework this shit
	// product_comp._data.features.forEach((curr_feature) => {
	// 	curr_feature.options = curr_feature.options.filter((curr_option) => {
	// 		return !!product_feature_options.find((option) => {
	// 			return option.product_feature_option_id === curr_option.product_feature_option_id;
	// 		});
	// 	});
	// });

	product_comp._render();
}

domload(() => {
	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	productComp(product_comp, undefined, {
		id: -1,
		name: "",
		sell_by: "qty",
		features: [],
		product_feature_option_ids: [],
		products: [],
	});

	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(product_comp._data.name ? product_comp._data.name : "Nowy produkt");
		});
	};
	product_comp.addEventListener("change", nameChange);
	nameChange();

	const d = `{"id":-1,"name":"","sell_by":"qty","features":[{"product_feature_id":1,"options":[{"product_feature_option_id":59,"product_feature_id":1,"name":"Czerwony"},{"product_feature_option_id":60,"product_feature_id":1,"name":"Beżowy"},{"product_feature_option_id":61,"product_feature_id":1,"name":"Zielony"}],"row_id":-1001,"row_index":0,"list_length":2},{"product_feature_id":3,"options":[{"product_feature_option_id":39,"product_feature_id":3,"name":"sdfgsdgfsdfgdsfg"},{"product_feature_option_id":40,"product_feature_id":3,"name":"hfghfgh"}],"row_id":-1002,"row_index":1,"list_length":2}],"product_feature_option_ids":[59,60,61,39,40],"products":[],"products_dt":{"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"dataset":[{"product_id":2,"name":"sadfas","gross_price":234,"net_price":40,"vat":23},{"product_id":3,"name":"a","gross_price":234,"net_price":12,"vat":23},{"product_id":4,"name":"b","gross_price":100,"net_price":40,"vat":5},{"product_id":5,"name":"c","gross_price":264,"net_price":4,"vat":8},{"product_id":6,"name":"b","gross_price":100,"net_price":40,"vat":5},{"product_id":7,"name":"c","gross_price":264,"net_price":4,"vat":8}],"label":"Pełna lista produktów","primary_key":"product_id","filters":[],"sort":false,"quick_search":"","pagination_data":{"page_id":0,"row_count":15,"total_rows":6,"page_count":1},"rows":[{"row":{"product_id":2,"name":"sadfas","gross_price":234,"net_price":40,"vat":23},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"row_id":2,"row_index":0,"list_length":6},{"row":{"product_id":3,"name":"a","gross_price":234,"net_price":12,"vat":23},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"row_id":3,"row_index":1,"list_length":6},{"row":{"product_id":4,"name":"b","gross_price":100,"net_price":40,"vat":5},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"row_id":4,"row_index":2,"list_length":6},{"row":{"product_id":5,"name":"c","gross_price":264,"net_price":4,"vat":8},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"row_id":5,"row_index":3,"list_length":6},{"row":{"product_id":6,"name":"b","gross_price":100,"net_price":40,"vat":5},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"row_id":6,"row_index":4,"list_length":6},{"row":{"product_id":7,"name":"c","gross_price":264,"net_price":4,"vat":8},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"row_id":7,"row_index":5,"list_length":6}]}}`;
	product_comp._set_data(JSON.parse(d));
});
