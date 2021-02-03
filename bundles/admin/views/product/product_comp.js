/* js[view] */

/**
 * @typedef {{
 *  id: number
 *  name: string
 *  sell_by: string
 *  variants: ProductVariantCompData[]
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
function productComp(
	comp,
	parent,
	data = {
		id: -1,
		name: "",
		sell_by: "qty",
		variants: [],
	}
) {
	comp._set_data = (data = undefined, options = {}) => {
		if (data === undefined) {
			data = comp._data;
		}

		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.case_sell_by_qty, comp._data.sell_by === "qty");
			},
		});
	};

	createComp(comp, parent, data, {
		template: /*html*/ `
            <div>
                <div class="label">Nazwa produktu</div>
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

                <h3>Display form json</h3>
                <div html="{${JSON.stringify(data)}}"></div>
            </div>
        `,
		initialize: () => {
			comp._nodes.add_variant_btn.addEventListener("click", () => {
				showModal("selectProductVariant", {
					source: comp._nodes.add_variant_btn,
				});

				//node._data.variants.push({ feature_id: -1, options: [] });
				//node._set_data();
			});
		},
	});
}
