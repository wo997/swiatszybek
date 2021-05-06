/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "main_menu",
		icon: html`<i class="fas fa-bars"></i>`,
		label: html`Menu główne`,
		single_usage: true,
		nonclickable: true,
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "main_menu",
		},
	});
}
