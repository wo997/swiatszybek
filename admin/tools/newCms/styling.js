/* js[tool_newCms] */

class blockData {
	id;
	node;
	own_styles;
}

class NewCmsStyling {
	constructor(newCms, node) {
		/** @type {NewCms} */
		this.newCms = newCms;
		this.node = node;
		this.init();
	}

	init() {
		/**
		 * @type {blockData[]}
		 */
		this.blocks = [];

		this.setAllRegisteredBlocks();
		this.registerMissingBlocks();
		this.generateCSS();
	}

	setAllRegisteredBlocks() {
		this.newCms.content_node.findAll(".newCms_block").forEach((node) => {
			const block_id = this.getBlockId(node);

			if (!block_id) {
				return;
			}

			this.blocks.push({
				id: block_id,
				block: block,
			});
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

			// TODO: fetch styles from... somewhere, like a node with big json in html
			this.blocks.push({
				id: block_id,
				node: node,
			});
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
		for (const block of this.blocks) {
			console.log(block);

			let own_styles = block.own_styles;
			if (!own_styles) {
				continue;
			}
			const block_class_name = this.getBlockClassName(block.id);
			own_styles = own_styles.replace(/&/g, `.${block_class_name}`);

			css_full += own_styles;
		}
		//console.log(css_full);
		this.node.innerHTML = css_full;
	}
}
