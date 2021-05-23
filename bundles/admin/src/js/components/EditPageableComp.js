/* js[admin] */

/**
 * @typedef {{
 * url?: string
 * }} EditPageableCompData
 *
 * @typedef {{
 * _data: EditPageableCompData
 * _set_data(data?: EditPageableCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  delete_btn: PiepNode
 *  save_btn: PiepNode
 * }
 * _show(pageable_data: any, options?: ShowModalParams)
 * _pageable_data: any
 * } & BaseComp} EditPageableComp
 */

/**
 * @param {EditPageableComp} comp
 * @param {*} parent
 * @param {EditPageableCompData} data
 */
function EditPageableComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {};
	}

	comp._show = (this_pageable_data, options = {}) => {
		const data = comp._data;

		const is_template = this_pageable_data.parent_template_id !== undefined;
		comp._pageable_data = this_pageable_data;
		$("#EditPageable .custom_toolbar .title")._set_content(is_template ? "Edycja szablonu" : "Edycja strony");
		$("#EditPageable .node_delete_btn span")._set_content(is_template ? "Usuń szablon" : "Usuń stronę");

		const case_page_page = !is_template && this_pageable_data.page_type === "page";
		comp._children(".case_page_page").forEach((child) => {
			child.classList.toggle("hidden", !case_page_page);
		});

		if (case_page_page) {
			data.url = this_pageable_data.url;
		}

		comp._render();

		setTimeout(() => {
			showModal("EditPageable", {
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
			<button class="btn primary ml1" data-node="{${comp._nodes.save_btn}}">Zapisz <i class="fas fa-save"></i></button>

			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn">
					<div class="case_page_page">
						<div class="label">Link</div>
						<input class="field" data-bind="{${data.url}}" />
					</div>

					<div class="label">Pojawi się możliwość zmiany szablonu</div>
				</div>
				<div class="mta pt2" style="text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}"><span></span> <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		initialize: () => {},
		ready: () => {
			comp._nodes.save_btn.addEventListener("click", () => {
				const this_pageable_data = comp._pageable_data;
				const is_template = this_pageable_data.parent_template_id !== undefined;
				const data = comp._data;

				const params = {};

				if (is_template) {
					params.template = { template_id: this_pageable_data.template_id };
				} else {
					params.page = { page_id: this_pageable_data.page_id };
					if (this_pageable_data.page_type === "page") {
						params.page.url = data.url;
					}
				}

				showLoader();

				xhr({
					url: `${STATIC_URLS["ADMIN"]}/${is_template ? "template" : "page"}/save/`,
					params,
					success: (res) => {
						hideLoader();

						if (this_pageable_data.page_type === "page") {
							pageable_data.url = data.url;
							$$(".current_page_url").forEach((e) => {
								e._set_content(data.url);
							});
						}

						showNotification("Zapisano zmiany", { one_line: true, type: "success" });
					},
				});
			});

			comp._nodes.delete_btn.addEventListener("click", () => {
				const pageable_data = comp._pageable_data;
				const is_template = pageable_data.parent_template_id !== undefined;

				if (!confirm(`Czy aby na pewno chcesz usunąć ${is_template ? "ten szablon" : "tę stronę"}?`)) {
					return;
				}

				showLoader();

				xhr({
					url: `${STATIC_URLS["ADMIN"]}/${is_template ? "template" : "page"}/delete/${
						pageable_data[is_template ? "template_id" : "page_id"]
					}`,
					success: (res) => {
						hideLoader();
						window.location.href = STATIC_URLS["ADMIN"] + `/${is_template ? "szablony" : "strony"}`;
					},
				});
			});
		},
	});
}

function getEditPageableModal() {
	const ex = $("#EditPageable");
	if (!ex) {
		registerModalContent(html`
			<div id="EditPageable" data-expand data-dismissable>
				<div class="modal_body" style="max-width: calc(10% + 500px);max-height: calc(20% + 500px);">
					<div class="custom_toolbar">
						<span class="title medium"></span>
						<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
					</div>
					<edit-pageable-comp class="flex_stretch"></edit-pageable-comp>
				</div>
			</div>
		`);
	}

	/** @type {EditPageableComp} */
	// @ts-ignore
	const edit_pageable_comp = $("#EditPageable edit-pageable-comp");
	if (!ex) {
		EditPageableComp(edit_pageable_comp, undefined);
	}

	$("#EditPageable .custom_toolbar").append(edit_pageable_comp._nodes.save_btn);

	return edit_pageable_comp;
}
