/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "data-src",
		blc_groups: [{ match_tag: /^(img)$/, priority: 10 }],
		type_groups: ["appearance"],
		menu_html: html`
			<div class="label">Zdjęcie</div>
			<image-picker data-blc_prop="attrs.data-src" style="width:150px;height:150px"></image-picker>
		`,
	});

	piep_cms_manager.registerProp({
		name: "alt",
		blc_groups: [{ match_tag: this.match_media_tags, priority: 10 }],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Opis zdjęcia (alt)</div>
			<input class="field" data-blc_prop="attrs.alt" />
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "choose_img_btn",
		blc_groups: [{ match_tag: /^(img)$/, priority: 1 }],
		menu_html: html`
			<button class="btn transparent small choose_img_btn" data-tooltip="Wybierz zdjęcie">
				<i class="fas fa-image"></i>
			</button>
		`,
	});
}
