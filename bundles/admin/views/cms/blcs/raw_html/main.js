/* js[piep_cms_dependencies] */
{
	piep_cms_props_handler.registerProp({
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
