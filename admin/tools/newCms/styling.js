/* js[tool_newCms] */

class Styles {
	desktop;
	tablet;
	mobile;
	custom;
}

class blockData {
	id;
	node;
	/**
	 * @type {Styles}
	 */
	styles;
}

function getDefaultBlock() {
	return {
		id: 0,
		node: null,
		styles: {
			desktop: {},
			tablet: {},
			mobile: {},
		},
	};
}

class NewCmsStyling {
	constructor(newCms, node) {
		/** @type {NewCms} */
		this.newCms = newCms;
		this.node = node;
		this.content_wrapper = this.newCms.container.find(".content_wrapper");
		this.content_responsive_wrapper = this.newCms.container.find(
			".content_responsive_wrapper"
		);

		this.responsive_types = {
			desktop: {
				width: null,
				height: null,
			},
			tablet: {
				width: 1024,
				height: 768,
			},
			mobile: {
				width: 360,
				height: 640,
			},
		};

		this.init();

		this.newCms.container.addEventListener("edit", (event) => {
			this.init();
			this.setResponsiveContainerSize({
				unlock: true,
			});
		});
		this.newCms.container.addEventListener("ready", (event) => {
			this.init();
		});

		window.addEventListener("resize", () => {
			this.setResponsiveContainerSize();
		});
	}

	mouseClick() {
		const target = this.newCms.mouse_target;

		const responsive_type = target.findParentByAttribute(
			"data-responsive_type"
		);
		if (responsive_type) {
			this.setResponsiveType(
				responsive_type.getAttribute("data-responsive_type")
			);
		}
	}

	init(options = {}) {
		/**
		 * @type {blockData[]}
		 */
		this.blocks = [];

		this.setAllRegisteredBlocks();
		this.registerMissingBlocks();
		this.generateCSS();
		this.initHistory();

		let opts = {};
		if (options.unlock) {
			opts.unlock = true;
		}
		this.setResponsiveType("desktop", opts);
	}

	setResponsiveType(type, options = {}) {
		this.responsive_type = this.responsive_types[type];
		if (!type) {
			console.error("Wrong responsive type");
			return;
		}

		this.newCms.content_scroll_panel.classList.toggle(
			"hide_scrollbar",
			!!this.responsive_type.width
		);

		let opts = {};
		if (options.unlock) {
			opts.unlock = true;
		} else {
			opts.duration = 200;
		}
		this.setResponsiveContainerSize(opts);
	}

	setResponsiveContainerSize(options = {}) {
		const content_wrapper_rect = this.content_wrapper.getBoundingClientRect();
		const content_responsive_wrapper_rect = this.content_responsive_wrapper.getBoundingClientRect();

		this.width = Math.min(
			nonull(this.responsive_type.width, 100000),
			content_wrapper_rect.width
		);
		this.height = Math.min(
			nonull(this.responsive_type.height, 100000),
			content_wrapper_rect.height
		);

		animate(
			this.content_responsive_wrapper,
			`
                0% {
                    width: ${content_responsive_wrapper_rect.width}px;
                    height: ${content_responsive_wrapper_rect.height}px;
                }
                100% {
                    width: ${this.width}px;
                    height: ${this.height}px;
                }
            `,
			nonull(options.duration, 0),
			() => {
				this.content_responsive_wrapper.style.width = this.width + "px";
				this.content_responsive_wrapper.style.height = this.height + "px";
			}
		);

		//this.content_responsive_wrapper.style.width = height;

		//border-radius: 10px;
		//border: 25px solid #444;
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

			let desktop = block_data.styles.desktop;
			if (desktop) {
				let styles = "";
				Object.entries(desktop).forEach(([prop_css, val]) => {
					// these are needed by the page builder to work properly during animations
					// TODO: consider limiting the list to margins, flex-grow etc. (layout related)
					const prop_js = kebabToSnakeCase(prop_css);
					if (prop_js.includes("margin")) {
						block_data.node.style[prop_js] = val;
					}
					styles += `${prop_css}:${val};`;
				});
				if (styles) {
					const block_styles = `${block_selector}{${styles}}`;
					css_full += block_styles;
					//console.log(block_styles);
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
		/**
		 * @type {blockData}
		 */
		const block_data = this.blocks.find((e) => e.id == block_id);
		//console.log(block_data, node, block_id);

		if (params.type == "custom") {
			block_data.styles.custom = styles;
		} else {
			// TODO: temporary!
			Object.assign(block_data.styles.desktop, styles);
		}

		if (nonull(params.generate_css, true)) {
			this.generateCSS();
		}
	}
}
