/* js[admin] */

/**
 * @typedef {{
 * questions: ManageProductList_QuestionCompData[]
 * add_products: any[]
 * }} ManageProductListModalCompData
 *
 * @typedef {{
 * _data: ManageProductListModalCompData
 * _set_data(data?: ManageProductListModalCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_btn: PiepNode
 * }
 * _show(options?: ShowModalParams)
 * } & BaseComp} ManageProductListModalComp
 */

/**
 * @param {ManageProductListModalComp} comp
 * @param {*} parent
 * @param {ManageProductListModalCompData} data
 */
function ManageProductListModalComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { questions: [], add_products: [] };
	}

	comp._show = (options = {}) => {
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
			<div class="custom_toolbar">
				<span class="title medium">Zarządzanie listą produktów</span>
				<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
			</div>
			<div class="scroll_panel scroll_shadow panel_padding">
				<div class="mtfn">
					<div class="label semi_medium">
						Pytania pomocnicze (<span html="{${data.questions.filter((q) => q.value).length + "/" + data.questions.length}}"></span>)
						<i
							class="fas fa-info-circle"
							data-tooltip="Odpowiedzi pomogą nam dokonać precyzyjnych<br>modyfikacji produktów oraz skrócą Twój czas pracy"
						></i>
					</div>

					<list-comp data-bind="{${data.questions}}" class="wireframe space">
						<manage-product-list_question-comp></manage-product-list_question-comp>
					</list-comp>
					<div class="mt2 flex justify_center">
						<button
							data-node="{${comp._nodes.add_btn}}"
							class="btn {${data.questions.find((q) => !q.value)}?primary:important}"
							style="min-width: 160px;"
							data-tooltip="{${data.questions.find((q) => !q.value)
								? "Dane możesz uzupełnić ręcznie, ale zalecamy odpowiedzieć na wszystkie pytania"
								: ""}}"
						>
							Dodaj produkty
							<i class="fas fa-check"></i>
						</button>
					</div>
				</div>
			</div>
		`,
		initialize: () => {
			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = $("product-comp");

			comp._nodes.add_btn.addEventListener("click", () => {
				hideParentModal(comp);

				const similar_products = [];
				const options_existed = [];

				comp._data.questions.forEach((question) => {
					const option_id = question.value;
					if (!option_id || option_id === -1) {
						return;
					}
					if (question.type === "copy") {
						similar_products.push({ new_option_id: question.copy_option_id, option_id: option_id });
					} else if (question.type === "existed") {
						options_existed.push(option_id);
					}
				});

				product_comp._add_missing_products({ similar_products, options_existed });
				product_comp._render();
			});
		},
	});
}

function getManageProductListModal() {
	const ex = $("#manageProductList");
	if (!ex) {
		registerModalContent(html`
			<div id="manageProductList" data-dismissable>
				<div class="modal_body" style="width: calc(20% + 300px);max-height: calc(75% + 100px);">
					<manage-product-list-modal-comp class="flex_stretch"></manage-product-list-modal-comp>
				</div>
			</div>
		`);
	}

	/** @type {ManageProductListModalComp} */
	// @ts-ignore
	const manage_product_list_modal_comp = $("#manageProductList manage-product-list-modal-comp");
	if (!ex) {
		ManageProductListModalComp(manage_product_list_modal_comp, undefined);
	}

	return manage_product_list_modal_comp;
}
