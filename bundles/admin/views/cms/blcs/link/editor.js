/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerProp({
		name: "link",
		type_groups: ["advanced"],
		blc_groups: [{ match_tag: piep_cms_manager.match_linkables, priority: 3 }],
		menu_html: html`
			<div class="label">Link</div>
			<input class="field trim" data-blc_prop="settings.link" />
		`,
	});
}
