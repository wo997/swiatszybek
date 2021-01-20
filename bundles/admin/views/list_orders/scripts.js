/* js[view] */

domload(() => {
	/** @type {FirstComponent} */
	// @ts-ignore
	const my_list_node = $(".my_component");

	// todo? force setting data on the main component and prevent doing so for children?
	// or prevent animations on creation, you might need it anyway
	createFirstCompontent(my_list_node, undefined, {
		id: 5,
		name: "asdsad",
		state: 1,
		list_data: [
			{ email: "wojtekwo997@gmail.com", name: "name" },
			{ email: "pies@pies.pies", name: "name" },
			{ email: "111", name: "name" },
			{ email: "4th", name: "name" },
		],
		list_row: { email: "xxx", name: "u" },
	});

	// createFirstCompontent(my_list_node, undefined);

	// my_list_node._setData({
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
 * } & ListComponentRowData} ListRowComponentData
 *
 * @typedef {{
 * _data: ListRowComponentData
 * _prev_data: ListRowComponentData
 * _setData(data?: ListRowComponentData, options?: SetComponentDataOptions)
 * _nodes: {
 *  idk: PiepNode
 *  delete_btn: PiepNode
 *  down_btn: PiepNode
 *  double_up_btn: PiepNode
 *  up_btn: PiepNode
 *  row_index: PiepNode
 * }
 * } & BaseComponent} ListRowComponent
 */

/**
 * @param {ListRowComponent} node
 * @param {*} parent
 * @param {ListRowComponentData} data
 */
function createListRowCompontent(node, parent, data = undefined) {
	if (data === undefined) {
		data = { email: "", name: "name" };
	}

	createComponent(node, parent, data, {
		template: /*html*/ `
            <span data-node="row_index"></span>
            <input type="text" class="field inline" data-bind="email">
            rewrite inputs
            <input type="text" class="field inline" data-bind="email">
    
            <button data-node="down_btn" class="btn subtle"><i class="fas fa-chevron-down"></i></button>
            <button data-node="up_btn" class="btn subtle"><i class="fas fa-chevron-up"></i></button>
            <button data-node="double_up_btn" class="btn subtle" data-tooltip="Na samą górę"><i class="fas fa-angle-double-up"></i></button>
            <button data-node="delete_btn" class="btn red"><i class="fas fa-trash"></i></button>
    
            <div data-node="idk"></div>
        `,
		initialize: () => {
			// a child can choose to subscribe to parents or any other components data, but in that case we use predefined relations in the list component

			// /** @type {ListComponent} */
			// // @ts-ignore
			// const parent = node.parent_component;
			// if (parent && parent._data && isArray(parent._data)) {
			// 	parent._subscribers.push({
			// 		fetch: (
			// 			/** @type {ListComponent} */ source,
			// 			/** @type {ListRowComponent} */ receiver
			// 		) => {
			// 			receiver._data.list_length = source._data.length;
			// 		},
			// 		receiver: node,
			// 	});
			// }

			// inefficient af, what if u bubble up info tho?
			// /** @type {ListComponent} */
			// // @ts-ignore
			// const grandparent = node.parent_component
			// 	? node.parent_component.parent_component
			// 	: null;
			// if (grandparent) {
			// 	grandparent._subscribers.push({
			// 		fetch: (
			// 			/** @type {FirstComponent} */ source,
			// 			/** @type {ListRowComponent} */ receiver
			// 		) => {
			// 			receiver._data.name = source._data.name;
			// 		},
			// 		receiver: node,
			// 	});
			// }

			node.classList.add("my_list_row");
			node._setData = (data = undefined, options = {}) => {
				setComponentData(node, data, {
					...options,
					render: () => {
						node._nodes.idk._set_content(JSON.stringify(node._data));
						if (node._data.row_index !== undefined) {
							node._nodes.row_index._set_content(
								node._data.row_index +
									1 +
									" / " +
									def(node._data.list_length, 0)
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
			};

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
	});
}

/**
 * @typedef {{
 *  id: number
 *  name: string
 *  state: number
 *  list_data: ListRowComponentData[]
 *  list_row: ListRowComponentData
 * }} FirstComponentData
 *
 * @typedef {{
 *  _data: FirstComponentData
 *  _prev_data: FirstComponentData
 *  _setData(data?: FirstComponentData, options?: SetComponentDataOptions)
 *  _getData()
 *  _saved_data: FirstComponentData
 *  _nodes: {
 *      crazy: PiepNode
 *      my_list: ListComponent
 *      my_list_copy: ListComponent
 *      load_btn: PiepNode
 *      save_btn: PiepNode
 *      add_btn: PiepNode
 *      list_count: PiepNode
 *      expand_y_1: PiepNode
 *      list_row: ListRowComponent
 *  }
 * } & BaseComponent} FirstComponent
 */

/**
 * @param {FirstComponent} node
 * @param {*} parent
 * @param {FirstComponentData} data
 */
function createFirstCompontent(node, parent, data = undefined) {
	if (data === undefined) {
		data = {
			id: -1,
			name: "",
			state: 0,
			list_data: [],
			list_row: { email: "", name: "name" },
		};
	}

	createComponent(node, parent, data, {
		template: /*html*/ `
            <div>
                <h3>
                    Save state of the component
                    <button data-node="save_btn" class="btn primary">Save</button>
                    <button data-node="load_btn" class="btn primary">Load</button>
                </h3>

                <h3>Type the name: </h3>
                <input type="text" class="field" data-bind="name"/></span>
                <br>

                <h3>And here it is!: </h3>
                <span data-bind="name" data-type="html"></span>
                <br>

                <h3>Oh, and the id: </h3>
                <span data-bind="id" data-type="html"></span>
                <br>

                <h3>Some state (changes list visibility) </h3>
                <checkbox data-bind="state"></checkbox>
                <br>

                <h3>
                    We can even have a list!
                    <span data-node="list_count"></span>
                    <button data-node="add_btn" class="btn primary">Add a new row!</button>
                </h3>
                <div data-node="expand_y_1" class="expand_y">
                    <div data-node="my_list" data-bind="list_data"></div>
                </div>

                <h3>List copied for no reason</h3>
                <div style="display:flex">
                    <div data-node="my_list_copy" data-bind="list_data"></div>
                </div>

                <h3>Example of standalone list row, dumb but we can do it</h3>
                <div data-node="list_row" data-bind="list_row"></div>

                <h3>Display form json</h3>
                <div data-node="crazy"></div>
            </div>
        `,
		initialize: () => {
			// TODO: make _setData a required parameter of create component, maybe you also want a defualts parameter for... defaults
			node._setData = (data = undefined, options = {}) => {
				if (data === undefined) {
					data = node._data;
				}

				// a way to pass data deeper easily,
				// luckily that works great and is kinda optimized unlike listening from a child,
				// u always wanna go deeper intstead of asking parents for data
				data.list_data.forEach((e) => {
					e.name = data.name;
				});

				setComponentData(node, data, {
					...options,
					render: () => {
						node._nodes.crazy._set_content(`
                            This string was generated by the compontent
                            ${JSON.stringify(node._data, null, 3)}
                        `);

						expand(node._nodes.expand_y_1, node._data.state === 1);

						const equivalent = isEquivalent(node._data, node._saved_data);
						const disable = !node._saved_data || equivalent;
						node._nodes.load_btn.toggleAttribute("disabled", disable);
						node._nodes.save_btn.toggleAttribute("disabled", equivalent);

						node._nodes.list_count._set_content(
							`(${node._data.list_data.length})`
						);
					},
				});
			};

			createListCompontent(node._nodes.my_list, node, createListRowCompontent);

			/*createListCompontent(
				node._nodes.my_list_copy,
				node,
				createListRowCompontent
			);*/

			createListRowCompontent(node._nodes.list_row, node);

			node._nodes.add_btn.addEventListener("click", () => {
				node._nodes.my_list._data.push(
					/** @type {ListRowComponentData} */ { email: "- default email -" }
				);
				node._nodes.my_list._setData();
			});

			node._nodes.save_btn.addEventListener("click", () => {
				node._saved_data = cloneObject(node._data);
				node._setData(undefined, { force_render: true });
			});

			node._nodes.load_btn.addEventListener("click", () => {
				node._data = cloneObject(node._saved_data);
				node._setData();
			});
		},
	});
}
