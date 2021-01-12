/* js[view] */

domload(() => {
	/** @type {FirstComponent} */
	// @ts-ignore
	const my_list_node = $(".my_component");

	// todo? prevent setting data on creation but do it when all components are ready
	// there was an issue with the list, it need to be set once
	// that's weird but animations suck a little bit as we set data to nothing in that case, they should be instant anyway
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

	// both work well
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

// bad naming of a component

/**
 * @typedef {{
 * email: string
 * } & ListComponentRowData} ListRowComponentData
 *
 * @typedef {{
 * _data: ListRowComponentData
 * _prev_data: ListRowComponentData
 * _setData(data?: ListRowComponentData, options?: SetComponentDataOptions)
 * _getData()
 * _nodes: {
 *  idk: PiepNode
 *  delete_btn: PiepNode
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
		create_template: () => {
			node.setContent(/*html*/ `
                <span data-node="row_index"></span>.
                <input type="text" class="field inline" data-bind="email">
                rewrite inputs
                <input type="text" class="field inline" data-bind="email">
        
                <button data-node="delete_btn" class="btn red">Delete (<span data-bind="row_index" data-type="html"></span>)</button>
        
                <div data-node="idk"></div>
            `);
		},
		initialize: () => {
			node.classList.add("my_list_row");
			node._setData = (data = undefined, options = {}) => {
				setComponentData(node, data, {
					...options,
					render: () => {
						node._nodes.idk.setContent(JSON.stringify(node._data));
						if (node._data.row_index !== undefined) {
							// hmm, type hinting doesnt seem to work here cause we expect the parent to be present
							node._nodes.row_index.setContent(
								"-".repeat(node._data.row_index) + node._data.row_index
							);
						}
					},
				});
			};

			node._nodes.delete_btn.addEventListener("click", () => {
				// we can also modify the data, but that is waaay simpler
				if (parent._removeRow) {
					parent._removeRow(node);
				}
			});
		},
	});
}

// list component will be reusable

/**
 * @typedef {{
 * row_index?: number
 * }} ListComponentRowData
 */

/**
 * @typedef {{
 * _data: Array
 * _prev_data: Array
 * _setData(data?: Array, options?: SetComponentDataOptions)
 * _getData()
 * _nextRowId: number
 * _removeRow(child: BaseComponent)
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
			node._nextRowId = -1000;

			node.classList.add("my_list");

			node._getRows = () => {
				/** @type {AnyComponent[]} */
				// @ts-ignore
				const res = node.directChildren(":not(.removing)");
				return res;
			};

			// these functions need to be specified here because the child might not know who we are :*
			node._fetchDataFromChild = (source, receiver) => {
				let receiver_sub_data_index = receiver._data.findIndex((e) => {
					return e._row_id === source._data._row_id;
				});
				if (receiver_sub_data_index !== -1) {
					receiver._data[receiver_sub_data_index] = cloneObject(source._data);
				}
			};

			node._sendDataToChild = (source, receiver) => {
				let source_sub_data_index = source._data.findIndex((e) => {
					return e._row_id === receiver._data._row_id;
				});
				if (source_sub_data_index !== -1) {
					receiver._data = cloneObject(source._data[source_sub_data_index]);
				}
			};

			node._setData = (_data = undefined, options = {}) => {
				if (_data === undefined) {
					_data = node._data;
				}

				_data.forEach((row_data, index) => {
					if (row_data._row_id === undefined) {
						row_data._row_id = node._nextRowId--;
					}
					row_data.row_index = index + 1;
				});

				setComponentData(node, _data, {
					...options,
					render: () => {
						const diff = diffArrays(
							node._prev_data,
							node._data,
							(e) => e._row_id
						);
						//console.log(diff);
						// console.log(
						// 	"render",
						// 	diff,
						// 	JSON.stringify(node._prev_data, undefined, 3),
						// 	JSON.stringify(node._data, undefined, 3)
						// );
						// console.log(
						// 	diff,
						// 	node._prev_data ? node._prev_data.length : 0,
						// 	node._data.length
						// );

						const animation_duration = 250;

						let child_index = -1;
						const remember_nodes_to_remove = node._getRows().filter(() => {
							child_index++;
							return diff.removed.includes(child_index);
						});

						diff.added.forEach((data_id) => {
							const row_data = node._data[data_id];

							/** @type {AnyComponent} */
							// @ts-ignore
							const child = createNodeFromHtml(/*html*/ `
                                <div class="my_list_row_wrapper expand_y hidden animate_hidden">
                                    <div class="my_list_row"></div>
                                </div>
                            `);

							// TODO: find the actual place where you want to put it
							node.insertBefore(child, node.children[data_id]);

							const the_row = child.find(".my_list_row");

							createRowCallback(the_row, node, row_data, {});

							expand(child, true, { duration: animation_duration });
						});

						remember_nodes_to_remove.forEach((child) => {
							expand(child, false, { duration: animation_duration });
							child.classList.add("removing");
							setTimeout(() => {
								child.remove();
							}, animation_duration);
						});

						diff.moved.forEach(({ from, to }) => {
							//console.log(from, to);
						});
					},
				});
			};

			node._removeRow = (child) => {
				/** @type {AnyComponent} */
				// @ts-ignore
				const comp = child;
				const remove_index = node._data.findIndex((d) => {
					return d._row_id === comp._data._row_id;
				});
				if (remove_index !== -1) {
					node._data.splice(remove_index, 1);
					node._setData();
				}
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
		create_template: () => {
			node.setContent(/*html*/ `
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

                    <h3>List copied looool (currently hidden)</h3>
                    <div style="display:flex">
                        <div data-node="my_list_copy" data-bind="list_data"></div>
                    </div>

                    <h3>Example of standalone list row, dumb but we can do it</h3>
                    <div data-node="list_row" data-bind="list_row"></div>

                    <h3>Display form json</h3>
                    <div data-node="crazy"></div>
                </div>
            `);
		},
		initialize: () => {
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

// things below will be just a library, reusable

/**
 * @typedef {{
 * fetch(source: AnyComponent, receiver: AnyComponent)
 * receiver: AnyComponent
 * }} SubscribeToData
 */

/**
 * @typedef {{
 * _bindNodes: PiepNode[]
 * _parent_component: any
 * _referenceParent: CallableFunction
 * _sendDataToChild(source: AnyComponent, receiver: AnyComponent)
 * _fetchDataFromChild(source: AnyComponent, receiver: AnyComponent)
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
 * _getData()
 * _prev_data: any
 * _data_ref: any
 * _nodes: any
 * } & BaseComponent} AnyComponent
 *
 * @typedef {{
 * create_template?()
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

	node.classList.add("component");

	if (!!_parent && !(_parent instanceof HTMLElement)) {
		console.error("Parent is not a node!", _parent);
		console.trace();
	}
	node._parent_component = _parent;

	node._subscribers = [];

	node._getData = () => {
		// kinda useless now but let's keep it
		return node._data;
	};

	if (!node._fetchDataFromChild) {
		node._fetchDataFromChild = (source, receiver) => {
			const bind_var = source.dataset.bind;
			if (bind_var) {
				/*console.log(
					"_fetchDataFromChild r:",
					receiver,
					"s:",
					source,
					"b:",
					bind_var,
					"d:",
					receiver._data,
					"new data:",
					cloneObject(source._data)
				);*/
				receiver._data[bind_var] = cloneObject(source._data);
				//console.log("HEYYYY", receiver, cloneObject(receiver._data));
				//console.log(receiver, receiver._data, bind_var);
			}
		};
	}

	if (!node._sendDataToChild) {
		node._sendDataToChild = (source, receiver) => {
			const bind_var = receiver.dataset.bind;
			if (bind_var) {
				//console.log("_sendDataToChild", receiver, source);
				receiver._data = cloneObject(source._data[bind_var]);
				//console.log(receiver, receiver._data, bind_var);
			}
		};
	}

	if (options.create_template) {
		options.create_template();
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

	node._setData(_data);

	if (_parent) {
		_parent._subscribers.push({
			receiver: node,
			fetch: _parent._sendDataToChild,
		});
		node._subscribers.push({
			receiver: _parent,
			fetch: _parent._fetchDataFromChild,
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
 * }} AnyChange
 *
 * @typedef {{
 * added: Array,
 * moved: AnyChange[],
 * removed: Array,
 * }} diffArrayResult
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
 * @returns {diffArrayResult}
 */
function diffArrays(arr_1, arr_2, getKey) {
	if (!isArray(arr_1)) {
		arr_1 = [];
	}
	if (!isArray(arr_2)) {
		arr_2 = [];
	}

	/** @type {diffArrayResult} */
	let diff = {
		added: [],
		moved: [],
		removed: [],
	};

	const keys_1 = arr_1.map(getKey);
	const keys_2 = arr_2.map(getKey);

	let index_1 = -1;
	for (const key_1 of keys_1) {
		index_1++;

		const index_2 = keys_2.indexOf(key_1);

		if (index_2 === -1) {
			diff.removed.push(index_1);
		} else if (index_1 !== index_2) {
			diff.moved.push({
				from: index_1,
				to: index_2,
			});
		}
	}

	let index_2 = -1;
	for (const key_2 of keys_2) {
		index_2++;

		const index_1 = keys_1.indexOf(key_2);

		if (index_1 === -1) {
			diff.added.push(index_2);
		}
	}

	return diff;
}

/**
 * @typedef {{
 * added: string[],
 * changed: string[],
 * removed: string[],
 * }} diffObjectResult
 */

/**
 *
 * @param {Object} obj_1
 * @param {Object} obj_2
 * @returns {diffObjectResult}
 */
function diffObjects(obj_1, obj_2) {
	if (!isObject(obj_1)) {
		obj_1 = {};
	}
	if (!isObject(obj_2)) {
		obj_2 = {};
	}

	/** @type {diffObjectResult} */
	let diff = {
		added: [],
		changed: [],
		removed: [],
	};

	for (const key_1 in obj_1) {
		const val_1 = obj_1[key_1];
		const val_2 = obj_2[key_1];

		if (val_2 === undefined) {
			diff.removed.push(key_1);
		} else if (val_1 !== val_2) {
			diff.changed.push(key_1);
		}
	}

	for (const key_2 in obj_2) {
		const val_1 = obj_1[key_2];

		if (val_1 === undefined) {
			diff.added.push(key_2);
		}
	}

	return diff;
}
