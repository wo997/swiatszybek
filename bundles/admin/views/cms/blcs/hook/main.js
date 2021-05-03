/* js[piep_cms_dependencies] */
{
	piep_cms_props_handler.registerProp({
		name: "template_hook",
		blc_groups: [
			{
				module_names: ["template_hook"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Nazwa sekcji</div>
			<input class="field" data-blc_prop="settings.template_hook_name" />
		`,
	});
}
