/* js[admin] */

/**
 * @typedef {{
 * seo_title: string
 * seo_description: string
 * }} PageSeoDataCompData
 *
 * @typedef {{
 * _data: PageSeoDataCompData
 * _set_data(data?: PageSeoDataCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_color_btn: PiepNode
 *  save_btn: PiepNode
 *  add_font_size_btn: PiepNode
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} PageSeoDataComp
 */

/**
 * @param {PageSeoDataComp} comp
 * @param {*} parent
 * @param {PageSeoDataCompData} data
 */
function PageSeoDataComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { seo_title: "", seo_description: "" };
	}

	comp._show = (options = {}) => {
		setTimeout(() => {
			showModal("PageSeoData", {
				source: options.source,
			});
		});
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>

			<div class="scroll_panel scroll_shadow panel_padding">
				<div>
					<div class="label first">Tytuł strony (title)</div>
					<input class="field" data-bind="{${data.seo_title}}" />

					<div class="label">Opis (description)</div>
					<textarea class="field" data-bind="{${data.seo_description}}"></textarea>
				</div>
			</div>
		`,
		initialize: () => {
			// comp._nodes.save_btn.addEventListener("click", () => {
			// 	const data = comp._data;
			// 	showLoader();
			// 	hideModal("PageSeoData");
			// });
		},
		ready: () => {},
	});
}

function getPageSeoDataModal() {
	const ex = $("#PageSeoData");
	if (!ex) {
		registerModalContent(html`
			<div id="PageSeoData" data-expand data-dismissable>
				<div class="modal_body" style="max-width: 1000px;max-height: calc(75% + 100px);">
					<div class="custom_toolbar">
						<span class="title medium">Dane SEO strony <span class="product_name"></span></span>
						<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
					</div>
					<page-seo-data-comp class="flex_stretch"></page-seo-data-comp>
				</div>
			</div>
		`);
	}

	/** @type {PageSeoDataComp} */
	// @ts-ignore
	const page_seo_data_comp = $("#PageSeoData page-seo-data-comp");
	if (!ex) {
		PageSeoDataComp(page_seo_data_comp, undefined);
	}

	$("#PageSeoData .custom_toolbar").append(page_seo_data_comp._nodes.save_btn);

	return page_seo_data_comp;
}
