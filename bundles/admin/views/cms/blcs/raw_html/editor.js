/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "html_code",
		blc_groups: [
			{
				module_names: ["raw_html"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Kod HTML</div>
			<textarea class="field scroll_panel" data-blc_prop="settings.html_code" style="height:200px"></textarea>
		`,
	});
}

{
	piep_cms_manager.registerBlcSchema({
		id: "raw_html",
		icon: html`<i class="fas fa-code"></i>`,
		label: html`Kod HTML`,
		nonclickable: true,
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "raw_html",
		},
	});
}
