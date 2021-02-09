/* js[view] */

function refreshProductFeatures() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "product/feature/all",
		success: (res) => {
			product_features = res;

			xhr({
				url: STATIC_URLS["ADMIN"] + "product/feature/option/all",
				success: (res) => {
					product_feature_options = res;

					/** @type {ProductComp} */
					// @ts-ignore
					const product_comp = $("product-comp");

					product_comp._render({ force_render: true });
				},
			});
		},
	});
}

domload(() => {
	/** @type {ProductComp} */
	// @ts-ignore
	const product_comp = $("product-comp");

	productComp(product_comp, undefined, {
		id: -1,
		name: "",
		sell_by: "qty",
		product_feature_ids: [],
		product_feature_option_ids: [],
		features: [],
		products: [],
	});

	const nameChange = () => {
		$$(`.product_name`).forEach((e) => {
			e._set_content(product_comp._data.name ? product_comp._data.name : "Nowy produkt");
		});
	};
	product_comp.addEventListener("change", nameChange);
	nameChange();

	const d = `{"id":-1,"name":"","sell_by":"qty","features":[{"product_feature_id":1,"name":"Kolor","options":[{"product_feature_option_id":59,"product_feature_id":1,"name":"Czerwony"},{"product_feature_option_id":60,"product_feature_id":1,"name":"Beżowy"},{"product_feature_option_id":62,"product_feature_id":1,"name":"Zielony"}]},{"product_feature_id":3,"name":"dfghdfghd fghdfgh dfgh dfgh","options":[{"product_feature_option_id":39,"product_feature_id":3,"name":"sdfgsdgfsdfgdsfg"},{"product_feature_option_id":40,"product_feature_id":3,"name":"hfghfgh"}]}],"product_feature_option_ids":[59,60,39,40,62],"products":[],"products_dt":{"columns":[{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}],"dataset":[{"product_id":2,"name":"sadfas","gross_price":234,"net_price":40,"vat":23},{"product_id":3,"name":"a","gross_price":234,"net_price":12,"vat":23},{"product_id":4,"name":"b","gross_price":100,"net_price":40,"vat":5},{"product_id":5,"name":"c","gross_price":264,"net_price":4,"vat":8},{"product_id":6,"name":"b","gross_price":100,"net_price":40,"vat":5},{"product_id":7,"name":"c","gross_price":264,"net_price":4,"vat":8}],"label":"Pełna lista produktów","primary_key":"product_id","filters":[],"sort":false,"quick_search":"","pagination_data":{"page_id":0,"row_count":15,"total_rows":6,"page_count":1},"rows":[{"row":{"product_id":2,"name":"sadfas","gross_price":234,"net_price":40,"vat":23},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":3,"name":"a","gross_price":234,"net_price":12,"vat":23},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":4,"name":"b","gross_price":100,"net_price":40,"vat":5},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":5,"name":"c","gross_price":264,"net_price":4,"vat":8},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":6,"name":"b","gross_price":100,"net_price":40,"vat":5},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]},{"row":{"product_id":7,"name":"c","gross_price":264,"net_price":4,"vat":8},"columns":[{"key":"product_id","label":"ID","width":"10%","sortable":true,"searchable":"number"},{"key":"name","label":"Nazwa","width":"10%","sortable":true,"searchable":"string"},{"key":"net_price","label":"Cena Netto","width":"10%","sortable":true,"searchable":"number"},{"key":"vat","label":"Vat","width":"10%","sortable":true,"searchable":"number"},{"key":"gross_price","label":"Cena Brutto","width":"10%","sortable":true,"searchable":"number"}]}]},"product_feature_ids":[1,3]}`;
	product_comp._set_data(JSON.parse(d));
});
