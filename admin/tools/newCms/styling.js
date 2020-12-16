/* js[tool_newCms] */

class ResponsiveType {
	name;
	width;
	height;
}
class Styles {
	desktop;
	tablet;
	mobile;
	custom;
}

class blockData {
	id;
	node;
	/** @type {Styles} */
	styles;
}

/** @returns {blockData} */
function getDefaultBlock() {
	return {
		id: 0,
		node: null,
		styles: {
			desktop: {},
			tablet: {},
			mobile: {},
			custom: "",
			// TODO, custom inline or custom SCSS - 2 fields cause why not :P
		},
	};
}

class NewCmsStyling {
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

		this.init();

		this.newCms.container.addEventListener("edit", (event) => {
			this.init();
			this.setResponsiveContainerSize({
				unlock: true,
				duration: 0,
			});
		});
		this.newCms.container.addEventListener("ready", (event) => {
			this.init();
		});
	}

	mouseClick() {
		const target = this.newCms.mouse_target;

		const responsive_type_name = target.findParentByAttribute(
			"data-responsive_type"
		);
		if (responsive_type_name) {
			this.setResponsiveType(responsive_type_name.dataset.responsive_type);
		}
	}

	init(options = {}) {
		/** @type {blockData[]} */
		this.blocks = [];

		this.setAllRegisteredBlocks();
		this.registerMissingBlocks();
		this.generateCSS();
		this.initHistory();

		let opts = {};
		if (options.unlock) {
			opts.unlock = true;
		}
		this.setResponsiveType(this.biggest_responsive_type_name, opts);
	}

	setResponsiveType(type_name, options = {}) {
		this.responsive_type = this.responsive_types.find(
			(e) => e.name == type_name
		);

		if (!this.responsive_type) {
			console.error("Wrong responsive type");
			return;
		}

		this.allow_free_rearrangement =
			this.responsive_type.name == this.biggest_responsive_type_name;

		this.newCms.container.findAll(`[data-responsive_type]`).forEach((e) => {
			const curr = e.dataset.responsive_type == type_name;
			e.classList.toggle("important", curr);
			e.classList.toggle("primary", !curr);
		});

		/*this.newCms.content_scroll_panel.classList.toggle(
        "hide_scrollbar",
			!!this.responsive_type.width
		);*/

		let opts = {};
		if (options.unlock) {
			opts.unlock = true;
		} else {
			opts.duration = 200;
		}
		this.setResponsiveContainerSize(opts);

		this.newCms.contentChange();
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
		animate(
			this.content_responsive_wrapper,
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
			() => {
				this.content_responsive_wrapper.style.width = target_width + "px";
				this.content_responsive_wrapper.style.height = this.height + "px";
				this.content_responsive_wrapper.style.border = this.style_border;
				this.content_responsive_wrapper.style.borderRadius = this.style_border_radius;

				this.newCms.onResize({ source: "styling" });
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
					styles: JSON.stringify(block_data.styles),
				};
				export_styles.push(export_block_data);
			}
			event.detail.data.styles = export_styles;
		});

		this.newCms.container.addEventListener("before_set_form_data", (event) => {
			if (!isArray(event.detail.data.styles)) {
				return;
			}
			this.blocks = [];
			for (const import_block_data of event.detail.data.styles) {
				const block_id = import_block_data.id;
				const node = $(`.${this.getBlockClassName(block_id)}`);

				if (node) {
					const block_data = {
						id: block_id,
						styles: JSON.parse(import_block_data.styles),
						node: node,
					};
					this.blocks.push(block_data);
				}
			}
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
			const block_data = getDefaultBlock();
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

			const block_data = getDefaultBlock();
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

			let custom = block_data.styles.custom;
			if (custom) {
				custom = custom.replace(/&/g, block_selector);

				css_full += custom;
			}

			const getSomeStyles = (type) => {
				let styles = block_data.styles[type];
				if (styles) {
					let css = "";
					Object.entries(styles).forEach(([prop_css, val]) => {
						// these are needed by the page builder to work properly during animations
						// TODO: consider limiting the list to margins, flex-grow etc. (layout related)
						// TODO: the list goes on baby
						if (prop_css.includes("margin") || prop_css == "grid-area") {
							const prop_js = kebabToSnakeCase(prop_css);
							block_data.node.style[prop_js] = val;
						}
						css += `${prop_css}:${val};`;
					});
					if (css) {
						const block_styles = `${block_selector}{${css}}`;
						return block_styles;
					}
				}
				return "";
			};

			for (const type of this.responsive_types) {
				css_full += getSomeStyles(type.name);

				if (this.responsive_type.name == type.name) {
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

	// params like responsiveness etc
	setNodeStyles(styles, node = null, params = {}) {
		if (node === null) {
			node = this.newCms.edit_block.edit_node;
		}
		const block_id = this.getBlockId(node);
		/** @type {blockData} */
		const block_data = this.blocks.find((e) => e.id == block_id);
		//console.log(block_data, node, block_id);

		if (params.type == "custom") {
			block_data.styles.custom = styles;
		} else {
			const type = nonull(params.type, this.responsive_type.name);
			Object.assign(block_data.styles[type], styles);
		}

		if (nonull(params.generate_css, true)) {
			this.generateCSS();
		}
	}

	getCurrentNodeStyles(node = null) {
		if (node === null) {
			node = this.newCms.edit_block.edit_node;
		}
		const block_id = this.getBlockId(node);
		/** @type {blockData} */
		const block_data = this.blocks.find((e) => e.id == block_id);

		return block_data.styles[this.responsive_type.name];
	}
}
