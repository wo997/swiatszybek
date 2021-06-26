/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "view_product_comments",
		icon: html`<i class="fas fa-comments"></i>`,
		label: html`Komentarze produktu`,
		single_usage: true,
		width_schema: "has_content",
		group: "module",
		nonclickable: true,
		page_type: "general_product",
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "view_product_comments",
		},
		rerender_on: [],
		render_html: (v_node) => {
			return html`<div class="empty_module">Komentarze produktu</div>`;
		},
	});
}
