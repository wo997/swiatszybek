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
 *  seo_title: PiepNode
 *  title_ok: PiepNode
 *  seo_description: PiepNode
 *  description_ok: PiepNode
 *  save_btn: PiepNode
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
			render: () => {
				// give it a tiny margin
				comp._nodes.seo_description._set_value(data.seo_description + "m", { quiet: true });
				comp._nodes.seo_title._set_value(data.seo_title + "m", { quiet: true });

				let description_ok = "";
				if (data.seo_description.length > 0) {
					if (comp._nodes.seo_description.scrollHeight > comp._nodes.seo_description.clientHeight) {
						description_ok = html`<span class="text_error" data-tooltip="Zbyt długi"> <i class="fas fa-times"></i> </span>`;
					} else if (data.seo_description.length < 100) {
						description_ok = html`<span class="text_warning" data-tooltip="Zbyt krótki">
							<i class="fas fa-exclamation"></i>
						</span>`;
					} else {
						description_ok = html`<span class="text_success" data-tooltip="Odpowiednia długość"> <i class="fas fa-check"></i> </span>`;
					}
				}
				comp._nodes.description_ok._set_content(description_ok);

				let title_ok = "";
				if (data.seo_title.length > 0) {
					if (comp._nodes.seo_title.scrollWidth > comp._nodes.seo_title.clientWidth) {
						title_ok = html`<span class="text_error" data-tooltip="Zbyt długi"> <i class="fas fa-times"></i> </span>`;
					} else if (data.seo_title.length < 40) {
						title_ok = html`<span class="text_warning" data-tooltip="Zbyt krótki">
							<i class="fas fa-exclamation"></i>
						</span>`;
					} else {
						title_ok = html`<span class="text_success" data-tooltip="Odpowiednia długość"> <i class="fas fa-check"></i> </span>`;
					}
				}
				comp._nodes.title_ok._set_content(title_ok);

				// and remove the margin, ezy
				comp._nodes.seo_description._set_value(data.seo_description, { quiet: true });
				comp._nodes.seo_title._set_value(data.seo_title, { quiet: true });
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<button class="btn primary" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>

			<div class="scroll_panel scroll_shadow panel_padding">
				<div>
					<div class="label first">
						<span>Tytuł strony (title)</span>
						<span class="is_ok" data-node="{${comp._nodes.title_ok}}"></span>
					</div>
					<input class="field" data-bind="{${data.seo_title}}" data-node="{${comp._nodes.seo_title}}" />

					<div class="label">
						<span>Opis (description)</span>
						<span class="is_ok" data-node="{${comp._nodes.description_ok}}"></span>
					</div>
					<textarea
						class="field hide_scrollbar"
						data-bind="{${data.seo_description}}"
						data-node="{${comp._nodes.seo_description}}"
					></textarea>
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
						<span class="title">
							<span class="medium"> Dane SEO strony </span>
							<div class="info_hover">
								Uzupełnij tytuł oraz opis strony, które będą widoczne w wyszukiwarce (np. Google). Na podstawie tych danych klient podejmie
								decyzję czy chce odwiedzić stronę sklepu czy przejść dalej.
							</div>
						</span>
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
