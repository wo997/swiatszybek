/* js[admin] */

/**
 * @typedef {{
 * }} SelectFileModalCompData
 *
 * @typedef {{
 * _data: SelectFileModalCompData
 * _set_data(data?: SelectFileModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} SelectFileModalComp
 */

/**
 * @param {SelectFileModalComp} comp
 * @param {*} parent
 * @param {SelectFileModalCompData} data
 */
function selectFileModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {};
	}

	comp._show = (options = {}) => {
		showModal("selectFile", {
			source: options.source,
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
			<div class="custom_toolbar">
				<span class="title medium">Wybierz opcje dla: <span class="product_name"></span></span>
				<button class="btn subtle" data-node="{${comp._nodes.close_btn}}" onclick="hideParentModal(this)">
					Zamknij <i class="fas fa-times"></i>
				</button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<file-manager-comp></file-manager-comp>
			</div>
		`,
		initialize: () => {},
	});
}

function getSelectFileModal() {
	if (!$("#selectFile")) {
		registerModalContent(html`
			<div id="selectFile" data-expand data-dismissable>
				<div class="modal_body">
					<select-file-modal-comp class="flex_stretch"></select-file-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {SelectFileModalComp} */
	// @ts-ignore
	const select_file_modal_comp = $("#selectFile select-file-modal-comp");
	selectFileModalComp(select_file_modal_comp, undefined);

	return select_file_modal_comp;
}
