/* js[tool_newCms] */

class NewCmsStyling {
	constructor(newCms) {
		/** @type {NewCms} */
		this.newCms = newCms;
		this.init();
	}

	init() {
		this.blocks = [];

		this.setAllRegisteredBlocks();
		this.registerMissingBlocks();
	}

	setAllRegisteredBlocks() {
		this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
			const match_block_id = block.className.match(/block_\d+/);

			if (!match_block_id) {
				return;
			}

			const block_id = match_block_id[0];
			this.blocks.push({
				id: block_id,
				block: block,
			});
		});
	}

	registerMissingBlocks() {
		this.newCms.content_node.findAll(".newCms_block").forEach((block) => {
			const match_block_id = block.className.match(/block_\d+/);

			if (match_block_id) {
				return;
			}

			const block_id =
				this.blocks.reduce(
					(a, b) => {
						return a.id > b.id ? a : b;
					},
					{ id: 0 }
				).id + 1;
			block.classList.add(`block_${block_id}`);

			this.blocks.push({
				id: block_id,
				block: block,
			});
		});
	}
}
