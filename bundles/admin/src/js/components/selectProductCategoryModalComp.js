// /* js[admin] */

// /**
//  * @typedef {{
//  * select_callback?(product_category_id: number)
//  * } & ShowModalParams} ShowSelectProductCategoryModalOptions
//  *
//  * @typedef {{
//  * datatable: DatatableCompData
//  * }} SelectProductCategoryModalCompData
//  *
//  * @typedef {{
//  * _data: SelectProductCategoryModalCompData
//  * _set_data(data?: SelectProductCategoryModalCompData, options?: SetCompDataOptions)
//  * _nodes: {
//  *      datatable: DatatableComp
//  * }
//  * _show(options?: ShowSelectProductCategoryModalOptions)
//  * _refresh_dataset()
//  * _show_options: ShowSelectProductCategoryModalOptions
//  * } & BaseComp} SelectProductCategoryModalComp
//  */

// /**
//  * @param {SelectProductCategoryModalComp} comp
//  * @param {*} parent
//  * @param {SelectProductCategoryModalCompData} data
//  */
// function SelectProductCategoryModalComp(comp, parent, data = undefined) {
// 	if (data === undefined) {
// 		data = {
// 			datatable: {
// 				dataset: product_categories,
// 				columns: [
// 					{
// 						label: "Kategoria",
// 						key: "name",
// 						width: "1",
// 						searchable: "string",
// 						render: (data) => {
// 							if (data.selected) {
// 								return html`<div class="semi_bold text_success"><i class="fas fa-check"></i> ${data.name}</div>`;
// 							}
// 							return data.name;
// 						},
// 					},
// 					{
// 						label: "Akcja",
// 						width: "207px",
// 						flex: true,
// 						render: (data) => {
// 							return html` <button class="btn primary small select_btn" style="min-width: 73px;">
// 								Dodaj <i class="fas fa-plus"></i>
// 							</button>`;
// 						},
// 					},
// 				],
// 				//pagination_data: { row_count: 50 },
// 				primary_key: "product_category_id",
// 				empty_html: html`Brak cech`,
// 				label: "Kategorie produktów",
// 			},
// 		};
// 	}

// 	comp._refresh_dataset = () => {
// 		comp._nodes.datatable._data.dataset = product_categories;
// 		comp._nodes.datatable._render();
// 	};

// 	comp._show = (options = {}) => {
// 		comp._refresh_dataset();
// 		comp._show_options = options;

// 		setTimeout(() => {
// 			showModal("SelectProductCategory", {
// 				source: options.source,
// 			});
// 		});
// 	};

// 	comp._set_data = (data, options = {}) => {
// 		setCompData(comp, data, {
// 			...options,
// 			render: () => {},
// 		});
// 	};

// 	createComp(comp, parent, data, {
// 		template: html`
// 			<div class="custom_toolbar">
// 				<span class="title medium">Wybierz kategorię</span>
// 				<button class="btn subtle" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
// 			</div>
// 			<div class="scroll_panel scroll_shadow panel_padding">
// 				<datatable-comp data-node="{${comp._nodes.datatable}}" data-bind="{${data.datatable}}"></datatable-comp>
// 			</div>
// 		`,
// 		initialize: () => {
// 			comp._nodes.datatable.addEventListener("click", (ev) => {
// 				const target = $(ev.target);

// 				const select_btn = target._parent(".select_btn");
// 				if (select_btn) {
// 					const list_row = select_btn._parent(".list_row");
// 					if (list_row) {
// 						const product_category_id = +list_row.dataset.primary;

// 						if (comp._show_options.select_callback) {
// 							comp._show_options.select_callback(product_category_id);
// 						}

// 						hideParentModal(comp);
// 					}
// 				}
// 			});

// 			window.addEventListener("product_categories_changed", () => {
// 				comp._refresh_dataset();
// 			});
// 		},
// 		ready: () => {},
// 	});
// }

// function getSelectProductCategoryModal() {
// 	const ex = $("#SelectProductCategory");
// 	if (!ex) {
// 		registerModalContent(html`
// 			<div id="SelectProductCategory" data-expand data-dismissable>
// 				<div class="modal_body" style="max-width: 1000px;max-height: calc(75% + 100px);">
// 					<select-product-category-modal-comp class="flex_stretch"></select-product-category-modal-comp>
// 				</div>
// 			</div>
// 		`);
// 	}

// 	/** @type {SelectProductCategoryModalComp} */
// 	// @ts-ignore
// 	const select_product_category_modal_comp = $("#SelectProductCategory select-product-category-modal-comp");
// 	if (!ex) {
// 		SelectProductCategoryModalComp(select_product_category_modal_comp, undefined);
// 	}

// 	return select_product_category_modal_comp;
// }
