/* js[piep_cms_dependencies] */
{
	piep_cms_props_handler.registerProp({
		name: "google_map_embed_code",
		blc_groups: [
			{
				module_names: ["google_map"],
				priority: 10,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Kod umieszczania mapy google</div>
			<textarea class="field scroll_panel" data-blc_prop="settings.google_map_embed_code" style="height:100px"></textarea>
		`,
	});
}
