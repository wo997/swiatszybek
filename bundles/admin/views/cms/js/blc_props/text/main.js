/* js[piep_cms_dependencies] */
{
	const tag_containing_text_priority = 1;
	const match_tags_containing_text = /^(tt|i|b|big|small|em|strong|dfn|code|samp|kbd|var|cite|abbr|acronym|sub|sup|span|bdo|address|div|a|object|p|h[1-6]|pre|q|ins|del|dt|dd|li|label|option|textarea|fieldset|legend|button|caption|td|th|title|script|style)$/;

	piep_cms_props_handler.registerProp({
		selector: ".prop_fontSize",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_fontWeight",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_textAlign",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_fontStyle",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_textDecoration",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_color",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
	});

	piep_cms_props_handler.registerProp({
		selector: ".prop_backgroundColor",
		type_groups: ["appearance"],
		blc_groups: [{ match_tag: match_tags_containing_text, priority: tag_containing_text_priority }],
	});

	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_fontSize",
		tag_groups: [{ match_tag: this.match_tags_containing_text }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_fontWeight",
		tag_groups: [{ match_tag: this.match_tags_containing_text }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_textAlign",
		tag_groups: [{ match_tag: this.match_tags_containing_text }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_color",
		tag_groups: [{ match_tag: this.match_tags_containing_text }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".prop_backgroundColor",
		tag_groups: [{ match_tag: this.match_tags_containing_text }],
	});
	piep_cms_props_handler.registerFloatingProp({
		selector: ".remove_format_btn",
		tag_groups: [{ match_tag: this.match_tags_containing_text }],
	});
}
