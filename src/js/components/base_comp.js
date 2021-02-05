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
 * _dom_id: number
 * _dom_class: string
 * _bindNodes: PiepNode[]
 * _parent_comp?: AnyComp
 * _referenceParent: CallableFunction
 * _pointChildsData(child: AnyComp): ObjectData
 * _pointSelfData(): ObjectData
 * _addSubscriber(subscribe: SubscribeToData)
 * _subscribers: SubscribeToData[]
 * _bind_var?: string
 * _changed_data?: object
 * _eval_attrs: {node?: PiepNode, evals: {name: string, eval_str: string}[]}[]
 * _eval_class: {node: PiepNode, eval_str: string, className: string}[]
 * _comp_traits: CompTrait[]
 * _propagating_data: boolean
 * _render(options?: SetAnyCompDataOptions): void
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
 * _set_data(data?: any, options?: SetAnyCompDataOptions)
 * _prev_data: any
 * _nodes: any
 * } & BaseComp} AnyComp
 *
 * @typedef {{
 * template?: string
 * initialize?()
 * unfreeze_by_self?: boolean
 * }} createCompOptions
 */

let comp_id = 0;

/**
 * @param {BaseComp} node
 * @param {*} parent_comp
 * @param {*} data
 * @param {createCompOptions} options
 * */
function createComp(node, parent_comp, data, options) {
	/** @type {AnyComp} */
	// @ts-ignore
	const comp = node;

	/** @type {AnyComp} */
	// @ts-ignore
	const parent = parent_comp;

	//node._propagating_data = false;

	comp._render = (options) => {
		comp._set_data(comp._data, options);
	};

	comp._dom_id = comp_id++;
	comp._dom_class = `comp_${comp._dom_id}`;
	comp.classList.add(comp._dom_class);

	if (comp.classList.contains("comp")) {
		console.error("Component has been initialized already", comp);
		return;
	}
	comp.classList.add("comp");

	if (!parent_comp) {
		comp.classList.add("freeze");

		if (!options.unfreeze_by_self) {
			setTimeout(() => {
				comp.classList.remove("freeze");
			}, 200);
		}
	}

	if (!!parent && !(parent instanceof HTMLElement)) {
		console.error("Parent is not a node!", parent);
		console.trace();
	}
	comp._parent_comp = parent;

	comp._subscribers = [];

	if (!comp._pointChildsData) {
		comp._pointChildsData = (child) => {
			const bind_var = child.dataset.bind;
			if (bind_var) {
				return {
					obj: comp._data,
					key: bind_var,
				};
			}
		};
	}

	// warning: it should never ever change
	if (!comp._pointSelfData) {
		comp._pointSelfData = () => {
			return { obj: comp, key: "_data" };
		};
	}

	comp._eval_attrs = [];
	comp._eval_class = [];
	comp._comp_traits = [];

	if (options.template) {
		let template = options.template;

		comp._set_content(template);

		for (const trait of comp._children("p-batch-trait")) {
			const trait_name = trait.dataset.trait;

			const trait_html = comp_batch_traits[trait_name];
			if (trait_html) {
				trait.insertAdjacentHTML("afterend", trait_html);
			}
			trait.remove();
		}

		for (const trait of comp._children("p-trait")) {
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
				comp._comp_traits.push(trait_node);
			}
		}

		directComps(comp).forEach((dc) => {
			const constructor = snakeCase(dc.tagName.toLocaleLowerCase());
			if (window[constructor]) {
				const bind_var = dc.dataset.bind;
				//console.log(bind_var);

				// @ts-ignore
				window[constructor](dc, comp, data[bind_var]);
				//window[constructor](dc, comp, undefined);
			}
		});

		// reactive classes and maybe even more
		comp._children("*").forEach((child) => {
			let p = child;
			while (true) {
				p = p._parent();
				if (!p || p === comp) {
					break;
				}
				const n2 = p.tagName.toLocaleLowerCase();
				if (n2.endsWith("-comp")) {
					return;
				}
			}

			// yup - it's a direct sibling

			let out = child.className;
			const matches_c = out.match(/\{\w*?:\{.*?}}/gm);
			if (matches_c) {
				for (const match of matches_c) {
					const content = match.substring(1, match.length - 1);
					const [className, ev] = content.split(":");
					const eval_str = ev.substring(1, ev.length - 1);

					comp._eval_class.push({ eval_str, node: child, className });
					out = out.replace(match, "");
				}
			}
			child.className = out.replace(/\n/g, " ").replace(/ +/g, " ").trim();

			const rem = [];
			for (const attr of child.attributes) {
				const val = attr.value;

				if (val.match(/^\{\{.*?}}$/)) {
					let g = comp._eval_attrs.find((x) => x.node === child);
					if (!g) {
						g = { node: child, evals: [] };
						comp._eval_attrs.push(g);
					}
					g.evals.push({ name: attr.name, eval_str: val });

					rem.push(attr.name);
				}
			}
			rem.forEach((e) => {
				child.removeAttribute(e);
			});
		});
	}

	comp._nodes = {};
	comp._children(`[data-node]`).forEach((n) => {
		comp._nodes[n.dataset.node] = n;
	});

	comp._bindNodes = comp._children(`[data-bind]`);

	if (options.initialize) {
		options.initialize();
	}

	comp._comp_traits.forEach((trait) => {
		if (trait._trait_def.initialize) {
			trait._trait_def.initialize(comp);
		}
	});

	comp._bindNodes.forEach((/** @type {AnyComp} */ sub_node) => {
		const bind_var = sub_node.dataset.bind;
		sub_node._bind_var = bind_var;

		if (sub_node._get_value() !== undefined) {
			// a weird way to tell if something should actually have a set or get value, I think that piepquery should be responsible for that
			sub_node.addEventListener("change", () => {
				let sub_node_data = sub_node._get_value();

				if (sub_node_data !== undefined) {
					//if (node._data[bind_var] !== undefined) { // add it anyway
					comp._data[bind_var] = sub_node_data;
					comp._render();
					//}
				}
			});
			sub_node.addEventListener("input", () => {
				sub_node._dispatch_change();
			});
		}
	});

	if (data !== undefined) {
		comp._set_data(data);
	}

	if (parent) {
		parent._subscribers.push({
			receiver: comp,
			fetch: (/** @type {AnyComp} */ source, /** @type {AnyComp} */ receiver) => {
				const x = source._pointChildsData(comp);
				if (x) {
					const { obj: s_obj, key: s_key } = x;
					if (s_key !== undefined) {
						const { obj: r_obj, key: r_key } = receiver._pointSelfData();
						r_obj[r_key] = s_obj[s_key];
					}
				}
			},
		});
		comp._subscribers.push({
			receiver: parent,
			fetch: (/** @type {AnyComp} */ source, /** @type {AnyComp} */ receiver) => {
				const x = receiver._pointChildsData(comp);
				if (x) {
					const { obj: r_obj, key: r_key } = x;
					if (r_key !== undefined) {
						const { obj: s_obj, key: s_key } = source._pointSelfData();
						r_obj[r_key] = s_obj[s_key];
					}
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
		// never used force_render lol
		return;
	}

	// kinda weird but it creates f.e. checkbox base component
	delay("registerForms", 0);

	if (isObject(node._data)) {
		node._changed_data = {};
		for (const [key, value] of Object.entries(node._data)) {
			if (node._prev_data === undefined || !isEquivalent(def(node._prev_data[key], undefined), value)) {
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
	for (const ev of node._eval_attrs) {
		for (const attr of ev.evals) {
			try {
				const val = eval(attr.eval_str);
				if (attr.name === "html") {
					ev.node._set_content(val);
				} else {
					if (!val && val !== "") {
						ev.node.removeAttribute(attr.name);
					} else {
						ev.node.setAttribute(attr.name, val);
					}
				}
			} catch (e) {
				console.error(`Cannot evaluate ${attr.name} ${attr.eval_str}: ${e}`);
				console.trace();
			}
		}
	}

	for (const eval_class of node._eval_class) {
		try {
			eval_class.node.classList.toggle(eval_class.className, !!eval(eval_class.eval_str));
		} catch (e) {
			console.error(`Cannot evaluate class ${eval_class.eval_str}: ${e}`);
			console.trace();
		}
	}

	if (equal) {
		return;
	}

	node._prev_data = cloneObject(node._data);

	//node._propagating_data = true;
	propagateCompData(node);
	//node._propagating_data = false;

	/*if (!options.second) {
		setCompData(comp, undefined, {
			second: true,
		});
	}*/
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

			/** @type {AnyComp} */
			// @ts-ignore
			const receiver = subscribe.receiver;

			// if (receiver._propagating_data) {
			// 	continue;
			// }

			if (receiver._in_body()) {
				subscribe.fetch(node, receiver);
			} else {
				// remove subscriber reference - kinda lazy garbage collector
				subscribers.splice(i, 1);
			}
			receiver._render();
		}
	}
}
