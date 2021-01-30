/* js[view] */

/**
 * @typedef {{
 *  id: number
 *  name: string
 *  state: number
 *  sell_by: string
 *  list_data: ListRowCompData[]
 *  variants: ProductVariantCompData[]
 * }} ProductCompData
 *
 * @typedef {{
 *  _data: ProductCompData
 *  _prev_data: ProductCompData
 *  _set_data(data?: ProductCompData, options?: SetCompDataOptions)
 *  _getData()
 *  _saved_data: ProductCompData
 *  _nodes: {
 *      add_variant_btn: PiepNode
 *      case_sell_by_qty: PiepNode
 *  }
 * } & BaseComp} ProductComp
 */

/**
 * @param {ProductComp} node
 * @param {*} parent
 * @param {ProductCompData} data
 */
function productComp(node, parent, data = undefined) {
	if (data === undefined) {
		data = {
			id: -1,
			name: "",
			state: 0,
			sell_by: "qty",
			list_data: [],
			variants: [],
		};
	}

	createComp(node, parent, data, {
		template: /*html*/ `
            <div>
                <div class="label">Nazwa produktu</div>
                <input type="text" class="field" data-bind="{${
									data.name
								}}"/></span>

                <div class="label">Sprzedawaj na</div>
                <select class="field" data-bind="{${data.sell_by}}">
                    <option value="qty">Sztuki</option>
                    <option value="weight">Wagę</option>
                    <option value="length">Długość</option>
                </select>

                <div data-node="case_sell_by_qty" class="expand_y">
                    <div class="label">
                    Warianty ({${data.variants.length}})
                    <button data-node="add_variant_btn" class="btn primary">Dodaj kolejny <i class="fas fa-plus"></i></button>
                    </div>
                    <list-comp data-bind="{${data.variants}}">
                        <product-variant-comp></product-variant-comp>
                    </list-comp>
                </div>

                <h3>Display form json</h3>
                <div>{${JSON.stringify(data)}}</div>
            </div>
        `,
		initialize: () => {
			node._nodes.add_variant_btn.addEventListener("click", () => {
				node._data.variants.push({ email: "", name: "dff" });
				node._set_data();
			});
		},
		setData: (
			/** @type {ProductCompData} */ data = undefined,
			options = {}
		) => {
			if (data === undefined) {
				data = node._data;
			}

			data.list_data.forEach((e) => {
				e.name = data.name;
			});

			setCompData(node, data, {
				...options,
				render: () => {
					expand(node._nodes.case_sell_by_qty, node._data.sell_by === "qty");
				},
			});
		},
	});
}
