/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "view_product_feature_list",
		icon: html`<i class="fas fa-list-alt"></i>`,
		label: html`Specyfikacja produktu`,
		single_usage: true,
		group: "module",
		nonclickable: true,
		page_type: "general_product",
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "view_product_feature_list",
		},
		rerender_on: [],
		render_html: (v_node) => {
			return html`<div class="empty_module">Specyfikacja produktu</div>`;
		},
	});
}
