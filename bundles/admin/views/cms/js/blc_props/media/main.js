/* js[piep_cms_dependencies] */
{
	piep_cms_props_handler.registerProp({
		name: "data-src",
		blc_groups: [{ match_tag: /^(img)$/, priority: 10 }],
		type_groups: ["appearance"],
		menu_html: html`
			<div class="label">Zdjęcie</div>
			<image-picker data-blc_prop="attr.data-src" style="width:150px;height:150px"></image-picker>
		`,
	});

	piep_cms_props_handler.registerProp({
		name: "alt",
		blc_groups: [{ match_tag: this.match_media_tags, priority: 10 }],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Opis zdjęcia (alt)</div>
			<input class="field" data-blc_prop="attr.alt" />
		`,
	});

	piep_cms_props_handler.registerFloatingProp({
		selector: ".choose_img_btn",
		tag_groups: [{ match_tag: /^(img)$/, priority: 1 }],
	});
}
