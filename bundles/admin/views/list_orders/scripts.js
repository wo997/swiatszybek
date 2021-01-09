/* js[view] */

domload(() => {
	/** @type {FirstComponent} */
	// @ts-ignore
	const my_list_node = $(".my_component");

	createFirstCompontent(my_list_node, undefined, {
		id: 5,
		name: "asdsad",
		state: 1,
		list_data: [{ email: "wojtekwo997@gmail.com" }, { email: "peniz" }],
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
 * _setData(data?: ListRowComponentData, options?: *)
 * _getData()
 * _idkNode: PiepNode
 * } & BaseComponent} ListRowComponent
 */

/**
 * @param {ListRowComponent} node
 * @param {PiepNode} parent
 * @param {ListRowComponentData} data
 */
function createListRowCompontent(node, parent, data = undefined) {
	if (data === undefined) {
		data = { email: "" };
	}

	node.setContent(/*html*/ `
        <input type="text" class="field" data-bind="email">
        <div class="idk"></div>
    `);

	node._setData = (data = undefined, options = {}) => {
		setComponentData(node, data, options, () => {
			node._idkNode.setContent(JSON.stringify(node._data));
		});
	};

	node._idkNode = node.find(".idk");

	extendBaseComponent(node, parent);

	node._setData(data);
}

/**
 * @typedef {{
 * _data: any
 * } & PiepNode} ListRow

 * @typedef {{
 * _data: Array
 * _prev_data: Array
 * _setData(data?: Array, options?: *)
 * _getData()
 * _nextRowId: number
 * } & BaseComponent} ListComponent
 */

/**
 * @param {ListComponent} node
 * @param {PiepNode} parent
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

	node._nextRowId = -1;

	node._setData = (data = undefined, options = {}) => {
		const assignRowIds = () => {
			if (node._data) {
				node._data.forEach((e) => {
					if (e.row_id === undefined) {
						node._nextRowId++;
						e.row_id = node._nextRowId;
						if (e._setData) {
							e._setData();
						}
					}
				});
			}
		};

		setComponentData(node, data, options, () => {
			/*console.log(
                "before",
                JSON.stringify(node._prev_data),
                JSON.stringify(node._data)
            );*/

			/*console.log(
                "after",
                JSON.stringify(node._prev_data),
                JSON.stringify(node._data)
            );*/

			//assignRowIds();

			//console.log(data);
			const diff = diffArrays(node._prev_data, node._data, (e) => e.row_id);

			//console.log(diff);

			diff.added.forEach((data_id) => {
				const row_data = node._data[data_id];

				/** @type {ListRow} */
				// @ts-ignore
				const my_list_row = createNodeFromHtml(/*html*/ `
                <div class="my_list_row"></div>
            `);

				node.appendChild(my_list_row);

				createRowCallback(my_list_row, parent, row_data);
			});

			assignRowIds();

			let child_index = -1;
			node
				.directChildren()
				.filter((/** @type {ListRow} */ node) => {
					child_index++;
					return diff.removed.includes(child_index);
				})
				.forEach((/** @type {ListRow} */ node) => {
					node.remove();
				});
		});
	};

	// basically empty when created
	//node.setContent();

	extendBaseComponent(node, parent);

	node._setData(data);
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
 * _setData(data?: FirstComponentData, options?: *)
 * _getData()
 * _crazy: PiepNode
 * _my_list: ListComponent
 * _saved_data: FirstComponentData
 * _load_btn: PiepNode
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

            <h3>Some state </h3>
            <checkbox data-bind="state"></checkbox>
            <br>

            <h3>Fancy stuff</h3>
            <div class="crazy"></div>

            <h3>We can even have a list! <span class="list_count"></span> <button class="add btn primary">Add a new row!</button></h3>
            <div class="expand_y">
                <div class="my_list" data-bind="list_data"></div>
            </div>
        </div>
    `);

	node._setData = (data = undefined, options = {}) => {
		setComponentData(node, data, options, () => {
			node._crazy.setContent(`
                This string was generated by the compontent ${JSON.stringify(
									node._data
								)}
            `);

			expand(node._expand_y, node._data.state === 1);

			const equivalent = isEquivalent(node._data, node._saved_data);
			const disable = !node._saved_data || equivalent;
			toggleDisabled(node._load_btn, disable);
			//node._load_btn.classList.toggle("disabled", equivalent);
			//console.log(equivalent);

			node._list_count.setContent(`(${node._data.list_data.length})`);
		});
	};

	/** @type {ListComponent} */
	// @ts-ignore
	const my_list = node.find(".my_list");
	createListCompontent(my_list, node, createListRowCompontent);
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

	extendBaseComponent(node, parent);

	node._setData(data);
}

/**
 * @typedef {{
 * _bindNodes: PiepNode[]
 * _parent: any
 * } & PiepNode} BaseComponent
 *
 * @typedef {{
 * _data: any
 * _setData(data?: any, options?: *)
 * _getData()
 * _prev_data: any
 * } & BaseComponent} BaseComponentEmpty
 */

/**
 * @param {BaseComponentEmpty} node
 * @param {PiepNode} parent
 * */
function extendBaseComponent(node, parent) {
	node.classList.add("component");

	/*if (!!parent && !parent.classList.contains("component")) {
		console.error("Parent is not a component!", parent.outerHTML);
		console.trace();
    }*/
	if (!!parent && !(parent instanceof HTMLElement)) {
		console.error("Parent is not a node!", parent);
		console.trace();
	}
	node._parent = parent;

	// kinda weird but it creates the checkbox subcomponent
	registerForms();

	node._bindNodes = node.findAll(`[data-bind]`);
	node._bindNodes.forEach((sub_node) => {
		sub_node.addEventListener("change", () => {
			const name = sub_node.dataset.bind;
			if (name === undefined) {
				return;
			}

			let sub_node_data = undefined;
			if (sub_node._getData) {
				sub_node_data = sub_node._getData();
			} else if (sub_node.getValue) {
				sub_node_data = sub_node.getValue();
			}

			if (sub_node_data !== undefined) {
				if (node._setData) {
					node._data[name] = sub_node_data;
					node._setData(undefined); //, { quiet: true });
				} else if (node.setValue) {
					node._data[name] = sub_node_data;
					node.setValue(undefined); //, { quiet: true });
				}
			}
		});
		sub_node.addEventListener("input", () => {
			sub_node.dispatchChange();
		});
	});

	node._getData = () => {
		return node._data;
	};
}

/**
 * @param {BaseComponentEmpty} node
 * @param {*} data
 * @param {*} options
 * @param {CallableFunction} callback
 */
function setComponentData(
	node,
	data = undefined,
	options = {},
	callback = null
) {
	if (data === undefined) {
		data = node._data;
	} else {
		node._data = cloneObject(data);
	}

	node._bindNodes.forEach((e) => {
		const name = e.dataset.bind;
		if (name === undefined) {
			return;
		}
		const value = data[name];
		if (value === undefined) {
			return;
		}

		if (e.setValue) {
			e.setValue(value, { quiet: true });
		}
		// temporary, decide on what u wanna stick to, value or data
		if (e._setData) {
			//e._setData(cloneObject(value));
			e._setData(value, { quiet: true });
		}
	});

	if (callback) {
		callback();
	}

	node._prev_data = cloneObject(node._data);

	if (!options.quiet) {
		node.dispatchChange();
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
