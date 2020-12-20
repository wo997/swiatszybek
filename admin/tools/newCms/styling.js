/* js[tool_newCms] */

/**
 * @typedef {{
 * name
 * width
 * height}} ResponsiveType
 */

/**
 * @typedef {{
 * outside: Object
 * inside: Object}} BlockStyleTargets
 */

/**
 * @typedef {{
 * desktop: BlockStyleTargets
 * tablet: BlockStyleTargets
 * mobile: BlockStyleTargets
 * custom: string}} BlockStyles
 */

/**
 * @typedef {{
 * id: number
 * node: PiepNode
 * styles: BlockStyles}} StylingBlockData
 */

/** @typedef {"inside" | "outside"} BlockStyleTargetsEnum */

/** @typedef {"desktop" | "tablet"| "mobile" | "custom"} ResponsiveTypesEnum */

class NewCmsStyling {
	/** @type {ResponsiveType} */
	responsive_type;

	/**
	 * @param {NewCms} newCms
	 */
	constructor(newCms, node) {
		this.newCms = newCms;
		this.node = node;
		this.content_wrapper = this.newCms.container.find(".content_wrapper");
		this.content_responsive_wrapper = this.newCms.container.find(
			".content_responsive_wrapper"
		);

		// THESE MUST BE IN THE DESCENDING ORDER
		/** @type {ResponsiveType[]} */
		this.responsive_types = [
			{
				name: "desktop",
				width: null,
				height: null,
			},
			{
				name: "tablet",
				width: 1024,
				height: 768,
			},
			{
				name: "mobile",
				width: 360,
				height: 640,
			},
		];

		this.biggest_responsive_type_name = this.responsive_types[0].name;

		this.init({ quiet: true });

		this.newCms.container.addEventListener("edit", (event) => {
			this.init();
			this.setResponsiveContainerSize({
				duration: 0,
			});
		});
		this.newCms.container.addEventListener("ready", (event) => {
			this.init();
		});
	}

	/** @returns {StylingBlockData} */
	getDefaultBlock() {
		return {
			id: 0,
			node: null,
			styles: {
				desktop: {
					outside: {},
					inside: {},
				},
				tablet: {
					outside: {},
					inside: {},
				},
				mobile: {
					outside: {},
					inside: {},
				},
				custom: "",
			},
		};
	}

	mouseClick() {
		const target = this.newCms.mouse_target;

		const responsive_type_name = target.findParentByAttribute(
			"data-responsive_type"
		);

		if (responsive_type_name) {
			this.setResponsiveType(responsive_type_name.dataset.responsive_type, {
				duration: 200,
			});
		}
	}

	init(options = {}) {
		/** @type {StylingBlockData[]} */
		if (!isArray(this.blocks)) {
			// TODO: this would get overriden cause we edit the document once again and it just decided to get rid of that, not cool bro!
			this.blocks = [];
		}

		this.setAllRegisteredBlocks();
		this.registerMissingBlocks();
		this.generateCSS();
		this.initHistory();

		let opts = {};
		if (options.duration) {
			opts.duration = options.duration;
		}
		if (options.quiet) {
			opts.quiet = options.quiet;
		}
		this.setResponsiveType(this.biggest_responsive_type_name, opts);
	}

	setResponsiveType(type_name, options = {}) {
		if (this.responsive_type && this.responsive_type.name == type_name) {
			return;
		}
		this.responsive_type = this.responsive_types.find(
			(e) => e.name == type_name
		);

		if (!this.responsive_type) {
			console.error("Wrong responsive type");
			return;
		}

		$(`[data-side_menu="add_block"]`).classList.toggle(
			"disabled",
			this.biggest_responsive_type_name != type_name
		);

		this.allow_free_rearrangement =
			this.responsive_type.name == this.biggest_responsive_type_name;

		this.newCms.container
			.findAll(`.custom-toolbar [data-responsive_type]`)
			.forEach((e) => {
				const curr = e.dataset.responsive_type == type_name;
				e.classList.toggle("important", curr);
				e.classList.toggle("primary", !curr);
			});

		/*this.newCms.content_scroll_panel.classList.toggle(
        "hide_scrollbar",
			!!this.responsive_type.width
		);*/

		let opts = {};
		if (options.duration) {
			opts.duration = options.duration;
		}
		this.setResponsiveContainerSize(opts);

		if (!options.quiet) {
			this.newCms.contentChange();
		}
	}

	setResponsiveContainerSize(options = {}) {
		const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();
		const content_responsive_wrapper_rect = this.content_responsive_wrapper.getBoundingClientRect();

		const bw = this.responsive_type.width
			? this.responsive_type.width * 0.012 + 5
			: 0;
		const br = this.responsive_type.width ? 30 : 0;
		const inner_br = this.responsive_type.width
			? 8 + 140 / (this.responsive_type.width * 0.02 + 5)
			: 0;
		const prev_style_border = nonull(this.style_border, "none");
		const prev_style_border_radius = nonull(this.style_border_radius, "0px");
		this.style_border = `${bw}px solid #444`;
		this.style_border_radius = br + "px";
		document.documentElement.style.setProperty(
			"--content-border-radius",
			inner_br + "px"
		);

		const duration = nonull(options.duration, 0);
		const width_diff = nonull(options.width_diff, 0);

		this.width = Math.min(
			nonull(this.responsive_type.width, 100000) + 2 * bw,
			content_wrapper_rect.width + width_diff
		);

		this.height = Math.min(
			nonull(this.responsive_type.height, 100000) + 2 * bw,
			content_wrapper_rect.height
		);

		const target_width = this.width;
		this.content_responsive_wrapper.animate(
			`
                0% {
                    width: ${content_responsive_wrapper_rect.width}px;
                    height: ${content_responsive_wrapper_rect.height}px;
                    border: ${prev_style_border};
                    border-radius: ${prev_style_border_radius};
                }
                100% {
                    width: ${target_width}px;
                    height: ${this.height}px;
                    border: ${this.style_border};
                    border-radius: ${this.style_border_radius};
                }
            `,
			duration,
			{
				callback: () => {
					this.content_responsive_wrapper.style.width = target_width + "px";
					this.content_responsive_wrapper.style.height = this.height + "px";
					this.content_responsive_wrapper.style.border = this.style_border;
					this.content_responsive_wrapper.style.borderRadius = this.style_border_radius;

					this.newCms.onResize({ source: "styling" });
				},
				early_callback: false,
			}
		);

		setTimeout(() => {
			this.generateCSS();
		}, duration * 0.5);
	}

	initHistory() {
		this.newCms.container.addEventListener("after_get_form_data", (event) => {
			let export_styles = [];
			for (const block_data of this.blocks) {
				const export_block_data = {
					id: block_data.id,
					styles: block_data.styles,
				};
				export_styles.push(export_block_data);
			}
			// @ts-ignore
			event.detail.data.styles = JSON.stringify(export_styles);
			// @ts-ignore
			event.detail.data.responsive_type_name = this.responsive_type.name;
		});

		this.newCms.container.addEventListener("after_set_form_data", (event) => {
			this.registerMissingBlocks();

			// @ts-ignore
			if (event.detail.data.responsive_type_name) {
				// @ts-ignore
				this.setResponsiveType(event.detail.data.responsive_type_name, {
					quiet: true,
					duration: 0,
				});
			}

			try {
				// @ts-ignore
				const styles = JSON.parse(event.detail.data.styles);

				this.blocks = [];
				// @ts-ignore
				for (const import_block_data of styles) {
					const block_id = import_block_data.id;
					const node = this.newCms.content_node.find(
						`.${this.getBlockClassName(block_id)}`
					);

					//console.log(node, `.${this.getBlockClassName(block_id)}`);

					if (node) {
						/** @type {StylingBlockData} */
						const block_data = {
							id: block_id,
							styles: import_block_data.styles,
							node: node,
						};
						this.blocks.push(block_data);
					}
				}
			} catch (e) {}
			this.generateCSS();
		});
	}

	setAllRegisteredBlocks() {
		this.newCms.content_node.findAll(".newCms_block").forEach((node) => {
			const block_id = this.getBlockId(node);

			if (!block_id) {
				return;
			}

			// TODO: fetch styles from... somewhere, like a node with big json in html
			const block_data = this.getDefaultBlock();
			block_data.id = block_id;
			block_data.node = node;
			this.blocks.push(block_data);
		});
	}

	registerMissingBlocks() {
		this.newCms.content_node.findAll(".newCms_block").forEach((node) => {
			if (this.getBlockId(node)) {
				return;
			}

			const block_id =
				this.blocks.reduce(
					(a, b) => {
						return a.id > b.id ? a : b;
					},
					{ id: 0 }
				).id + 1;
			node.classList.add(this.getBlockClassName(block_id));

			const block_data = this.getDefaultBlock();
			block_data.id = block_id;
			block_data.node = node;
			this.blocks.push(block_data);
		});
	}

	getBlockId(node) {
		const match_block_id = node.className.match(/block_\d+/);

		if (!match_block_id) {
			return null;
		}

		return parseInt(match_block_id[0].substring(6));
	}

	getBlockClassName(block_id) {
		return `block_${block_id}`;
	}

	generateCSS() {
		let css_full = "";
		for (const block_data of this.blocks) {
			//console.log(block);

			const block_class_name = this.getBlockClassName(block_data.id);
			const block_selector = `.${block_class_name}`;
			const block_selector_inside = `.${block_class_name}>.newCms_block_content`;

			let custom = block_data.styles.custom;
			if (custom) {
				custom = custom.replace(/&/g, block_selector);

				css_full += custom;
			}

			/**
			 * @param {ResponsiveTypesEnum} type
			 * @param {BlockStyleTargetsEnum} target
			 */
			const getSomeStyles = (type, target) => {
				let styles = block_data.styles[type][target];
				if (styles) {
					let css = "";
					Object.entries(styles).forEach(([prop_css, val]) => {
						// these are needed by the page builder to work properly during animations
						// TODO: consider limiting the list to margins, flex-grow etc. (layout related)
						// TODO: the list goes on baby
						if (prop_css.includes("margin") || prop_css.includes("grid")) {
							const prop_js = kebabToSnakeCase(prop_css);

							const tb =
								target == "outside"
									? block_data.node
									: block_data.node.find(".newCms_block_content");
							tb.style[prop_js] = val;
						}
						css += `${prop_css}:${val};`;
					});
					if (css) {
						const block_styles =
							target == "outside"
								? `${block_selector}{${css}}`
								: `${block_selector_inside}{${css}}`;
						return block_styles;
					}
				}
				return "";
			};

			for (const responsive_type of this.responsive_types) {
				css_full += getSomeStyles(responsive_type.name, "outside");
				css_full += getSomeStyles(responsive_type.name, "inside");

				if (this.responsive_type.name == responsive_type.name) {
					break;
				}
			}
		}
		//console.log(css_full);
		this.node.innerHTML = css_full;

		// we might need to push all the styles to each node inline, so that is efficient to pick them up, margin, flex props etc gotta be here
		// cleaning up obviosly will remove these,
		// woah
	}

	/**
	 * @param {Object} styles
	 * @param {StylingBlockData} block_data
	 * @param {{
	 * target?: BlockStyleTargetsEnum
	 * generate_css?: boolean
	 * type?: ResponsiveTypesEnum
	 * }} params
	 */
	setBlockStylesFromBlockData(styles, block_data, params = {}) {
		if (params.type == "custom") {
			block_data.styles.custom = styles;
		} else {
			const target = nonull(params.target, "outside");
			const type = nonull(params.type, this.responsive_type.name);
			Object.assign(block_data.styles[type][target], styles);
		}
		if (nonull(params.generate_css, true)) {
			this.newCms.contentChange();
			//this.generateCSS();
		}
	}

	/**
	 * @param {Object} styles
	 * @param {PiepNode} node
	 * @param {{
	 * type?: ResponsiveTypesEnum
	 * target?: BlockStyleTargetsEnum
	 * }} params
	 */
	setBlockStyles(styles, node = null, params = {}) {
		if (!node) {
			node = this.newCms.edit_block.edit_node;
		}
		//console.log(styles, node, params);

		this.registerMissingBlocks();
		const block_id = this.getBlockId(node);
		/** @type {StylingBlockData} */
		const block_data = this.blocks.find((e) => e.id == block_id);

		if (!block_data) {
			console.error("No block found");
			return;
		}

		this.setBlockStylesFromBlockData(styles, block_data, params);
	}

	getBlockStyles(node = null) {
		if (node === null) {
			node = this.newCms.edit_block.edit_node;
		}
		if (!node) {
			console.error("No block selected");
			return;
		}
		const block_id = this.getBlockId(node);
		/** @type {StylingBlockData} */
		const block_data = this.blocks.find((e) => e.id == block_id);
		if (!block_data) {
			console.error("No block found");
			return;
		}
		return block_data.styles;
	}

	/** @returns {BlockStyleTargets} */
	getNodeCurrentStyles(node = null) {
		if (node === null) {
			node = this.newCms.edit_block.edit_node;
		}
		const node_styles = this.getBlockStyles(node);
		if (!node_styles) {
			return null;
		}
		return node_styles[this.responsive_type.name];
	}

	/**
	 * @param {NewCmsBlock[]} container_blocks
	 */
	setDataFlexOrder(container_blocks) {
		// set data-flex_order
		let child_count = 0;
		container_blocks.forEach((block) => {
			child_count++;

			/** @type {BlockStyles} */
			const block_styles = this.getBlockStyles(block);

			let flex_order = child_count;

			for (const responsive_type of this.responsive_types) {
				const order = block_styles[responsive_type.name].order;
				if (order) {
					flex_order = order;
				}

				if (this.responsive_type.name == responsive_type.name) {
					break;
				}
			}

			block.dataset.flex_order = flex_order + "";
		});
	}

	setBlocksFlexOrder() {
		this.newCms.content_node.findAll(`.newCms_block`).forEach((b) => {
			/** @type {NewCmsBlock} */
			// @ts-ignore
			const block = b;

			// set to default - can be changed below
			// @ts-ignore
			block.getPrevBlock = block.prev;
			// @ts-ignore
			block.getNextBlock = block.next;
		});

		this.newCms.content_node
			.findAll(`.newCms_block[data-block="container"] > .newCms_block_content`)
			.forEach((container) => {
				let container_blocks = container.directChildren();

				if (this.allow_free_rearrangement) {
					// remove data-flex_order for free rearrangement blocks, they will have the position set explicitly in DOM
					container_blocks.forEach((b) => {
						/** @type {NewCmsBlock} */
						// @ts-ignore
						const block = b;
						delete block.dataset.flex_order;
					});
				} else {
					// @ts-ignore
					this.setDataFlexOrder(container_blocks);

					container_blocks = container_blocks.sort((a, b) => {
						//console.log(a.dataset.flex_order, b.dataset.flex_order);
						return (
							parseFloat(nonull(a.dataset.flex_order, 1000000)) -
							parseFloat(nonull(b.dataset.flex_order, 1000000))
						);
					});

					/*console.log(
						container_blocks,
						container_blocks.map((e) => {
							return $("." + this.getBlockClassName(e.id));
						})
					);*/

					// set style flex order for squished / rearranged elements in current view
					let child_count = 0;
					container_blocks.forEach((b) => {
						/** @type {NewCmsBlock} */
						// @ts-ignore
						const block = b;
						child_count++;

						/** @type {BlockStyles} */
						const block_styles = this.getBlockStyles(block);
						//console.log(block, child_count);

						block_styles[this.responsive_type.name].order = child_count;
					});

					// @ts-ignore
					this.setDataFlexOrder(container_blocks);

					// assign prev next blocks
					container_blocks.forEach((b) => {
						/** @type {NewCmsBlock} */
						// @ts-ignore
						const block = b;
						block.getPrevBlock = () => {
							/** @type {NewCmsBlock} */
							// @ts-ignore
							const b = block
								.parent()
								.directChildren()
								.find(
									(child) =>
										parseInt(child.dataset.flex_order) ==
										parseInt(block.dataset.flex_order) - 1
								);
							return b;
						};
						block.getNextBlock = () => {
							/** @type {NewCmsBlock} */
							// @ts-ignore
							const b = block
								.parent()
								.directChildren()
								.find(
									(child) =>
										parseInt(child.dataset.flex_order) ==
										parseInt(block.dataset.flex_order) + 1
								);
							return b;
						};
					});
				}
			});

		this.generateCSS();
	}
}
