/* js[global] */

/**
 * @typedef {{
 * fetch(source: BaseComponent, receiver: BaseComponent)
 * receiver: BaseComponent
 * }} SubscribeToData
 *
 * @typedef {{
 * obj: any
 * key: any
 * }} ObjectData
 *
 * @typedef {{
 * _bindNodes: PiepNode[]
 * parent_component?: AnyComponent
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
 * @param {*} data
 * @param {createComponentOptions} options
 * */
function createComponent(comp, parent_comp, data, options) {
	/** @type {AnyComponent} */
	// @ts-ignore
	const node = comp;

	/** @type {AnyComponent} */
	// @ts-ignore
	const parent = parent_comp;

	//node.classList.add("component");

	if (!!parent && !(parent instanceof HTMLElement)) {
		console.error("Parent is not a node!", parent);
		console.trace();
	}
	node.parent_component = parent;

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
		node._set_content(options.template);
	}

	node._nodes = {};
	node._children(`[data-node]`).forEach((n) => {
		node._nodes[n.dataset.node] = n;
	});

	if (options.initialize) {
		options.initialize();
	}

	// kinda weird but it creates the checkbox subcomponent
	registerForms();

	node._bindNodes = node._children(`[data-bind]`);

	node._bindNodes.forEach((/** @type {AnyComponent} */ sub_node) => {
		const bind_var = sub_node.dataset.bind;
		sub_node._bind_var = bind_var;

		if (sub_node._get_value() !== undefined) {
			// a weird way to tell if something should actually have a set or get value, I think that piepquery should be responsible for that
			sub_node.addEventListener("change", () => {
				let sub_node_data = sub_node._get_value();

				if (sub_node_data !== undefined) {
					if (node._data[bind_var] !== undefined) {
						node._data[bind_var] = sub_node_data;
						node._setData();
					}
				}
			});
			sub_node.addEventListener("input", () => {
				sub_node._dispatch_change();
			});
		}
	});

	if (data !== undefined) {
		node._setData(data);
	}

	if (parent) {
		parent._subscribers.push({
			receiver: node,
			fetch: (
				/** @type {AnyComponent} */ source,
				/** @type {AnyComponent} */ receiver
			) => {
				const { obj, key } = source._pointChildsData(node);
				if (key !== undefined) {
					receiver._data = obj[key];
				}
			},
		});
		node._subscribers.push({
			receiver: parent,
			fetch: (
				/** @type {AnyComponent} */ source,
				/** @type {AnyComponent} */ receiver
			) => {
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

	if (equal && def(options.force_render, false) === false) {
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
			if (subscribe.receiver._in_body()) {
				subscribe.fetch(node, subscribe.receiver);
			} else {
				// remove subscriber reference - kinda lazy garbage collector
				subscribers.splice(i, 1);
			}
			/** @type {AnyComponent} */
			// @ts-ignore
			const receiver = subscribe.receiver;
			receiver._setData();
		}
	}

	if (node._bindNodes) {
		node._bindNodes.forEach((/** @type {AnyComponent} */ sub_node) => {
			const bind_var = sub_node.dataset.bind;

			if (sub_node._set_value) {
				sub_node._set_value(node._data[bind_var], { quiet: true });
			}
		});
	}
}
