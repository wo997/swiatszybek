/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "product_list",
		icon: html`<i class="fas fa-cubes"></i>`,
		label: html`Lista produktów`,
		nonclickable: true,
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "product_list",
		},
		render: (v_node) => {
			//v_node.settings.product_categories
			//v_node.settings.sort

			// let piep cms store requests we had by url + params and reuse responses, no repeating yet we have totally dynamic modules yay :P
			//let body = def(modules_html.main_menu_htmlxxx, html`<div class="empty_module" data-container_queries="">Lista produktów</div>`);
			let body = html`<div class="empty_module" data-container_queries="">Lista produktów</div>`;
			return body;
		},
	});

	piep_cms_manager.registerProp({
		name: "product_list_sort",
		type_groups: ["advanced"],
		blc_groups: [{ module_names: ["product_list"], priority: 100 }],
		menu_html: html`
			<div class="label"><span>Sortuj listę produktów</span></div>
			<select class="field" data-blc_prop="settings.product_list_sort">
				<option value="bestsellery">Bestsellery</option>
				<option value="najnowsze">Najnowsze</option>
				<option value="ceny-rosnaco">Ceny rosnąco</option>
				<option value="ceny-malejaco">Ceny malejąco</option>
			</select>
		`,
	});
}
