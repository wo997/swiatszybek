/* js[global] */

/**
 * @typedef {{
 * fetch(source: BaseComp, receiver: BaseComp)
 * receiver: BaseComp
 * }} SubscribeToData
 *
 * @typedef {{
 * what: string
 * where: string
 * }} PassListData
 *
 * @typedef {{
 * obj: any
 * key: any
 * }} ObjectData
 *
 * @typedef {{
 * _bindNodes: PiepNode[]
 * _parent_comp?: AnyComp
 * _referenceParent: CallableFunction
 * _pointChildsData(child: AnyComp): ObjectData
 * _addSubscriber(subscribe: SubscribeToData)
 * _subscribers: SubscribeToData[]
 * _bind_var?: string
 * _changed_data?: object
 * _eval_html: {node?: PiepNode, eval_str: string}[]
 * _eval_class: {node: PiepNode, eval_str: string, className: string}[]
 * _comp_traits: CompTrait[]
 * } & PiepNode} BaseComp
 *
 ** @typedef {{
 * _trait_def: CompTraitDefinition
 * } & PiepNode} CompTrait
 *
 * @typedef {{
 * force_render?: boolean
 * pass_list_data?: PassListData[]
 * }} SetCompDataOptions
 *
 * I'm not a fan of it but regular inheritance doesn't seem to work as expected os we assign common props in here
 * @typedef {{
 * _data: any
 * _set_data(data?: any, options?: SetCompDataOptions)
 * _prev_data: any
 * _nodes: any
 * } & BaseComp} AnyComp
 *
 * @typedef {{
 * template?: string
 * initialize?()
 * }} createCompOptions
 */

/**
 * @param {BaseComp} comp
 * @param {*} parent_comp
 * @param {*} data
 * @param {createCompOptions} options
 * */
function createComp(comp, parent_comp, data, options) {
	/** @type {AnyComp} */
	// @ts-ignore
	const node = comp;

	/** @type {AnyComp} */
	// @ts-ignore
	const parent = parent_comp;

	node.classList.add("comp");

	if (!parent_comp) {
		node.classList.add("freeze");
		setTimeout(() => {
			node.classList.remove("freeze");
		}, 200);
	}

	if (!!parent && !(parent instanceof HTMLElement)) {
		console.error("Parent is not a node!", parent);
		console.trace();
	}
	node._parent_comp = parent;

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

	node._eval_html = [];
	node._eval_class = [];
	node._comp_traits = [];

	if (options.template) {
		let template = options.template;

		const matches_e = template.match(/{{.*?}}/gm);
		if (matches_e) {
			for (const match of matches_e) {
				const content = match.substring(2, match.length - 2);
				const eval_str = content;
				node._eval_html.push({
					eval_str,
				});
				const node_html = `<span class='eval_html_${
					node._eval_html.length - 1
				}'></span>`;
				template = template.replace(match, node_html);
			}
		}

		node._set_content(template);

		let index = -1;
		for (const eval_html of node._eval_html) {
			index++;
			eval_html.node = node._child(`.eval_html_${index}`);
		}

		for (const trait of node._children("p-batch-trait")) {
			const trait_name = trait.dataset.trait;

			const trait_html = comp_batch_traits[trait_name];
			if (trait_html) {
				trait.insertAdjacentHTML("afterend", trait_html);
			}
			trait.remove();
		}

		for (const trait of node._children("p-trait")) {
			const trait_name = trait.dataset.trait;

			/** @type {CompTraitDefinition} */
			const trait_def = comp_traits[trait_name];
			if (trait_def) {
				/** @type {CompTrait} */
				// @ts-ignore
				const trait_node = createNodeFromHtml(trait_def.template);
				trait_node._trait_def = trait_def;
				trait._parent().insertBefore(trait_node, trait);
				trait.remove();
				node._comp_traits.push(trait_node);
			}
		}

		directComps(node).forEach((comp) => {
			const constructor = snakeCase(comp.tagName.toLocaleLowerCase());
			if (window[constructor]) {
				// @ts-ignore
				window[constructor](comp, node, undefined, {});
			}
		});

		// reactive classes and maybe even more
		node._children("*").forEach((e) => {
			let p = e;
			while (true) {
				p = p._parent();
				if (!p || p === node) {
					break;
				}
				const n2 = p.tagName.toLocaleLowerCase();
				if (n2.endsWith("-comp")) {
					return;
				}
			}

			// yup - it's a direct sibling

			let out = e.className;
			const matches_c = out.match(/\{\w*?:\{.*?}}/gm);
			if (matches_c) {
				for (const match of matches_c) {
					const content = match.substring(1, match.length - 1);
					const [className, ev] = content.split(":");
					const eval_str = ev.substring(1, ev.length - 1);

					node._eval_class.push({ eval_str, node: e, className });
					out = out.replace(match, "");
				}
			}
			e.className = out.replace(/\n/g, " ").replace(/ +/g, " ").trim();
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

	node._comp_traits.forEach((trait) => {
		if (trait._trait_def.initialize) {
			trait._trait_def.initialize(node);
		}
	});

	node._bindNodes.forEach((/** @type {AnyComp} */ sub_node) => {
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
				/** @type {AnyComp} */ source,
				/** @type {AnyComp} */ receiver
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
				/** @type {AnyComp} */ source,
				/** @type {AnyComp} */ receiver
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
 * } & SetCompDataOptions} SetAnyCompDataOptions
 */

/**
 * @param {BaseComp} comp
 * @param {*} _data
 * @param {SetAnyCompDataOptions} options
 */
function setCompData(comp, _data = undefined, options = {}) {
	/** @type {AnyComp} */
	// @ts-ignore
	const node = comp;

	if (_data !== undefined) {
		node._data = cloneObject(_data);
	}

	if (!node || node._data === undefined) {
		// garbage collector again?
		return;
	}

	if (options.pass_list_data) {
		options.pass_list_data.forEach((d) => {
			node._data[d.where].forEach((e) => {
				e[d.what] = node._data[d.what];
			});
		});
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

		node._comp_traits.forEach((trait) => {
			if (trait._trait_def.render) {
				trait._trait_def.render(node);
			}
		});
	}

	const data = node._data; // it's passed to the eval, it's just a keyword
	for (const eval_html of node._eval_html) {
		try {
			eval_html.node._set_content(eval(eval_html.eval_str));
		} catch (e) {
			console.error(`Cannot evaluate html ${eval_html.eval_str}: ${e}`);
			console.trace();
		}
	}

	for (const eval_class of node._eval_class) {
		try {
			eval_class.node.classList.toggle(
				eval_class.className,
				!!eval(eval_class.eval_str)
			);
		} catch (e) {
			console.error(`Cannot evaluate class ${eval_class.eval_str}: ${e}`);
			console.trace();
		}
	}

	if (equal) {
		return;
	}

	node._prev_data = cloneObject(node._data);

	propagateCompData(node);
}

/**
 * @param {BaseComp} comp
 */
function propagateCompData(comp) {
	/** @type {AnyComp} */
	// @ts-ignore
	const node = comp;

	if (node._bindNodes) {
		node._bindNodes.forEach((/** @type {AnyComp} */ sub_node) => {
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
			/** @type {AnyComp} */
			// @ts-ignore
			const receiver = subscribe.receiver;
			receiver._set_data();
		}
	}
}
