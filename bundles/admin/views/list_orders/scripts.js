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
			{ email: "wojtekwo997@gmail.com" },
			{ email: "pies@pies.pies" },
			{ email: "111" },
			{ email: "4th" },
		],
		list_row: { email: "xxx" },
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
 * @param {ListRowComponentData} _data
 */
function createListRowCompontent(node, parent, _data = undefined) {
	if (_data === undefined) {
		_data = { email: "" };
	}

	createComponent(node, parent, _data, {
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
			// const parent = node._parent_component;
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

			node.classList.add("my_list_row");
			node._setData = (data = undefined, options = {}) => {
				setComponentData(node, data, {
					...options,
					render: () => {
						node._nodes.idk.setContent(JSON.stringify(node._data));
						if (node._data.row_index !== undefined) {
							node._nodes.row_index.setContent(
								node._data.row_index +
									1 +
									" / " +
									nonull(node._data.list_length, 0)
							);
						}

						if (node._data.list_length !== undefined) {
							toggleDisabled(
								node._nodes.down_btn,
								node._data.row_index >= node._data.list_length - 1
							);
							toggleDisabled(node._nodes.up_btn, node._data.row_index <= 0);
							toggleDisabled(
								node._nodes.double_up_btn,
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

// list component will be reusable

/**
 * @typedef {{
 * row_index?: number
 * row_id?: number
 * }} ListComponentRowData row_index is a part of set of consecutive numbers, meanwhile row_id is a number that uniquely defines a row even when it chagnes the order etc.
 */

/**
 * @typedef {{
 * _data: Array
 * _prev_data: Array
 * _setData(data?: Array, options?: SetComponentDataOptions)
 * _nextRowId: number
 * _removeRow(row_index: number)
 * _moveRow(from: number, to: number)
 * _getRows(): AnyComponent[]
 * } & BaseComponent} ListComponent
 */

/**
 * @param {ListComponent} node
 * @param {*} parent
 * @param {CallableFunction} createRowCallback
 * @param {Array} _data
 */
function createListCompontent(
	node,
	parent,
	createRowCallback,
	_data = undefined
) {
	if (_data === undefined) {
		_data = [];
	}

	createComponent(node, parent, _data, {
		initialize: () => {
			// why negative? it won't overlap with for example entity ids
			//node._nextRowId = -1000;

			node.classList.add("my_list");

			node._getRows = () => {
				/** @type {AnyComponent[]} */
				// @ts-ignore
				const res = node.directChildren(":not(.removing)");
				return res;
			};

			node._pointChildsData = (child) => {
				let source_sub_data_index = node._data.findIndex((e) => {
					return e.row_id === child._data.row_id;
				});
				return {
					obj: node._data,
					key: source_sub_data_index === -1 ? null : source_sub_data_index,
				};
			};

			node._setData = (_data = undefined, options = {}) => {
				if (_data === undefined) {
					_data = node._data;
				}

				//node._nextRowId = 0;
				let nextRowId = 0; // act like a singleton for efficiency

				_data.forEach((row_data, index) => {
					// pass data no matter who the child is - should be defined by options cause it's inefficient to set each row every time u do anything
					if (row_data.row_id === undefined) {
						if (nextRowId === 0) {
							nextRowId = applyToArray(Math.min, [
								..._data.map((e) => e.row_id).filter((e) => e),
								-1000,
							]); // that will be unique for sure
						}
						row_data.row_id = --nextRowId;
						//row_data.row_id = node._nextRowId--;
					}
					row_data.row_index = index;
					row_data.list_length = _data.length;
				});

				setComponentData(node, _data, {
					...options,
					render: () => {
						const diff = diffArrays(
							node._prev_data,
							node._data,
							(e) => e.row_id
						);

						if (diff.length === 0) {
							return;
						}

						const diff_with_target_index = diff.map((e) => ({
							...e,
							target_index: e.to !== -1 ? e.to : e.from,
						}));

						const animation_duration = 250;

						const rows_before = node._getRows();

						/** @type {ClientRect[]} */
						const row_rects_before = [];
						rows_before.forEach((e) => {
							row_rects_before.push(e.getBoundingClientRect());
						});

						let removed_before_current = 0;

						/*console.log(
							diff,
							node._prev_data ? node._prev_data.length : 0,
							node._data.length
                        );*/
						///console.log(diff);

						diff_with_target_index
							.sort((a, b) => Math.sign(a.target_index - b.target_index))
							.forEach((diff_info) => {
								const remove = diff_info.to === -1;
								const add = diff_info.from === -1;

								let child = add ? undefined : rows_before[diff_info.from];

								if (add) {
									/** @type {AnyComponent} */
									// @ts-ignore
									child = createNodeFromHtml(/*html*/ `
                                            <div class="my_list_row_wrapper expand_y hidden animate_hidden">
                                            <div class="my_list_row"></div>
                                            </div>
                                        `);
								}

								const target_index_real =
									diff_info.target_index + removed_before_current;

								if (target_index_real !== diff_info.from) {
									node.insertBefore(child, node.children[target_index_real]);
								}

								if (add) {
									const row_data = node._data[diff_info.to];
									const the_row = child.find(".my_list_row");
									createRowCallback(the_row, node, row_data, {});
									expand(child, true, { duration: animation_duration });
								} else if (remove) {
									expand(child, false, { duration: animation_duration });
									child.classList.add("removing");
									setTimeout(() => {
										child.remove();
										//child.classList.remove("component");
									}, animation_duration);

									removed_before_current++;
								} else {
									const rect_before = row_rects_before[diff_info.from];
									const rect_after = child.getBoundingClientRect();

									const offset_0 = Math.round(rect_before.top - rect_after.top);

									if (Math.abs(offset_0) > 2) {
										animate(
											child,
											`
                                                0% {transform:translateY(${offset_0}px)}
                                                100% {transform:translateY(0px)}
                                            `,
											animation_duration
										);
									}
								}
							});
					},
				});
			};

			node._removeRow = (row_index) => {
				const remove_index = node._data.findIndex((d) => {
					return d.row_index === row_index;
				});
				if (remove_index !== -1) {
					node._data.splice(remove_index, 1);
					node._setData();
				}
			};

			node._moveRow = (from, to) => {
				const middle = (val) => {
					return Math.max(Math.min(val, node._data.length - 1), 0);
				};
				from = middle(from);
				to = middle(to);

				const temp = node._data.splice(from, 1);
				node._data.splice(to, 0, ...temp);
				node._setData();
			};

			// basically empty when created
			//node.setContent();
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
 * @param {FirstComponentData} _data
 */
function createFirstCompontent(node, parent, _data = undefined) {
	if (_data === undefined) {
		_data = {
			id: -1,
			name: "",
			state: 0,
			list_data: [],
			list_row: { email: "" },
		};
	}

	createComponent(node, parent, _data, {
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
				setComponentData(node, data, {
					...options,
					render: () => {
						node._nodes.crazy.setContent(`
                            This string was generated by the compontent
                            ${JSON.stringify(node._data, null, 3)}
                        `);

						expand(node._nodes.expand_y_1, node._data.state === 1);

						const equivalent = isEquivalent(node._data, node._saved_data);
						const disable = !node._saved_data || equivalent;
						toggleDisabled(node._nodes.load_btn, disable);
						toggleDisabled(node._nodes.save_btn, equivalent);

						node._nodes.list_count.setContent(
							`(${node._data.list_data.length})`
						);
					},
				});
			};

			createListCompontent(node._nodes.my_list, node, createListRowCompontent);

			createListCompontent(
				node._nodes.my_list_copy,
				node,
				createListRowCompontent
			);

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

// things below will be just a library, reusable

/**
 * @typedef {{
 * fetch(source: AnyComponent, receiver: AnyComponent)
 * receiver: AnyComponent
 * }} SubscribeToData
 *
 * @typedef {{
 * obj: any
 * key: any
 * }} ObjectData
 *
 * @typedef {{
 * _bindNodes: PiepNode[]
 * _parent_component?: AnyComponent
 * _referenceParent: CallableFunction
 * _pointChildsData(child: AnyComponent): ObjectData
 * _addSubscriber(subscribe: SubscribeToData)
 * _subscribers: SubscribeToData[]
 * _bind_var?: string
 * } & PiepNode} BaseComponent
 *
 * @typedef {{
 * force_render?: boolean
 * }} SetComponentDataOptions
 *
 * I'm not a fan of it but regular inheritance doesn't seem to work as expected os we assign common props in here
 * @typedef {{
 * _data: any
 * _setData(data?: any, options?: SetComponentDataOptions)
 * _prev_data: any
 * _nodes: any
 * } & BaseComponent} AnyComponent
 *
 * @typedef {{
 * template?: string
 * initialize?()
 * }} createComponentOptions
 */

/**
 * @param {BaseComponent} comp
 * @param {*} parent_comp
 * @param {*} _data
 * @param {createComponentOptions} options
 * */
function createComponent(comp, parent_comp, _data, options) {
	/** @type {AnyComponent} */
	// @ts-ignore
	const node = comp;

	/** @type {AnyComponent} */
	// @ts-ignore
	const _parent = parent_comp;

	//node.classList.add("component");

	if (!!_parent && !(_parent instanceof HTMLElement)) {
		console.error("Parent is not a node!", _parent);
		console.trace();
	}
	node._parent_component = _parent;

	node._subscribers = [];

	if (!node._pointChildsData) {
		node._pointChildsData = (child) => {
			const bind_var = child.dataset.bind;
			if (bind_var) {
				return {
					obj: node._data,
					key: bind_var,
				};
			}
		};
	}

	if (options.template) {
		node.setContent(options.template);
	}

	node._nodes = {};
	node.findAll(`[data-node]`).forEach((n) => {
		node._nodes[n.dataset.node] = n;
	});

	if (options.initialize) {
		options.initialize();
	}

	// kinda weird but it creates the checkbox subcomponent
	registerForms();

	node._bindNodes = node.findAll(`[data-bind]`);

	node._bindNodes.forEach((/** @type {AnyComponent} */ sub_node) => {
		const bind_var = sub_node.dataset.bind;
		sub_node._bind_var = bind_var;

		if (sub_node.getValue() !== undefined) {
			// a weird way to tell if something should actually have a set or get value, I think that piepquery should be responsible for that
			sub_node.addEventListener("change", () => {
				let sub_node_data = sub_node.getValue();

				if (sub_node_data !== undefined) {
					if (node._data[bind_var] !== undefined) {
						node._data[bind_var] = sub_node_data;
						node._setData();
					}
				}
			});
			sub_node.addEventListener("input", () => {
				sub_node.dispatchChange();
			});
		}
	});

	if (_data !== undefined) {
		node._setData(_data);
	}

	if (_parent) {
		_parent._subscribers.push({
			receiver: node,
			fetch: (source, receiver) => {
				const { obj, key } = source._pointChildsData(node);
				if (key !== undefined) {
					receiver._data = obj[key];
				}
			},
		});
		node._subscribers.push({
			receiver: _parent,
			fetch: (source, receiver) => {
				const { obj, key } = receiver._pointChildsData(node);
				if (key !== undefined) {
					obj[key] = source._data;
				}
			},
		});
	}
}

/**
 * @typedef {{
 * render?: CallableFunction
 * } & SetComponentDataOptions} SetAnyComponentDataOptions
 */

/**
 * @param {BaseComponent} comp
 * @param {*} _data
 * @param {SetAnyComponentDataOptions} options
 */
function setComponentData(comp, _data = undefined, options = {}) {
	/** @type {AnyComponent} */
	// @ts-ignore
	const node = comp;

	if (_data !== undefined) {
		node._data = cloneObject(_data);
	}

	if (!node || node._data === undefined) {
		// garbage collector again?
		return;
	}

	const equal = isEquivalent(node._prev_data, node._data);

	if (equal && nonull(options.force_render, false) === false) {
		return;
	}

	if (options.render) {
		// it should be ezy to send what the changes are, the array handles it by itself which is weird, cause maybe it should be there?
		// array diff works fine, what about another helper methods though? object diff, idk
		options.render();
	}

	if (equal) {
		return;
	}

	node._prev_data = cloneObject(node._data);

	propagateComponentData(node);
}

/**
 * @param {BaseComponent} comp
 */
function propagateComponentData(comp) {
	/** @type {AnyComponent} */
	// @ts-ignore
	const node = comp;

	const subscribers = node._subscribers;
	if (subscribers) {
		for (let i = subscribers.length - 1; i >= 0; i--) {
			const subscribe = subscribers[i];
			if (document.body.contains(subscribe.receiver)) {
				subscribe.fetch(node, subscribe.receiver);
			} else {
				// remove subscriber reference - kinda lazy garbage collector
				subscribers.splice(i, 1);
			}
			subscribe.receiver._setData();
		}
	}

	if (node._bindNodes) {
		node._bindNodes.forEach((/** @type {AnyComponent} */ sub_node) => {
			const bind_var = sub_node.dataset.bind;

			if (sub_node.setValue) {
				sub_node.setValue(node._data[bind_var], { quiet: true });
			}
		});
	}
}

/**
 * @typedef {{
 * from: number,
 * to: number,
 * }} IndexChange
 *
 * @callback compareKeyCallback
 * @param {any} e
 * @returns {Array}
 */

/**
 *
 * @param {Array} arr_1
 * @param {Array} arr_2
 * @param {compareKeyCallback} getKey
 * @returns {IndexChange[]}
 */
function diffArrays(arr_1, arr_2, getKey) {
	if (!isArray(arr_1)) {
		arr_1 = [];
	}
	if (!isArray(arr_2)) {
		arr_2 = [];
	}

	let any_change = false;

	/** @type {IndexChange[]} */
	let diff = [];

	const keys_1 = arr_1.map(getKey);
	const keys_2 = arr_2.map(getKey);

	let index_1 = -1;
	for (const key_1 of keys_1) {
		index_1++;

		const index_2 = keys_2.indexOf(key_1);
		diff.push({ from: index_1, to: index_2 });
		if (index_1 !== index_2) {
			any_change = true;
		}
	}

	let index_2 = -1;
	for (const key_2 of keys_2) {
		index_2++;

		const index_1 = keys_1.indexOf(key_2);

		if (index_1 === -1) {
			// add
			diff.push({ from: index_1, to: index_2 });
			any_change = true;
		}
	}

	return any_change ? diff : [];
}

// not used
// /**
//  * @typedef {{
//  * added: string[],
//  * changed: string[],
//  * removed: string[],
//  * }} diffObjectResult
//  */

// /**
//  *
//  * @param {Object} obj_1
//  * @param {Object} obj_2
//  * @returns {diffObjectResult}
//  */
// function diffObjects(obj_1, obj_2) {
// 	if (!isObject(obj_1)) {
// 		obj_1 = {};
// 	}
// 	if (!isObject(obj_2)) {
// 		obj_2 = {};
// 	}

// 	/** @type {diffObjectResult} */
// 	let diff = {
// 		added: [],
// 		changed: [],
// 		removed: [],
// 	};

// 	for (const key_1 in obj_1) {
// 		const val_1 = obj_1[key_1];
// 		const val_2 = obj_2[key_1];

// 		if (val_2 === undefined) {
// 			diff.removed.push(key_1);
// 		} else if (val_1 !== val_2) {
// 			diff.changed.push(key_1);
// 		}
// 	}

// 	for (const key_2 in obj_2) {
// 		const val_1 = obj_1[key_2];

// 		if (val_1 === undefined) {
// 			diff.added.push(key_2);
// 		}
// 	}

// 	return diff;
// }
