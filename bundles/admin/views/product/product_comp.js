/* js[view] */

/**
 * @typedef {{
 *  product_id: number
 *  name: string
 *  net_price: number
 *  vat: number
 *  gross_price: number
 * }} ProductData
 *
 * @typedef {{
 *  id: number
 *  name: string
 *  sell_by: string
 *  variants: ProductVariantCompData[]
 *  products: ProductData[]
 *  products_dt?: DatatableCompData
 * }} ProductCompData
 *
 * @typedef {{
 *  _data: ProductCompData
 *  _set_data(data?: ProductCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _nodes: {
 *      add_variant_btn: PiepNode
 *      case_sell_by_qty: PiepNode
 *  }
 * } & BaseComp} ProductComp
 */

/**
 * @param {ProductComp} comp
 * @param {*} parent
 * @param {ProductCompData} data
 */
function productComp(comp, parent, data) {
	/** @type {ProductData[]} */
	const products = [{ product_id: 2, name: "sadfas", gross_price: 234, net_price: 40, vat: 23 }]; // will be empty

	data.products_dt = def(data.products_dt, {
		columns: [
			{ key: "product_id", label: "ID", width: "10%", sortable: true, searchable: "number" },
			{ key: "name", label: "Nazwa", width: "10%", sortable: true, searchable: "string" },
			{ key: "net_price", label: "Cena Netto", width: "10%", sortable: true, searchable: "number" },
			{ key: "vat", label: "Vat", width: "10%", sortable: true, searchable: "number" },
			{ key: "gross_price", label: "Cena Brutto", width: "10%", sortable: true, searchable: "number" },
		],
		dataset: products,
	});

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.case_sell_by_qty, data.sell_by === "qty");
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
            <div class="label first">Nazwa produktu</div>
            <input type="text" class="field" data-bind="{${data.name}}"/></span>

            <div class="label">Sprzedawaj na</div>
            <select class="field" data-bind="{${data.sell_by}}">
                <option value="qty">Sztuki</option>
                <option value="weight">Wagę</option>
                <option value="length">Długość</option>
            </select>

            <div data-node="case_sell_by_qty" class="expand_y">
                <div class="label">
                    <span html="{${"Warianty (" + data.variants.length + ")"}}"></span>
                    <button data-node="add_variant_btn" class="btn primary small">Wybierz <i class="fas fa-search"></i></button>
                </div>
                <list-comp data-bind="{${data.variants}}" class="variants">
                    <product-variant-comp></product-variant-comp>
                </list-comp>
            </div>

            <datatable-comp data-bind="{${data.products_dt}}"></datatable-comp>

            <h3>Display form json</h3>
            <div html="{${JSON.stringify(data)}}"></div>
        `,
		initialize: () => {
			comp._nodes.add_variant_btn.addEventListener("click", () => {
				/** @type {SelectProductFeaturesComp} */
				// @ts-ignore
				const select_product_features_comp = $("#selectProductFeatures select-product-features-modal-comp");

				select_product_features_comp._data.datatable.selection = [];
				select_product_features_comp._render();

				showModal("selectProductFeatures", {
					source: comp._nodes.add_variant_btn,
				});
			});
		},
	});
}
