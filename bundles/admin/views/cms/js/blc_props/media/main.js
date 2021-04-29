/* js[piep_cms_dependencies] */
{
	piep_cms_props_handler.registerProp({
		selector: ".prop_data-src",
		blc_groups: [{ match_tag: /^(img)$/, priority: 1 }],
		type_groups: ["appearance"],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_alt",
		blc_groups: [{ match_tag: this.match_media_tags, priority: 1 }],
		type_groups: ["advanced"],
	});

	piep_cms_props_handler.registerFloatingProp({
		selector: ".choose_img_btn",
		tag_groups: [{ match_tag: /^(img)$/, priority: 1 }],
	});
}
