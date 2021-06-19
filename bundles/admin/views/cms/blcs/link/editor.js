/* js[piep_cms_dependencies] */

{
	const link_priority = 5;

	/** @type {EditBlcGroup[]} */
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

			<div class="label">Stylowanie linku</div>
			<div class="pretty_radio" data-blc_prop="settings.link_styling" style="--columns:3">
				<div class="checkbox_area">
					<p-checkbox data-value=""></p-checkbox>
					<span>Domyślne</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="none"></p-checkbox>
					<span>Brak</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="hover_underline"></p-checkbox>
					<span>Podkreślenie</span>
				</div>
			</div>
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "link_btn",
		blc_groups: text_groups,
		menu_html: html`
			<button class="btn transparent small link_btn">
				<i class="fas fa-link"></i>
			</button>
		`,
		init: (piep_cms, menu_wrapper) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".link_btn")) {
					piep_cms.filter_blc_menu._set_value("advanced");
					const link_input = piep_cms.side_menu._child(".prop_link input");
					link_input.click();
					link_input.focus();
					piep_cms.setContentActive(false);
				}
			});

			const link_btn = menu_wrapper._child(".link_btn");

			const set_sel = () => {
				const has_link = !!link_input._get_value();
				link_btn.classList.toggle("pretty_btn_active", has_link);
				link_btn.dataset.tooltip = has_link ? "Edytuj / Usuń link" : "Wstaw link";
			};

			const link_input = piep_cms.side_menu._child(`.prop_link [data-blc_prop="settings.link"]`);
			link_input.addEventListener("change", set_sel);
			link_input.addEventListener("input", set_sel);

			piep_cms.container.addEventListener("set_blc_menu", () => {
				set_sel();
			});
		},
	});
}
