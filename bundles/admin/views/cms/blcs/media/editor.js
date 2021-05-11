/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "alt",
		blc_groups: [{ match_tag: piep_cms_manager.match_media_tags, priority: 10 }],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Opis zdjęcia (alt)</div>
			<input class="field" data-blc_prop="attrs.alt" />
		`,
	});
}
