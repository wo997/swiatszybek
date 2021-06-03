/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerProp({
		name: "img_src",
		blc_groups: [{ module_names: ["img"], priority: 100 }],
		type_groups: ["appearance"],
		menu_html: html`
			<div class="label">Zdjęcie</div>
			<image-picker data-blc_prop="settings.img_src" style="width:150px;height:150px"></image-picker>
		`,
	});

	piep_cms_manager.registerProp({
		name: "img_alt",
		blc_groups: [{ module_names: ["img"], priority: 100 }],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Opis zdjęcia (alt)</div>
			<input class="field" data-blc_prop="settings.img_alt" />
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "choose_img_btn",
		blc_groups: [{ module_names: ["img"], priority: 100 }],
		menu_html: html`
			<button class="btn transparent small choose_img_btn" data-tooltip="Wybierz zdjęcie">
				<i class="fas fa-image"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				const choose_img_btn = target._parent(".choose_img_btn");
				if (choose_img_btn) {
					const input = piep_cms.side_menu._child(`[data-blc_prop="settings.img_src"]`);
					const select_file_modal = getSelectFileModal();
					select_file_modal._data.file_manager.select_target = input;
					select_file_modal._render();
					select_file_modal._show({ source: choose_img_btn });
				}
			});
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "edit_img_alt_btn",
		blc_groups: [{ module_names: ["img"], priority: 100 }],
		menu_html: html`
			<button class="btn transparent small edit_img_alt_btn" data-tooltip="Ustaw opis zdjęcia">
				<i class="fas fa-comment-alt"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".edit_img_alt_btn")) {
					piep_cms.filter_blc_menu._set_value("all");
					const alt_input = piep_cms.side_menu._child(".prop_img_alt input");
					alt_input.click();
					alt_input.focus();
				}
			});
		},
	});

	piep_cms_manager.registerBlcSchema({
		id: "img",
		icon: html`<i class="far fa-image"></i>`,
		label: html`Zdjęcie`,
		priority: 90,
		group: "media",
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			settings: {
				img_src: "/src/img/empty_img_147x94.svg",
			},
			module_name: "img",
		},
		rerender_on: ["settings.img_src"],
		render: (v_node) => {
			/** @type {string} */
			const img_src = v_node.settings.img_src;
			return html`<img class="wo997_img" data-src="${img_src}" />`;
		},
	});
}
