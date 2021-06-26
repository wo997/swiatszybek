/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "main_menu",
		icon: html`<i class="fas fa-bars"></i>`,
		label: html`Menu główne`,
		single_usage: true,
		nonclickable: true,
		standalone: true,
		width_schema: "has_content",
		group: "module",
		v_node: {
			tag: "header",
			id: -1,
			styles: {},
			classes: ["main"],
			attrs: {},
			module_name: "main_menu",
		},
		rerender_on: [],
		backend_render: true,
	});
}
