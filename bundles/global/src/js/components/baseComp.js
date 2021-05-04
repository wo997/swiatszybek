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
 * what: string
 * where: string
 * }} PassData
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
 * _eval_class: {node: PiepNode, eval_str: string, className: string, opposite?: string}[]
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
 * freeze?: boolean
 * pass_list_data?: PassListData[]
 * pass_data?: PassData[]
 * delay_change?: boolean
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
 * ready?()
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

	if (!comp) {
		console.error("Comp missing");
		return;
	}

	node._propagating_data = false;

	comp._prev_data = {};
	comp._changed_data = {};

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
				for (const attr of trait.attributes) {
					trait_node.setAttribute(attr.name, attr.value);
				}
				trait.remove();
				comp._comp_traits.push(trait_node);
			}
		}

		directComps(comp).forEach((dc) => {
			const constructor = compTitleCase(dc.tagName.toLowerCase());
			if (comp.tagName === dc.tagName) {
				console.error("Cannot nest self");
				return;
			}
			if (window[constructor]) {
				const bind_var = dc.dataset.bind;
				//console.log(bind_var, dc, comp, data[bind_var]);

				// @ts-ignore
				window[constructor](dc, comp, data[bind_var]);
				//window[constructor](dc, comp, undefined);
			} else {
				console.error(`Constructor ${constructor} is missing`);
			}
		});

		// reactive classes and maybe even more
		directCompNodes(node).forEach((child) => {
			let out = child.className;
			if (!out.match) {
				return;
			}
			const matches_c = out.match(/\{\{.*?\}\?.*?\}/gm);
			if (matches_c) {
				for (const match of matches_c) {
					const content = match.substring(1, match.length - 1);
					let [eval_str, className] = content.split("}?");
					const data = { eval_str: eval_str.substring(1), node: child, className };
					let parts = className.split(":");
					if (parts.length > 1) {
						data.className = parts[0];
						data.opposite = parts[1];
					}

					comp._eval_class.push(data);
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
	directCompNodes(comp, `[data-node]`).forEach((n) => {
		comp._nodes[n.dataset.node] = n;
		n.classList.add("node_" + n.dataset.node);
	});

	comp._bindNodes = directCompNodes(comp, `[data-bind]`);
	comp._bindNodes.forEach((n) => {
		n.classList.add("bind_" + n.dataset.bind);
	});

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

		if (!validPiepInput(sub_node)) {
			return;
		}

		sub_node.addEventListener("change", () => {
			let sub_node_data = sub_node._get_value();

			if (sub_node_data !== undefined && comp._data) {
				comp._data[bind_var] = sub_node_data;
				comp._render();
			}
		});

		if (["INPUT", "TEXTAREA"].includes(sub_node.tagName)) {
			sub_node.addEventListener("input", () => {
				const dis = () => {
					sub_node._dispatch_change();
					// @ts-ignore
					delete sub_node._input_timeout;
				};
				if (sub_node.dataset.input_delay !== undefined) {
					// @ts-ignore
					if (sub_node._input_timeout) {
						// @ts-ignore
						clearTimeout(sub_node._input_timeout);
					}
					// @ts-ignore
					sub_node._input_timeout = setTimeout(dis, +sub_node.dataset.input_delay);
				} else {
					dis();
				}
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
						if (!r_obj) {
							console.error("Missing data", { source, receiver });
							console.trace();
						} else {
							r_obj[r_key] = s_obj[s_key];
						}
					}
				}
			},
		});
	}

	if (options.ready) {
		options.ready();
	}

	comp.classList.add("ready");
	comp._render();
}

/**
 * @typedef {{
 * render?: CallableFunction
 * } & SetCompDataOptions} SetAnyCompDataOptions
 */

let u = 0;

/**
 * @param {BaseComp} comp
 * @param {*} data
 * @param {SetAnyCompDataOptions} options
 */
function setCompData(comp, data = undefined, options = {}) {
	u++;
	//console.log(comp);
	/** @type {AnyComp} */
	// @ts-ignore
	const node = comp;

	if (!comp) {
		console.error("Comp not found");
		return;
	}

	if (data !== undefined) {
		node._data = cloneObject(data);
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

	if (options.pass_data) {
		options.pass_data.forEach((d) => {
			if (node._data[d.where]) {
				node._data[d.where][d.what] = node._data[d.what];
			}
		});
	}

	if (options.freeze) {
		comp.classList.add("freeze");
		setTimeout(() => {
			comp.classList.remove("freeze");
		}, 0);
	}

	const equal = isEquivalent(node._prev_data, node._data);

	const force_render = def(options.force_render, false);
	if (equal && !force_render) {
		return;
	}

	if (!OPTIMIZE_COMPONENTS) {
		registerForms(comp);
		lazyLoadImages();
	}

	if (isObject(node._data)) {
		node._changed_data = {};
		for (const [key, value] of Object.entries(node._data)) {
			if (force_render || node._prev_data === undefined || !isEquivalent(def(node._prev_data[key], undefined), value)) {
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

	{
		for (const ev of node._eval_attrs) {
			const data = node._data; // it's passed to the eval, it's just a keyword
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
	}

	for (const eval_class of node._eval_class) {
		const data = node._data; // it's passed to the eval, it's just a keyword
		try {
			const ok = !!eval(eval_class.eval_str);
			eval_class.className.split(" ").forEach((e) => {
				eval_class.node.classList.toggle(e, ok);
			});
			if (eval_class.opposite) {
				eval_class.opposite.split(" ").forEach((e) => {
					eval_class.node.classList.toggle(e, !ok);
				});
			}
		} catch (e) {
			console.error(`Cannot evaluate class ${eval_class.eval_str}: ${e}`);
			console.trace();
		}
	}

	// filthy, not needed to optimisation
	// if (equal) {
	// 	return;
	// }

	node._prev_data = cloneObject(node._data);

	node._propagating_data = true;
	propagateCompData(node);
	node._propagating_data = false;

	/*if (!options.second) {
		setCompData(comp, undefined, {
			second: true,
		});
	}*/

	node._render(); // once again for clarity, not everything gonna propagate all the time, but stable enough and fast

	comp._dispatch_change();
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

			if (!validPiepInput(sub_node)) {
				return;
			}

			if (!node._changed_data || node._changed_data[bind_var]) {
				const cb = () => {
					sub_node._set_value(node._data[bind_var], { quiet: true });
				};
				if (OPTIMIZE_COMPONENTS) {
					setTimeout(cb);
				} else {
					cb();
				}
			}
		});
	}

	const subscribers = node._subscribers;
	if (subscribers) {
		for (let i = subscribers.length - 1; i >= 0; i--) {
			const subscribe = subscribers[i];

			/** @type {AnyComp} */
			// @ts-ignore
			const receiver = subscribe ? subscribe.receiver : undefined;

			if (receiver._propagating_data) {
				continue;
			}
			// if (receiver._propagating_data && OPTIMIZE_COMPONENTS) {
			// 	continue;
			// }

			if (receiver && receiver._in_body()) {
				subscribe.fetch(node, receiver);
			} else {
				// remove subscriber reference - kinda lazy garbage collector
				subscribers.splice(i, 1);
			}
			if (receiver) {
				receiver._render();
			}
		}
	}
}
