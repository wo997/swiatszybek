/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "view_product_comments",
		icon: html`<i class="fas fa-comments"></i>`,
		label: html`Komentarze produktu`,
		single_usage: true,
		nonclickable: true,
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "view_product_comments",
		},
		render: (v_node) => {
			// let body = def(
			// 	modules_html.view_product_comments,
			// 	html`<div class="empty_module" data-container_queries="">Komentarze produktu</div>`
			// );
			let body = html`<div class="empty_module" data-container_queries="">Komentarze produktu</div>`;
			return body;
		},
	});
}