/* js[view] */

/**
 * @typedef {{
 * label: string
 * options: {label: string, value: any}[],
 * value?: number
 * } & ListCompRowData} ManageProductList_QuestionCompData
 *
 * @typedef {{
 * _data: ManageProductList_QuestionCompData
 * _set_data(data?: ManageProductList_QuestionCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  options: PiepNode
 * }
 * _show()
 * } & BaseComp} ManageProductList_QuestionComp
 */

/**
 * @param {ManageProductList_QuestionComp} comp
 * @param {*} parent
 * @param {ManageProductList_QuestionCompData} data
 */
function manageProductList_questionComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { label: "", options: [] };
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				comp._nodes.options._set_content(
					data.options
						.map(
							(o) => html`<label class="option">
								<p-checkbox data-value="${o.value}"></p-checkbox>
								${o.label}
							</label>`
						)
						.join("")
				);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<span class="semi-bold" html="{${data.row_index + 1 + ". " + data.label}}"></span><br />
			<div data-node="{${comp._nodes.options}}" class="radio_group" data-bind="{${data.value}}" data-number></div>
		`,
		initialize: () => {},
	});
}
