/* js[piep_cms_dependencies] */

{
	const link_priority = 5;

	/** @type {BlcGroup[]} */
	const text_groups = [
		{ match_tag: piep_cms_manager.match_text_containers, priority: link_priority },
		{ match_tag: piep_cms_manager.match_textables, priority: link_priority },
	];

	piep_cms_manager.registerProp({
		name: "link",
		type_groups: ["advanced"],
		blc_groups: [{ match_tag: piep_cms_manager.match_linkables, priority: link_priority }],
		affects_selection: true,
		menu_html: html`
			<div class="label">Link</div>
			<input class="field trim" data-blc_prop="settings.link" />
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "link_btn",
		blc_groups: text_groups,
		menu_html: html`
			<button class="btn transparent small link_btn" data-tooltip="Wstaw link">
				<i class="fas fa-link"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".link_btn")) {
					piep_cms.filter_blc_menu._set_value("advanced");
					const link_input = piep_cms.side_menu._child(".prop_link input");
					link_input.click();
					link_input.focus();
				}
			});
		},
	});
}
