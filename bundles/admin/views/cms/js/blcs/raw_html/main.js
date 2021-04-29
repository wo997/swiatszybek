/* js[piep_cms_dependencies] */
{
	piep_cms_props_handler.registerProp({
		name: "raw_html",
		blc_groups: [
			{
				has_classes: ["raw_html"],
				priority: 1,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Kod HTML</div>
			<textarea class="field" data-blc_prop="settings.raw_html" style="height:300px"></textarea>
		`,
	});
}
