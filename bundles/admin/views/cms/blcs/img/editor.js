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

	piep_cms_manager.registerFloatingProp({
		name: "choose_img_btn",
		blc_groups: [{ module_names: ["img"], priority: 100 }],
		menu_html: html`
			<button class="btn transparent small choose_img_btn" data-tooltip="Wybierz zdjęcie">
				<i class="fas fa-image"></i>
			</button>
		`,
	});

	piep_cms_manager.registerBlcSchema({
		id: "img",
		icon: html`<i class="far fa-image"></i>`,
		label: html`Zdjęcie`,
		priority: 90,
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
