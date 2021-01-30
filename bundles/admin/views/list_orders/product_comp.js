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
 *      crazy: PiepNode
 *      my_list: ListComponent
 *      my_list_copy: ListComponent
 *      add_variant_btn: PiepNode
 *      list_count: PiepNode
 *      expand_y_1: PiepNode
 *      list_row: ListRowComponent
 *      variants: ListComponent
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
                    <div data-bind="variants" data-node="variants"></div>
                    <list-comp data-bind="variants">
                        pies pies pies
                        <product-variant-comp></product-variant-comp>
                    </list-comp>
                </div>

                <h3>Some state (changes list visibility) </h3>
                <p-checkbox data-bind="state"></p-checkbox>
                <br>

                <h3>
                    We can even have a list!
                    <span data-node="list_count"></span>
                    <button data-node="add_btn" class="btn primary">Add a new row!</button>
                </h3>
                <div data-node="expand_y_1" class="expand_y">
                    <div data-node="my_list" data-bind="list_data"></div>
                </div>

                <h3>Display form json</h3>
                <div data-node="crazy"></div>
            </div>
        `,
		initialize: () => {
			listComp(node._nodes.my_list, node, undefined, {
				rowContructor: listRowComp,
			});

			listComp(node._nodes.variants, node, undefined, {
				rowContructor: productVariantComp,
			});

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
					node._nodes.crazy._set_content(JSON.stringify(node._data, null, 3));

					expand(node._nodes.case_sell_by_qty, node._data.sell_by === "qty");
				},
			});
		},
	});
}
