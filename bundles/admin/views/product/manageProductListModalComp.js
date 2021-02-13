/* js[view] */

/**
 * @typedef {{
 * questions: ManageProductList_QuestionCompData[]
 * }} ManageProductListModalCompData
 *
 * @typedef {{
 * _data: ManageProductListModalCompData
 * _set_data(data?: ManageProductListModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * _show()
 * } & BaseComp} ManageProductListModalComp
 */

/**
 * @param {ManageProductListModalComp} comp
 * @param {*} parent
 * @param {ManageProductListModalCompData} data
 */
function manageProductListModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { questions: [] };
	}

	comp._show = (product_feature_id, options = {}) => {
		setTimeout(() => {
			showModal("manageProductList", {
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
			<div class="custom-toolbar">
				<span class="title">Dodawanie produktów do listy</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<p style="font-size: 1.15em;text-align:center;margin:30px 0 20px;font-weight: 600;">
					Odpowiedz na poniższe pytania, a my pomożemy uzupełnić Ci dane nowych produktów:
				</p>
				<list-comp data-bind="{${data.questions}}" class="round">
					<manage-product-list_question-comp></manage-product-list_question-comp>
				</list-comp>
			</div>
		`,
		initialize: () => {
			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = $("product-comp");
		},
	});
}
