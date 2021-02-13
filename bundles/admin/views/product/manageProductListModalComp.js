/* js[view] */

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
 * _show(options?: {source?: PiepNode})
 * } & BaseComp} ManageProductListModalComp
 */

/**
 * @param {ManageProductListModalComp} comp
 * @param {*} parent
 * @param {ManageProductListModalCompData} data
 */
function manageProductListModalComp(comp, parent, data = undefined) {
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
			<div class="custom-toolbar">
				<span class="title">Dodawanie produktów do listy</span>
				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
			</div>
			<div class="scroll-panel scroll-shadow panel-padding">
				<div class="label first" style="font-size:1.1em">
					Pytania pomocnicze (<span html="{${data.questions.filter((q) => q.value).length + "/" + data.questions.length}}"></span>)
					<i
						class="fas fa-info-circle"
						data-tooltip="Odpowiedzi pomogą nam dokonać precyzyjnych<br>modyfikacji produktów oraz skrócą Twój czas pracy"
					></i>
				</div>

				<list-comp data-bind="{${data.questions}}" class="round">
					<manage-product-list_question-comp></manage-product-list_question-comp>
				</list-comp>
				<button
					data-node="{${comp._nodes.add_btn}}"
					class="btn {${data.questions.find((q) => !q.value)}?primary:important}"
					style="margin: 10px auto 0;min-width: 160px;"
					data-tooltip="{${data.questions.find((q) => !q.value)
						? "Dane możesz uzupełnić ręcznie, ale zalecamy odpowiedzieć na wszystkie pytania"
						: ""}}"
				>
					Dodaj produkty
					<i class="fas fa-check"></i>
				</button>
			</div>
		`,
		initialize: () => {
			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = $("product-comp");

			comp._nodes.add_btn.addEventListener("click", () => {
				hideParentModal(comp);

				comp._data.add_products.forEach((p) => {
					product_comp._data.products_dt.dataset.push(p);
				});

				product_comp._render();
			});
		},
	});
}
