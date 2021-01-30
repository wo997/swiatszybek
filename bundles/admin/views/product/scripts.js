/* js[view] */

domload(() => {
	/** @type {ProductComp} */
	// @ts-ignore
	const my_list_node = $("product-comp");

	// todo? force setting data on the main component and prevent doing so for children?
	// or prevent animations on creation, you might need it anyway
	productComp(my_list_node, undefined, {
		id: 5,
		name: "asdsad",
		state: 1,
		sell_by: "qty",
		list_data: [
			{ email: "wojtekwo997@gmail.com", name: "name" },
			{ email: "pies@pies.pies", name: "name" },
			{ email: "111", name: "name" },
			{ email: "4th", name: "name" },
		],
		variants: [
			{ name: "123", email: "555" },
			{ name: "", email: "" },
		],
	});

	// productComp(my_list_node, undefined);

	// my_list_node._set_data({
	// 	id: 5,
	// 	name: "asdsad",
	// 	state: 1,
	// 	list_data: [
	// 		{ email: "wojtekwo997@gmail.com" },
	// 		{ email: "pies@pies.pies" },
	// 		{ email: "111" },
	// 	],
	// 	list_row: { email: "xxx" },
	// });
});

// probably bad naming of a component

/**
 * @typedef {{
 * email: string
 * list_length?: number
 * name: string
 * } & ListCompRowData} ListRowCompData
 *
 * @typedef {{
 * _data: ListRowCompData
 * _prev_data: ListRowCompData
 * _set_data(data?: ListRowCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  idk: PiepNode
 *  delete_btn: PiepNode
 *  down_btn: PiepNode
 *  double_up_btn: PiepNode
 *  up_btn: PiepNode
 *  row_index: PiepNode
 * }
 * } & BaseComp} ListRowComp
 */

/**
 * @param {ListRowComp} node
 * @param {*} parent
 * @param {ListRowCompData} data
 */
function listRowComp(node, parent, data = undefined) {
	if (data === undefined) {
		data = { email: "", name: "name" };
	}

	createComp(node, parent, data, {
		template: /*html*/ `
            <span data-node="row_index"></span>
            <input type="text" class="field inline" data-bind="{${data.email}}">
            rewrite inputs
            <input type="text" class="field inline" data-bind="{${data.email}}">
    
            <button data-node="down_btn" class="btn subtle"><i class="fas fa-chevron-down"></i></button>
            <button data-node="up_btn" class="btn subtle"><i class="fas fa-chevron-up"></i></button>
            <button data-node="double_up_btn" class="btn subtle" data-tooltip="Na samą górę"><i class="fas fa-angle-double-up"></i></button>
            <button data-node="delete_btn" class="btn red"><i class="fas fa-trash"></i></button>
    
            <div data-node="idk"></div>
        `,
		initialize: () => {
			// a child can choose to subscribe to parents or any other components data, but in that case we use predefined relations in the list component

			// /** @type {ListComp} */
			// // @ts-ignore
			// const parent = node._parent_comp;
			// if (parent && parent._data && isArray(parent._data)) {
			// 	parent._subscribers.push({
			// 		fetch: (
			// 			/** @type {ListComp} */ source,
			// 			/** @type {ListRowComp} */ receiver
			// 		) => {
			// 			receiver._data.list_length = source._data.length;
			// 		},
			// 		receiver: node,
			// 	});
			// }

			// inefficient af, what if u bubble up info tho?
			// /** @type {ListComp} */
			// // @ts-ignore
			// const grandparent = node._parent_comp
			// 	? node._parent_comp._parent_comp
			// 	: null;
			// if (grandparent) {
			// 	grandparent._subscribers.push({
			// 		fetch: (
			// 			/** @type {ProductComp} */ source,
			// 			/** @type {ListRowComp} */ receiver
			// 		) => {
			// 			receiver._data.name = source._data.name;
			// 		},
			// 		receiver: node,
			// 	});
			// }

			node.classList.add("my_list_row");

			node._nodes.delete_btn.addEventListener("click", () => {
				if (parent._removeRow) {
					parent._removeRow(node._data.row_index);
				}
			});

			node._nodes.up_btn.addEventListener("click", () => {
				if (parent._moveRow) {
					parent._moveRow(node._data.row_index, node._data.row_index - 1);
				}
			});

			node._nodes.down_btn.addEventListener("click", () => {
				if (parent._moveRow) {
					parent._moveRow(node._data.row_index, node._data.row_index + 1);
				}
			});

			node._nodes.double_up_btn.addEventListener("click", () => {
				if (parent._moveRow) {
					parent._moveRow(node._data.row_index, 0);
				}
			});
		},
		setData: (
			/** @type {ListRowCompData} */ data = undefined,
			options = {}
		) => {
			setCompData(node, data, {
				...options,
				render: () => {
					node._nodes.idk._set_content(JSON.stringify(node._data));
					if (node._data.row_index !== undefined) {
						node._nodes.row_index._set_content(
							node._data.row_index + 1 + " / " + def(node._data.list_length, 0)
						);
					}

					if (node._data.list_length !== undefined) {
						node._nodes.down_btn.toggleAttribute(
							"disabled",
							node._data.row_index >= node._data.list_length - 1
						);

						node._nodes.up_btn.toggleAttribute(
							"disabled",
							node._data.row_index <= 0
						);
						node._nodes.double_up_btn.toggleAttribute(
							"disabled",
							node._data.row_index <= 0
						);
					}
				},
			});
		},
	});
}
