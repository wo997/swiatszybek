/* js[admin] */

/**
 * @typedef {{
 * file_manager: FileManagerCompData
 * }} SelectFileModalCompData
 *
 * @typedef {{
 * _data: SelectFileModalCompData
 * _set_data(data?: SelectFileModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  file_manager: FileManagerComp
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} SelectFileModalComp
 */

/**
 * @param {SelectFileModalComp} comp
 * @param {*} parent
 * @param {SelectFileModalCompData} data
 */
function SelectFileModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			file_manager: {
				pagination_data: { page_id: 0, row_count_options: [12, 24, 48, 96], row_count: 48 },
				search_data: [],
			},
		};
	}

	comp._show = (options = {}) => {
		showModal("selectFile", {
			source: options.source,
		});
	};

	window.addEventListener("modal_hidden", (event) => {
		// @ts-ignore
		if (event.detail.node.id === "selectFile") {
			comp._data.file_manager.pagination_data.page_id = 0;
			comp._data.file_manager.quick_search = "";
			comp._render();
		}
	});

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="toolbar_wrapper"></div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<file-manager-comp data-node="{${comp._nodes.file_manager}}" data-bind="{${data.file_manager}}"></file-manager-comp>
			</div>
			<div class="pagination_wrapper pa1"></div>
		`,
		ready: () => {
			comp._child(".toolbar_wrapper").appendChild(comp._nodes.file_manager._child(".custom_toolbar"));
			comp._child(".pagination_wrapper").appendChild(comp._nodes.file_manager._child("pagination-comp"));
			comp
				._child(".toolbar_wrapper .custom_toolbar")
				.insertAdjacentHTML(
					"beforeend",
					html` <button class="btn subtle ml1" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button> `
				);
		},
	});
}

function getSelectFileModal() {
	const ex = $("#selectFile");
	if (!ex) {
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
	if (!ex) {
		SelectFileModalComp(select_file_modal_comp, undefined);
	}

	return select_file_modal_comp;
}
