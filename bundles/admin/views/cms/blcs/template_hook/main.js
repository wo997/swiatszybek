/* js[piep_cms_dependencies] */
{
	piep_cms_props_handler.registerProp({
		name: "template_hook_name",
		blc_groups: [
			{
				module_names: ["template_hook"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">
				Nazwa sekcji
				<div class="info_hover">Opisz co pojawi się w sekcji, np.: Opis produktu</div>
			</div>
			<input class="field" data-blc_prop="settings.template_hook_name" />
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "template_hook_id",
		blc_groups: [
			{
				module_names: ["template_hook"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">
				ID sekcji
				<div class="info_hover">Unikalny identyfikator, np.: product_description</div>
			</div>
			<input class="field" data-blc_prop="settings.template_hook_id" />
		`,
	});
}
