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
			let body = def(modules_html.main_menu_htmlxxx, html`<div class="empty_module" data-container_queries="">Lista produktów</div>`);
			return body;
		},
	});
}
