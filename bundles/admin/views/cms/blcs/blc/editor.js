/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "display_name",
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Pomocnicza nazwa bloku</div>
			<input class="field trim" data-blc_prop="settings.display_name" />
		`,
	});
}
