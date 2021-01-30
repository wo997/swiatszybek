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
 * _changed_data?: object
 * _evaluables: {node?: PiepNode, eval_str: string}[]
 * _component_traits: ComponentTrait[]
 * } & PiepNode} BaseComponent
 *
 ** @typedef {{
 * _trait_def: ComponentTraitDefinition
 * } & PiepNode} ComponentTrait
 *
 * @typedef {{
 * force_render?: boolean
 * }} SetComponentDataOptions
 *
 * I'm not a fan of it but regular inheritance doesn't seem to work as expected os we assign common props in here
 * @typedef {{
 * _data: any
 * _set_data(data?: any, options?: SetComponentDataOptions)
 * _prev_data: any
 * _nodes: any
 * } & BaseComponent} AnyComponent
 *
 * @typedef {{
 * template?: string
 * initialize?()
 * setData(data: any, options: SetComponentDataOptions)
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

	node.classList.add("comp");
	node.classList.add("freeze");
	setTimeout(() => {
		node.classList.remove("freeze");
	}, 200);

	if (!!parent && !(parent instanceof HTMLElement)) {
		console.error("Parent is not a node!", parent);
		console.trace();
	}
	node.parent_component = parent;

	node._set_data = options.setData;

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

	node._evaluables = [];
	node._component_traits = [];

	if (options.template) {
		let template = options.template;
		const matches_e = template.match(/{{.*?}}/gm);
		if (matches_e) {
			for (const match of matches_e) {
				const content = match.substring(2, match.length - 2);
				const eval_str = content
					.replace(/@(?=\w)/g, `node._data.`)
					.replace(/@/g, `node._data`);
				node._evaluables.push({
					eval_str,
				});
				const node_html = `<span class='evaluable_${
					node._evaluables.length - 1
				}'></span>`;
				template = template.replace(match, node_html);
			}
		}

		node._set_content(template);

		let index = -1;
		for (const evaluable of node._evaluables) {
			index++;
			evaluable.node = node._child(`.evaluable_${index}`);
		}

		for (const trait of node._children("p-batch-trait")) {
			const trait_name = trait.dataset.trait;

			const trait_html = component_batch_traits[trait_name];
			if (trait_html) {
				trait.insertAdjacentHTML("afterend", trait_html);
			}
			trait.remove();
		}

		for (const trait of node._children("p-trait")) {
			const trait_name = trait.dataset.trait;

			/** @type {ComponentTraitDefinition} */
			const trait_def = component_traits[trait_name];
			if (trait_def) {
				/** @type {ComponentTrait} */
				// @ts-ignore
				const trait_node = createNodeFromHtml(trait_def.template);
				trait_node._trait_def = trait_def;
				trait._parent().insertBefore(trait_node, trait);
				trait.remove();
				node._component_traits.push(trait_node);
			}
		}

		directComps(node).forEach((comp) => {
			const constructor = snakeCase(comp.tagName.toLocaleLowerCase());
			if (window[constructor]) {
				//console.log(node, constructor, "xxx");
				// @ts-ignore
				window[constructor](comp, node, undefined, {});
			}
		});
	}

	node._nodes = {};
	node._children(`[data-node]`).forEach((n) => {
		node._nodes[n.dataset.node] = n;
	});

	// kinda weird but it creates f.e. checkbox base component
	registerForms();

	node._bindNodes = node._children(`[data-bind]`);

	if (options.initialize) {
		options.initialize();
	}

	node._component_traits.forEach((trait) => {
		if (trait._trait_def.initialize) {
			trait._trait_def.initialize(node);
		}
	});

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
						node._set_data();
					}
				}
			});
			sub_node.addEventListener("input", () => {
				sub_node._dispatch_change();
			});
		}
	});

	if (data !== undefined) {
		node._set_data(data);
	}

	if (parent) {
		parent._subscribers.push({
			receiver: node,
			fetch: (
				/** @type {AnyComponent} */ source,
				/** @type {AnyComponent} */ receiver
			) => {
				const x = source._pointChildsData(node);
				if (x) {
					const { obj, key } = x;
					if (key !== undefined) {
						receiver._data = obj[key];
					}
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

	// just for optimization
	const equal = isEquivalent(node._prev_data, node._data);

	if (equal && def(options.force_render, false) === false) {
		return;
	}

	if (isObject(node._data)) {
		node._changed_data = {};
		for (const [key, value] of Object.entries(node._data)) {
			if (
				!node._prev_data ||
				!isEquivalent(def(node._prev_data[key], undefined), value)
			) {
				node._changed_data[key] = true;
			}
		}
	}

	if (options.render) {
		options.render();

		node._component_traits.forEach((trait) => {
			if (trait._trait_def.render) {
				trait._trait_def.render(node);
			}
		});
	}

	for (const evaluable of node._evaluables) {
		evaluable.node._set_content(eval(evaluable.eval_str));
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

	if (node._bindNodes) {
		node._bindNodes.forEach((/** @type {AnyComponent} */ sub_node) => {
			const bind_var = sub_node.dataset.bind;

			if (sub_node._set_value && node._changed_data[bind_var]) {
				sub_node._set_value(node._data[bind_var], { quiet: true });
			}
		});
	}

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
			receiver._set_data();
		}
	}
}
