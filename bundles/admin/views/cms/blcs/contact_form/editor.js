/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "contact_form",
		icon: html`<i class="fas fa-envelope"></i>`,
		label: html`Formularz kontaktowy`,
		nonclickable: true,
		single_usage: true,
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "contact_form",
		},
		rerender_on: [],
		backend_render: true,
	});
}
