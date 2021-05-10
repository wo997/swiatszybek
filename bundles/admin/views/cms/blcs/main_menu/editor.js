/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "main_menu",
		icon: html`<i class="fas fa-bars"></i>`,
		label: html`Menu główne`,
		single_usage: true,
		nonclickable: true,
		v_node: {
			tag: "header",
			id: -1,
			styles: {},
			classes: ["main"],
			attrs: {},
			module_name: "main_menu",
		},
		render: (v_node) => {
			// let body = def(
			// 	modules_html.main_menu_html,
			// 	html`<div class="empty_module" data-container_queries="">LOGO, Menu, Wyszukajka itd.</div>`
			// );
			let body = html`<div class="empty_module" data-container_queries="">LOGO, Menu, Wyszukiwarka</div>`;
			return body;
		},
	});
}