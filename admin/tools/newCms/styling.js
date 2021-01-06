/* js[tool_newCms] */

/**
 * @typedef {{
 * name
 * width
 * height}} ResponsiveType
 */

// consider using CSSStyleDeclaration, but! it's for camel not kebab case

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
 * node: NewCmsBlock
 * styles: BlockStyles}} StylingBlockData
 */

/** @typedef {"inside" | "outside"} BlockStyleTargetsEnum */

/** @typedef {"desktop" | "tablet"| "mobile" | "custom"} ResponsiveTypesEnum */

/**
 * @typedef {{
 * target?: BlockStyleTargetsEnum
 * action?: ("css_and_change" | "just_css" | "none")
 * type?: ResponsiveTypesEnum
 * }} SetStylesOptions
 */

class NewCmsStyling {
	/** @type {ResponsiveType} */
	responsive_type;

	/**
	 * @param {NewCms} newCms
	 * @param {PiepNode} node
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
		/*this.newCms.container.addEventListener("ready", (event) => {
               this.init();
           });*/
	}

	/** @returns {StylingBlockData} */
	getDefaultBlock() {
		return {
			id: 0,
			node: null,
			styles: this.getDefaultBlockStyles(),
		};
	}

	/** @returns {BlockStyles} */
	getDefaultBlockStyles() {
		return {
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
		if (!isArray(this.blocks)) {
			// TODO: this would get overriden cause we edit the document once again and it just decided to get rid of that, not cool bro!
			/** @type {StylingBlockData[]} */
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

		let opts = {};
		if (options.duration) {
			opts.duration = options.duration;
		}
		this.setResponsiveContainerSize(opts);

		if (!options.quiet) {
			this.newCms.contentChange();
			this.newCms.sidebar.setSidebarEditBlockData();
		}
	}

	setResponsiveContainerSize(options = {}) {
		const duration = nonull(options.duration, 0);
		const width_diff = nonull(options.width_diff, 0);

		this.newCms.lockInput(duration);

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

			this.newCms.clean_output_node.setContent(
				this.newCms.content_node.innerHTML
			);
			this.newCms.clean_output_node
				.findAll(this.newCms.query_for_visible_blocks)
				.forEach((e) => {
					cleanNodeFromAnimations(e);
				});

			// @ts-ignore
			event.detail.data.content = this.newCms.clean_output_node.innerHTML;
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

					/** @type {NewCmsBlock} */
					// @ts-ignore
					const node = this.newCms.content_node.find(
						`.${this.getBlockClassName(block_id)}`
					);

					if (node) {
						/** @type {StylingBlockData} */
						const block_data = {
							id: block_id,
							styles: import_block_data.styles,
							node: node,
						};
						this.addBlockData(block_data);
					}
				}
			} catch (e) {}

			this.newCms.contentChangeManageContent();
		});
	}

	setAllRegisteredBlocks() {
		this.newCms.content_node
			.findAll(this.newCms.query_for_visible_blocks)
			.forEach((/** @type {NewCmsBlock} */ node) => {
				const block_id = this.getBlockId(node);

				if (!block_id) {
					return;
				}

				const block_data = this.getDefaultBlock();
				block_data.id = block_id;
				block_data.node = node;
				this.addBlockData(block_data);
			});
	}

	/**
	 *
	 * @param {StylingBlockData} block_data
	 */
	addBlockData(block_data) {
		if (
			this.blocks.find((e) => {
				return e.id == block_data.id;
			})
		) {
			return;
		}

		block_data.node.styling_data = block_data.styles;
		this.blocks.push(block_data);
	}

	registerMissingBlocks() {
		this.newCms.content_node.findAll(".newCms_block").forEach((
			/** @type {NewCmsBlock} */ node
		) => {
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

			if (node.styling_data) {
				block_data.styles = node.styling_data;
			}

			this.addBlockData(block_data);
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
						css += `${prop_css}:${val};`;
					});
					if (css) {
						const block_styles =
							`#admin ` +
							(target == "outside"
								? `${block_selector}{${css}}`
								: `${block_selector_inside}{${css}}`);
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

		this.node.setContent(css_full);
	}

	/**
	 * @param {Object} styles
	 * @param {BlockStyles} block_styles
	 * @param {SetStylesOptions} params
	 */
	setBlockStylesFromStylingData(styles, block_styles, params = {}) {
		if (!block_styles) {
			console.error("Block missing styles");
			return;
		}

		if (params.type == "custom") {
			block_styles.custom = styles;
		} else {
			const target = nonull(params.target, "outside");
			const type = nonull(params.type, this.responsive_type.name);
			Object.entries(styles).forEach(([prop, val]) => {
				if (val !== undefined) {
					const val_clean = escapeCSS(prop, val);
					if (val_clean) {
						block_styles[type][target][prop] = val_clean;
						return;
					}
				}
				delete block_styles[type][target][prop];
			});
		}

		const action = nonull(params.action, "just_css");

		if (action === "css_and_change") {
			this.newCms.contentChange();
		} else if (action === "just_css") {
			this.newCms.contentChangeManageContent();
		}
	}

	/**
	 * @param {Object} styles
	 * @param {NewCmsBlock} node
	 * @param {SetStylesOptions} params
	 */
	setBlockStyles(styles, node = null, params = {}) {
		if (!node) {
			node = this.newCms.edit_block.edit_node;
		}
		if (!node) {
			console.error("No block selected");
			return;
		}

		this.registerMissingBlocks();

		if (!node.styling_data) {
			console.error(node, "Block missing styles");
			return;
		}

		this.setBlockStylesFromStylingData(styles, node.styling_data, params);
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

	/**
	 * @param {NewCmsBlock} node
	 * @returns {BlockStyleTargets}
	 *  */
	getBlockCurrentStyles(node = null) {
		if (node === null) {
			node = this.newCms.edit_block.edit_node;
		}
		return node.styling_data[this.responsive_type.name];
	}

	/**
	 * Desktop first merge result
	 *
	 * @param {NewCmsBlock} node
	 * @returns {BlockStyleTargets}
	 *  */
	getBlockComputedStyles(node = null) {
		if (node === null) {
			node = this.newCms.edit_block.edit_node;
		}

		let computed_styles = {};

		if (node.styling_data) {
			for (const responsive_type of this.responsive_types) {
				const sd = node.styling_data[responsive_type.name];
				if (sd) {
					deepAssign(computed_styles, sd);
				}

				if (this.responsive_type.name == responsive_type.name) {
					break;
				}
			}
		}

		// @ts-ignore
		return computed_styles;
	}

	/**
	 * @param {NewCmsBlock[]} container_blocks
	 * it sets metadata about blocks to use later
	 */
	setDataFlexOrder(container_blocks) {
		// set data-flex_order
		let child_count = 0;
		container_blocks.forEach((block) => {
			child_count++;
			const had_flex_order =
				block.styling_data[this.responsive_type.name].outside.order;
			block.dataset.flex_order = nonull(had_flex_order, child_count);
		});
	}

	/**
	 * it moves the blocks
	 */
	setBlocksFlexOrder(parent = null) {
		if (parent && parent.dataset.block !== "container") {
			// just in case
			return false;
		}

		this.newCms.content_node.findAll(`.newCms_block`).forEach((b) => {
			/** @type {NewCmsBlock} */
			// @ts-ignore
			const block = b;

			// set to default - can be changed below
			// @ts-ignore
			block.getPrevBlock = () => {
				let temp = block;
				while (true) {
					// @ts-ignore
					temp = temp.prev();
					if (!temp) {
						break;
					}
					if (
						temp.classList.contains("newCms_block") &&
						!temp.classList.contains("cramped")
					) {
						return temp;
					}
				}

				return null;
			};
			// @ts-ignore
			block.getNextBlock = () => {
				let temp = block;
				while (true) {
					// @ts-ignore
					temp = temp.next();
					if (!temp) {
						break;
					}
					if (
						temp.classList.contains("newCms_block") &&
						!temp.classList.contains("cramped")
					) {
						return temp;
					}
				}

				return null;
			};
		});

		// not content_node (.newCmsContent) to include it as well
		const containers = parent
			? [parent.find(".newCms_block_content")]
			: this.newCms.content_scroll_content.findAll(
					`.newCmsContent .newCms_block[data-block="container"] > .newCms_block_content, .newCmsContent`
			  );

		containers.forEach((container) => {
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
				if (!parent) {
					// we have set the NewCmsBlock dataset.flex_order in order to rearrange nodes
					// so don't remove that information until you are 100% sure you wanna do this
					// @ts-ignore
					this.setDataFlexOrder(container_blocks);
				}

				container_blocks = container_blocks.sort((a, b) => {
					return (
						parseFloat(nonull(a.dataset.flex_order, 1000000)) -
						parseFloat(nonull(b.dataset.flex_order, 1000000))
					);
				});

				// set style flex order for squished / rearranged elements in current view
				let child_count = 0;
				container_blocks.forEach((b) => {
					/** @type {NewCmsBlock} */
					// @ts-ignore
					const block = b;
					child_count++;

					this.setBlockStyles(
						{
							order: child_count,
						},
						block,
						{
							action: "none",
						}
					);
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

		// optimisation purpose
		if (!parent) {
			this.generateCSS();
		}
	}

	assignGridLayoutIndices() {
		if (this.responsive_type.name !== this.biggest_responsive_type_name) {
			return;
		}

		this.newCms.content_node
			.findAll(`.newCms_block[data-block="grid"]`)
			.forEach((g) => {
				/** @type {NewCmsGrid} */
				// @ts-ignore
				const grid = g;

				let grid_children = grid
					.find(".newCms_block_content")
					.directChildren()
					.filter((b) => {
						if (!b.classList.contains("newCms_block")) {
							return false;
						}

						/** @type {NewCmsBlock} */
						// @ts-ignore
						const block = b;

						const rect = block.getBoundingClientRect();

						// it's something we could run anytime we modify desktop view so we could use it later, good approx, interesting
						block.grid_layout_index =
							rect.top +
							rect.height * 0.5 +
							(0.05 * ((rect.left + rect.width * 0.5) * 1000)) /
								this.newCms.content_node.offsetWidth;

						return true;
					});

				grid_children = grid_children.sort((block_a, block_b) => {
					return Math.sign(
						// @ts-ignore
						block_a.grid_layout_index - block_b.grid_layout_index
					);
				});

				let actual_index = 0;
				grid_children.forEach((b) => {
					/** @type {NewCmsBlock} */
					// @ts-ignore
					const block = b;

					actual_index++;
					block.grid_layout_index = actual_index;
				});
			});
	}

	alignGridBlocksVertically() {
		this.newCms.content_node
			.findAll(this.newCms.query_for_visible_blocks + `[data-block="grid"]`)
			.forEach((g) => {
				/** @type {NewCmsGrid} */
				// @ts-ignore
				const grid = g;

				const grid_children = grid
					.find(".newCms_block_content")
					.directChildren()
					.filter((b) => {
						return b.classList.contains("newCms_block");
					});

				grid_children.forEach((b) => {
					/** @type {NewCmsBlock} */
					// @ts-ignore
					const block = b;

					this.setBlockStyles(
						{
							"grid-area": `${block.grid_layout_index} / 1 / ${
								block.grid_layout_index + 1
							} / 2`,
						},
						block,
						{
							action: "none",
						}
					);
				});

				this.setBlockStyles(
					{
						"grid-template-columns": "1fr",
						"grid-template-rows": "auto ".repeat(grid_children.length).trim(),
					},
					grid,
					{
						target: "inside",
						action: "css_and_change",
					}
				);
			});
	}

	/** @param {NewCmsBlock} block */
	isContainerHorizontal(block) {
		if (block && block.computed_styles) {
			const ff = block.computed_styles.inside["flex-flow"];
			if (ff) {
				return ff.includes("row");
			}
		}
		return false;
	}

	/**
	 *
	 * @param {*} val
	 * @param {NewCmsBlock} block
	 * @param {{
	 * auto?: any
	 * direction?: ("horizontal" | "vertical")
	 * opposite?: any
	 * opposite_name?: string
	 * default?: string
	 * }} params
	 */
	evalCss(val, block, params = {}) {
		if ((!val || !val.trim()) && params.default) {
			val = params.default;
		}

		if (!val || !val.trim()) {
			return 0;
		}

		/** @type {NewCmsBlock} */
		// @ts-ignore
		const parent_container = this.newCms.getBlockParent(block);

		const auto = val === "auto";
		if (auto) {
			if (
				parent_container === this.newCms.content_node &&
				params.direction == "vertical"
			) {
				// TODO: no margin auto vertically in the root by default
				return 0;
			}

			if (params.auto !== undefined) {
				return params.auto;
			}

			if (parent_container.dataset.block === "grid") {
				/** @type {NewCmsGrid} */
				// @ts-ignore
				const grid = parent_container;

				const grid_area = block.computed_styles.outside["grid-area"];
				if (grid_area) {
					const grid_area_parts = grid_area.replace(/ /g, "").split("/");
					if (grid_area_parts.length === 4) {
						// ${r1}/${c1}/${r2}/${c2}
						const r1 = grid_area_parts[0] - 1;
						const c1 = grid_area_parts[1] - 1;
						const r2 = grid_area_parts[2] - 1;
						const c2 = grid_area_parts[3] - 1;

						const column_width =
							grid.grid_data.x_coords[c2] - grid.grid_data.x_coords[c1];

						const row_height =
							grid.grid_data.y_coords[r2] - grid.grid_data.y_coords[r1];

						const divide = params.opposite === "auto" ? 2 : 1;

						const opp_mar = this.evalCss(
							block.computed_styles.outside[params.opposite_name],
							block,
							{ auto: 0 }
						);

						return (
							(params.direction == "horizontal"
								? column_width - block.offsetWidth - opp_mar
								: row_height - block.offsetHeight - opp_mar) / divide
						);
					}
				}

				return 0;
			}

			const is_container_horizontal = this.isContainerHorizontal(
				parent_container
			);

			const container_content = parent_container.find(".newCms_block_content");

			let autos_count = 0;
			let content_length = 0;
			let content_width = 0;

			/** @type {NewCmsBlock[]}*/
			let blocks_in_row = [];

			if (!block.siblings_autos_count) {
				// HEY! remember that flex wrap containers wont have the ability to set the height so that operation is way simpler
				// consider adding it tho
				const is_wrap =
					is_container_horizontal &&
					parent_container.computed_styles.inside["flex-flow"].includes("wrap");

				if (is_container_horizontal) {
					if (!is_wrap) {
						content_width = container_content.offsetHeight;
					}
				} else {
					content_width = container_content.offsetWidth;
				}

				/**
				 *
				 * @param {NewCmsBlock} some_block_in_row
				 */
				const setLimits = (some_block_in_row) => {
					if (blocks_in_row.includes(temp_block)) {
						return;
					}

					blocks_in_row.push(some_block_in_row);

					const some_block_styles = some_block_in_row.computed_styles;
					if (!some_block_styles) {
						// hope it never fires :*
						console.log("POTENTIAL ERROR some_block_in_row", some_block_in_row);
						return;
					}

					const mt = this.evalCss(
						some_block_styles.outside["margin-top"],
						block,
						{
							auto: null,
							direction: "vertical",
						}
					);
					const mr = this.evalCss(
						some_block_styles.outside["margin-right"],
						block,
						{
							auto: null,
							direction: "horizontal",
						}
					);
					const mb = this.evalCss(
						some_block_styles.outside["margin-bottom"],
						block,
						{
							auto: null,
							direction: "vertical",
						}
					);
					const ml = this.evalCss(
						some_block_styles.outside["margin-left"],
						block,
						{
							auto: null,
							direction: "horizontal",
						}
					);

					const d1 =
						some_block_in_row.offsetWidth + nonull(ml, 0) + nonull(mr, 0);
					const d2 =
						some_block_in_row.offsetHeight + nonull(mt, 0) + nonull(mb, 0);

					if (is_container_horizontal) {
						if (ml === null) {
							autos_count++;
						}
						if (mr === null) {
							autos_count++;
						}
					} else {
						if (mt === null) {
							autos_count++;
						}
						if (mb === null) {
							autos_count++;
						}
					}

					const temp_length = is_container_horizontal ? d1 : d2;
					content_length += temp_length;

					/*if (temp_block.findParentByClassName("block_17")) {
                        console.log(temp_block, width);
                    }*/

					const temp_margin_width = is_container_horizontal ? d2 : d1;

					if (temp_margin_width > content_width) {
						content_width = temp_margin_width;
					}

					temp_block.margin_width = temp_margin_width;
				};

				let temp_block = block;
				while (true) {
					if (!temp_block) {
						break;
					}

					setLimits(temp_block);

					if (is_wrap && this.getBlockFirstInRow(temp_block)) {
						break;
					}
					temp_block = temp_block.getPrevBlock();
				}
				temp_block = block;
				while (true) {
					if (!temp_block) {
						break;
					}

					setLimits(temp_block);

					if (is_wrap && this.getBlockLastInRow(temp_block)) {
						break;
					}
					temp_block = temp_block.getNextBlock();
				}

				/*if (block.classList.contains("block_23")) {
                    console.log(full_width, count_autos, parent_container.offsetWidth);
                }*/

				blocks_in_row.forEach((some_block_in_row) => {
					// these valyes repeat meanwhile margin_width is assigned above
					some_block_in_row.siblings_length = content_length;
					some_block_in_row.siblings_width = content_width;
					some_block_in_row.siblings_autos_count = autos_count;
				});
			} else {
				content_length = block.siblings_length;
				content_width = block.siblings_width;
				autos_count = block.siblings_autos_count;
			}

			if (
				(params.direction == "horizontal" && !is_container_horizontal) ||
				(params.direction == "vertical" && is_container_horizontal)
			) {
				const divide = params.opposite === "auto" ? 2 : 1;
				// @ts-ignore
				return (content_width - block.margin_width) / divide;
			} else {
				// that solution would work perfectly, but since we can use .newCms_block_content (with no paddings) we will go for that
				//const parent_outside_styles = parent_container.computed_styles.outside;
				//const parent_content_h = parent_outside_styles.pt + parent_outside_styles.pb;
				return (
					((is_container_horizontal
						? container_content.offsetWidth
						: container_content.offsetHeight) -
						content_length) /
					autos_count
				);
			}
		}

		let percent = parent_container.inner_percent;

		if (!percent) {
			percent = parent_container.offsetWidth * 0.01;
			if (parent_container.dataset.block == "grid") {
				/** @type {NewCmsGrid} */
				// @ts-ignore
				const grid = parent_container;

				const grid_area = block.computed_styles.outside["grid-area"];
				if (grid_area) {
					const grid_area_parts = grid_area.replace(/ /g, "").split("/");
					if (grid_area_parts.length === 4) {
						// ${r1}/${c1}/${r2}/${c2}
						//const r1 = grid_area_parts[0]-1;
						const c1 = grid_area_parts[1] - 1;
						//const r2 = grid_area_parts[2]-1;
						const c2 = grid_area_parts[3] - 1;

						const column_width =
							grid.grid_data.x_coords[c2] - grid.grid_data.x_coords[c1];

						/*const row_height =
							grid.grid_data.y_coords[r2] - grid.grid_data.y_coords[r1];*/

						percent = column_width * 0.01;
					}
				}
			}

			parent_container.inner_percent = percent;
		}

		const vw = document.body.offsetWidth * 0.01;
		const vh = document.body.offsetHeight * 0.01;
		val = val.replace(/%/g, "*" + percent);
		val = val.replace(/vw/g, "*" + vw);
		val = val.replace(/vh/g, "*" + vh);
		val = val.replace(/px/g, "");

		if (val.includes("auto")) {
			// probably never
			console.error("Wrong css value");
			return 0;
		}

		return eval(escapeNumericalExpression(val));
	}

	resetLayout() {
		this.assignRects();

		const all_blocks = this.newCms.content_node.findAll(
			this.newCms.query_for_visible_blocks
		);

		[this.newCms.content_node, ...all_blocks].forEach((
			/** @type {NewCmsBlock} */ block
		) => {
			delete block.siblings_autos_count;
			delete block.siblings_length;
			delete block.siblings_width;
			delete block.margin_width;
			delete block.inner_percent;
			delete block.last_in_row;
		});

		delete this.newCms.content_node.inner_percent;
	}

	assignRects() {
		this.newCms.getAllNodesWithRects().forEach((e) => {
			e.client_rect = e.getBoundingClientRect();
		});
	}

	recalculateLayout() {
		const all_blocks = this.newCms.content_node.findAll(
			this.newCms.query_for_visible_blocks
		);

		all_blocks.forEach((/** @type {NewCmsBlock} */ block) => {
			block.computed_styles = this.getBlockComputedStyles(block);
		});

		all_blocks.forEach((/** @type {NewCmsBlock} */ block) => {
			const block_styles = block.computed_styles;

			block_styles.outside.mt = this.evalCss(
				block_styles.outside["margin-top"],
				block,
				{
					direction: "vertical",
					opposite: block_styles.outside["margin-bottom"],
					opposite_name: "margin-bottom",
				}
			);
			block_styles.outside.mr = this.evalCss(
				block_styles.outside["margin-right"],
				block,
				{
					direction: "horizontal",
					opposite: block_styles.outside["margin-left"],
					opposite_name: "margin-left",
				}
			);
			block_styles.outside.mb = this.evalCss(
				block_styles.outside["margin-bottom"],
				block,
				{
					direction: "vertical",
					opposite: block_styles.outside["margin-top"],
					opposite_name: "margin-top",
				}
			);
			block_styles.outside.ml = this.evalCss(
				block_styles.outside["margin-left"],
				block,
				{
					direction: "horizontal",
					opposite: block_styles.outside["margin-right"],
					opposite_name: "margin-right",
				}
			);

			const default_padding = block.classList.contains("container")
				? "0"
				: "10px";

			block_styles.outside.pt = this.evalCss(
				block_styles.outside["padding-top"],
				block,
				{
					direction: "vertical",
					default: default_padding,
				}
			);
			block_styles.outside.pr = this.evalCss(
				block_styles.outside["padding-right"],
				block,
				{
					direction: "horizontal",
					default: default_padding,
				}
			);
			block_styles.outside.pb = this.evalCss(
				block_styles.outside["padding-bottom"],
				block,
				{
					direction: "vertical",
					default: default_padding,
				}
			);
			block_styles.outside.pl = this.evalCss(
				block_styles.outside["padding-left"],
				block,
				{
					direction: "horizontal",
					default: default_padding,
				}
			);
		});
	}

	// /**
	//  * @param {NewCmsBlock} block
	//  */
	// getBlockKissesRowEnd(block) {
	// 	const mr = this.evalCss(
	// 		block.computed_styles.outside["margin-right"],
	// 		block
	// 	);

	// 	const right_kiss =
	// 		block.client_rect.left + block.client_rect.width + nonull(mr, 0);

	// 	const container_content_rect = block.parent().getBoundingClientRect();

	// 	// 2 cause of low accuracy
	// 	return (
	// 		right_kiss >
	// 		container_content_rect.left + container_content_rect.width - 2
	// 	);
	// }

	/**
	 * @param {NewCmsBlock} block
	 */
	getBlockLastInRow(block) {
		let last_in_row = block.last_in_row;
		if (last_in_row === undefined) {
			if (!block.computed_styles) {
				//console.error("TAKE A LOOK AT IT BRO, skip or ", block);
				// ok, it's the block we remove :*
				return false;
			}
			const mr = this.evalCss(
				block.computed_styles.outside["margin-right"],
				block,
				{
					auto: 0,
				}
			);

			const right_kiss =
				block.client_rect.left + block.client_rect.width + nonull(mr, 0);

			const next = block.getNextBlock();
			if (next) {
				const next_ml = this.evalCss(
					next.computed_styles.outside["margin-left"],
					next,
					{
						auto: 0,
					}
				);
				const next_left_kiss = next.client_rect.left - nonull(next_ml, 0);

				last_in_row = next_left_kiss < right_kiss - 2;
			} else {
				last_in_row = true;
			}

			block.last_in_row = last_in_row;
		}

		return last_in_row;
	}

	/**
	 * @param {NewCmsBlock} block
	 */
	getBlockFirstInRow(block) {
		const prev = block.getPrevBlock();
		if (!prev) {
			return true;
		}
		return this.getBlockLastInRow(prev);
	}
}
