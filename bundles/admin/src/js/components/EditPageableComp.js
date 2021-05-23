/* js[admin] */

/**
 * @typedef {{
 * }} EditPageableCompData
 *
 * @typedef {{
 * _data: EditPageableCompData
 * _set_data(data?: EditPageableCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  delete_btn: PiepNode
 *  save_btn: PiepNode
 * }
 * _show(options?: ShowModalParams)
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

	comp._show = (options = {}) => {
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
				<div class="label first">siema</div>

				<div class="mta pt2" style="text-align: right;">
					<button class="btn error" data-node="{${comp._nodes.delete_btn}}">Usuń stronę / szablon <i class="fas fa-trash"></i></button>
				</div>
			</div>
		`,
		initialize: () => {},
		ready: () => {},
	});
}

function getEditPageableModal() {
	const ex = $("#EditPageable");
	if (!ex) {
		registerModalContent(html`
			<div id="EditPageable" data-dismissable>
				<div class="modal_body">
					<div class="custom_toolbar">
						<span class="title medium"> Edycja strony / szalonu </span>
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
