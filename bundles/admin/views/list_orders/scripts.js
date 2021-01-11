/* js[view] */

domload(() => {
	/** @type {FirstComponent} */
	// @ts-ignore
	const my_list_node = $(".my_component");

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
	// });

	createFirstCompontent(my_list_node, undefined, {
		id: 5,
		name: "asdsad",
		state: 1,
		list_data: [
			{ email: "wojtekwo997@gmail.com" },
			{ email: "pies@pies.pies" },
			{ email: "111" },
		],
	});
});

/**
 * @typedef {{
 * email: string
 * }} ListRowComponentData
 *
 * @typedef {{
 * _data: ListRowComponentData
 * _prev_data: ListRowComponentData
 * _setData(data?: ListRowComponentData)
 * _getData()
 * _idkNode: PiepNode
 * } & BaseComponent} ListRowComponent
 */

/**
 * @param {ListRowComponent} node
 * @param {ListComponent} parent
 * @param {ListRowComponentData} data
 */
function createListRowCompontent(node, parent, data = undefined) {
	if (data === undefined) {
		data = { email: "" };
	}

	node._name = "list_row";

	node.setContent(/*html*/ `
        <span data-bind="_row_id" data-type="html"></span>
        <input type="text" class="field inline" data-bind="email">
        rewrite inputs
        <input type="text" class="field inline" data-bind="email">

        <button class="delete btn red">Delete</button>

        <div class="idk"></div>
    `);

	node._setData = (data = undefined) => {
		setComponentData(node, data, {
			callback: () => {
				node._idkNode.setContent(JSON.stringify(node._data));
			},
		});
	};

	node._idkNode = node.find(".idk");

	const delete_btn = node.find(".delete");
	delete_btn.addEventListener("click", () => {
		// we can also modify the data, but that is waaay simpler
		parent._removeRow(node);
	});

	extendBaseComponent(node, parent, data);
}

// list component will be reusable

/**
 * @typedef {{
 * _data: Array
 * _prev_data: Array
 * _setData(data?: Array)
 * _getData()
 * _nextRowId: number
 * _removeRow(child: BaseComponent)
 * } & BaseComponent} ListComponent
 */

/**
 * @param {ListComponent} node
 * @param {BaseComponent} parent
 * @param {CallableFunction} createRowCallback
 * @param {Array} data
 */
function createListCompontent(
	node,
	parent,
	createRowCallback,
	data = undefined
) {
	if (data === undefined) {
		data = [];
	}

	node._name = "list";

	node._nextRowId = -1;

	const getRows = () => {
		return node.directChildren(":not(.removing)");
	};

	node._referenceSelf = (/** @type {AnyComponent} */ child) => {
		if (child._data._row_id === undefined) {
			return;
		}
		const data = child._parent_component._data.find((e) => {
			return e._row_id === child._data._row_id;
		});
		if (data !== undefined) {
			child._data = data;
			console.log("hahaha", child, data);
		}
	};

	const assignRowIds = () => {
		if (node._data) {
			let child_index = -1;
			node._data.forEach((e) => {
				child_index++;
				if (e._row_id === undefined) {
					node._nextRowId++;
					e._row_id = node._nextRowId;

					const child = getRows()[child_index];
					if (child !== undefined) {
						/** @type {AnyComponent} */
						// @ts-ignore
						const my_list_row = child.find(".my_list_row");

						if (my_list_row._setData) {
							my_list_row._setData();
						}
					}
				}
			});
		}
	};

	node._setData = (data = undefined) => {
		setComponentData(node, data, {
			callback: () => {
				const diff = diffArrays(node._prev_data, node._data, (e) => e._row_id);
				/*console.log(
					diff,
					JSON.stringify(node._prev_data, undefined, 3),
					JSON.stringify(node._data, undefined, 3)
				);*/

				const animation_duration = 250;

				let child_index = -1;
				const remember_nodes_to_remove = getRows().filter(() => {
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

					createRowCallback(the_row, node, row_data);

					expand(child, true, { duration: animation_duration });
				});

				assignRowIds();
				remember_nodes_to_remove.forEach((child) => {
					expand(child, false, { duration: animation_duration });
					child.classList.add("removing"); // .removing -> style.pointerEvents = "none";
					setTimeout(() => {
						child.remove();
					}, animation_duration);
				});

				// [...diff.added, ...diff.moved.map((e) => e.to)].forEach((pos) => {
				// 	console.log(pos);
				// });
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

	extendBaseComponent(node, parent, data);
}

/**
 * @typedef {{
 * id: number
 * name: string
 * state: number
 * list_data: ListRowComponentData[]
 * }} FirstComponentData
 *
 * @typedef {{
 * _data: FirstComponentData
 * _prev_data: FirstComponentData
 * _setData(data?: FirstComponentData)
 * _getData()
 * _crazy: PiepNode
 * _my_list: ListComponent
 * _saved_data: FirstComponentData
 * _load_btn: PiepNode
 * _save_btn: PiepNode
 * _list_count: PiepNode
 * _expand_y: PiepNode
 * } & BaseComponent} FirstComponent
 */

/**
 * @param {FirstComponent} node
 * @param {*} parent
 * @param {FirstComponentData} data
 */
function createFirstCompontent(node, parent, data = undefined) {
	if (data === undefined) {
		data = { id: -1, name: "", state: 0, list_data: [] };
	}

	node._name = "first";

	node.setContent(/*html*/ `
        <div>
            <h3>
                Save state of the component
                <button class="save btn primary">Save</button>
                <button class="load btn primary">Load</button>
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

            <h3>We can even have a list! <span class="list_count"></span> <button class="add btn primary">Add a new row!</button></h3>
            <div class="expand_y">
                <div class="my_list" data-bind="list_data"></div>
            </div>

            <h3>Display form json</h3>
            <div class="crazy"></div>
        </div>
    `);

	node._setData = (data = undefined) => {
		setComponentData(node, data, {
			callback: () => {
				node._crazy.setContent(`
                This string was generated by the compontent
                ${JSON.stringify(node._data, null, 3)}
                `);

				expand(node._expand_y, node._data.state === 1);

				const equivalent = isEquivalent(node._data, node._saved_data);
				const disable = !node._saved_data || equivalent;
				toggleDisabled(node._load_btn, disable);
				toggleDisabled(node._save_btn, equivalent);

				node._list_count.setContent(`(${node._data.list_data.length})`);
			},
		});
	};

	/** @type {ListComponent} */
	// @ts-ignore
	const my_list = node.find(".my_list");
	createListCompontent(my_list, node, createListRowCompontent, data.list_data);
	node._my_list = my_list;

	node._crazy = node.find(".crazy");

	const add = node.find(".add");
	add.addEventListener("click", () => {
		my_list._data.push(
			/** @type {ListRowComponentData} */ { email: "- pustka -" }
		);
		my_list._setData();
	});

	const save = node.find(".save");
	save.addEventListener("click", () => {
		node._saved_data = cloneObject(node._data);
		node._setData();
	});

	node._load_btn = node.find(".load");
	node._load_btn.addEventListener("click", () => {
		node._data = cloneObject(node._saved_data);
		node._setData();
	});

	node._list_count = node.find(".list_count");

	node._expand_y = node.find(".expand_y");

	node._save_btn = node.find(".save");

	extendBaseComponent(node, parent, data);
}

// things below will be just a library, reusable

/**
 * @typedef {{
 * fetch(target: AnyComponent, _data: any)
 * target: AnyComponent
 * }} SubscribeToData
 */

/**
 * @typedef {{
 * _name: string
 * _bindNodes: PiepNode[]
 * _parent_component: any
 * _referenceParent: CallableFunction
 * _referenceSelf: CallableFunction
 * _addSubscriber(subscribe: SubscribeToData)
 * _subscribers: SubscribeToData[]
 * } & PiepNode} BaseComponent
 *
 * I'm not a fan of it but regular inheritance doesn't seem to work as expected os we assign common props in here
 * @typedef {{
 * _data: any
 * _setData(data?: any)
 * _getData()
 * _prev_data: any
 * _data_ref: any
 * } & BaseComponent} AnyComponent
 */

// /**
//  * @param {AnyComponent} comp_a
//  * @param {AnyComponent} comp_b
//  * @param {{(AnyComponent): any}} ref_a
//  * @param {{(AnyComponent): any}} ref_b
//  */
// function bindData(comp_a, comp_b, ref_a, ref_b) {
// 	comp_a._subscribers.push({
// 		target: comp_b,
// 		fetch: () => {
// 			let data_a = ref_a(comp_a);
// 			let data_b = ref_b(comp_b);
// 			data_a = data_b;
// 		},
// 	});
// 	comp_b._subscribers.push({
// 		target: comp_a,
// 		fetch: () => {
// 			let data_b = ref_b(comp_b);
// 			let data_a = ref_a(comp_a);
// 			data_b = data_a;
// 		},
// 	});
// 	//comp_a._setData(undefined, { force_propagate: true })
// 	//comp_b._setData(undefined, { force_propagate: true })

// 	// we actaully dont wanna _setData, only propagation is required
// 	propagateComponentData(comp_a);
// 	propagateComponentData(comp_b);
// }

/**
 * @param {BaseComponent} comp
 * @param {BaseComponent} parent_comp
 * @param {*} data
 * */
function extendBaseComponent(comp, parent_comp, data) {
	/** @type {AnyComponent} */
	// @ts-ignore
	const node = comp;

	/** @type {AnyComponent} */
	// @ts-ignore
	const parent = parent_comp;

	node.classList.add("component");

	// kinda weird but it creates the checkbox subcomponent
	registerForms();

	//console.log(node, data);

	/*if (!!parent && !parent.classList.contains("component")) {
		console.error("Parent is not a component!", parent.outerHTML); // was too early to call
		console.trace();
    }*/
	if (!!parent && !(parent instanceof HTMLElement)) {
		console.error("Parent is not a node!", parent);
		console.trace();
	}
	node._parent_component = parent;

	node._subscribers = [];

	/*node._addSubscriber = (subscribe) => {
		node._subscribers.push(subscribe);
		//node._setData(undefined, { force_propagate: true });
		setComponentData(node, undefined, { force_propagate: true });
	};*/

	// should we care about them? probably no since we have subscribers
	node._bindNodes = node.findAll(`[data-bind]`);

	node._bindNodes.forEach((/** @type {AnyComponent} */ sub_node) => {
		const bind_var = sub_node.dataset.bind;

		if (sub_node._data) {
			node._subscribers.push({
				target: sub_node,
				fetch: (target, _data) => {
					target._data = _data[bind_var];
				},
			});
			sub_node._subscribers.push({
				target: node,
				fetch: (target, _data) => {
					target._data[bind_var] = _data;
				},
			});
		} else if (sub_node.getValue) {
			sub_node.addEventListener("change", () => {
				let sub_node_data = sub_node.getValue();

				if (sub_node_data !== undefined) {
					if (node._data[bind_var] !== undefined)
						node._data[bind_var] = sub_node_data;

					node._setData();
				}
			});
			sub_node.addEventListener("input", () => {
				sub_node.dispatchChange();
			});
		}
	});

	node._getData = () => {
		return node._data;
	};

	// if (node._referenceParent === undefined) {
	// 	node._referenceParent = () => {
	// 		if (node._parent_component && node._parent_component._referenceSelf) {
	// 			// only arrays are... arrays ;)
	// 			//console.log(parent._name);
	// 			/*if (parent._data === "list") {
	//                 }*/
	// 			console.log("wow", node);
	// 			parent._referenceSelf(node);
	// 		} else {
	// 			if (!node._parent_component || !node._parent_component._data) {
	// 				return;
	// 			}
	// 			//console.log(node._parent_component, node._parent_component._data);
	// 			const our_data_in_parent =
	// 				node._parent_component._data[node.dataset.bind];
	// 			if (our_data_in_parent !== undefined) {
	// 				node._data = our_data_in_parent;
	// 			}
	// 		}
	// 	};
	// }

	node._setData(data);

	setTimeout(() => {
		propagateComponentData(node);
	});
}

/**
 * @typedef {{
 * callback?: CallableFunction
 * }} SetComponentDataOptions
 */

/**
 * @param {BaseComponent} comp
 * @param {*} _data
 * @param {SetComponentDataOptions} options
 */
function setComponentData(comp, _data = undefined, options = {}) {
	/** @type {AnyComponent} */
	// @ts-ignore
	const node = comp;

	if (_data !== undefined) {
		node._data = _data;
	}

	const equal = isEquivalent(node._prev_data, node._data);

	if (equal) {
		return;
	}

	if (options.callback) {
		options.callback();
	}

	node._prev_data = cloneObject(node._data);

	propagateComponentData(node);
}

/**
 * @param {AnyComponent} node
 */
function propagateComponentData(node) {
	if (node._subscribers) {
		node._subscribers.forEach((subscribe) => {
			subscribe.fetch(subscribe.target, cloneObject(node._data));
			subscribe.target._setData();
		});
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
 * }} movedKey
 */

/**
 * @typedef {{
 * added: Array,
 * moved: movedKey[],
 * removed: Array,
 * }} diffArrayResult
 */

/**
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
