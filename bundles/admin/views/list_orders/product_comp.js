/* js[view] */

/**
 * @typedef {{
 *  id: number
 *  name: string
 *  state: number
 *  sell_by: string
 *  list_data: ListRowComponentData[]
 *  variants: ProductVariantComponentData[]
 * }} FirstComponentData
 *
 * @typedef {{
 *  _data: FirstComponentData
 *  _prev_data: FirstComponentData
 *  _set_data(data?: FirstComponentData, options?: SetComponentDataOptions)
 *  _getData()
 *  _saved_data: FirstComponentData
 *  _nodes: {
 *      add_variant_btn: PiepNode
 *      case_sell_by_qty: PiepNode
 *  }
 * } & BaseComponent} FirstComponent
 */

/**
 * @param {FirstComponent} node
 * @param {*} parent
 * @param {FirstComponentData} data
 */
function firstComp(node, parent, data = undefined) {
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

	createComponent(node, parent, data, {
		template: /*html*/ `
            <div>
                <div class="label">Nazwa produktu</div>
                <input type="text" class="field" data-bind="name"/></span>

                <div class="label">Sprzedawaj na</div>
                <select class="field" data-bind="sell_by">
                    <option value="qty">Sztuki</option>
                    <option value="weight">Wagę</option>
                    <option value="length">Długość</option>
                </select>

                <div data-node="case_sell_by_qty" class="expand_y">
                    <div class="label">
                    Warianty ({{@variants.length}})
                    <button data-node="add_variant_btn" class="btn primary">Dodaj kolejny <i class="fas fa-plus"></i></button>
                    </div>
                    <list-comp data-bind="variants">
                        <product-variant-comp></product-variant-comp>
                        <product-variant-comp></product-variant-comp>
                        Oh baby, I can add random shit here and it acts like a <span class="semi-bold">template</span>, cool,
                        more components are welcome!
                    </list-comp>
                </div>

                <h3>Display form json</h3>
                <div>{{JSON.stringify(@)}}</div>
            </div>
        `,
		initialize: () => {
			node._nodes.add_variant_btn.addEventListener("click", () => {
				node._data.variants.push({ email: "", name: "dff" });
				node._set_data();
			});
		},
		setData: (
			/** @type {FirstComponentData} */ data = undefined,
			options = {}
		) => {
			if (data === undefined) {
				data = node._data;
			}

			data.list_data.forEach((e) => {
				e.name = data.name;
			});

			setComponentData(node, data, {
				...options,
				render: () => {
					expand(node._nodes.case_sell_by_qty, node._data.sell_by === "qty");
				},
			});
		},
	});
}
