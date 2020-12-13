/* js[tool_newCms] */

class NewCmsQuillEditor {
	color_list = [
		"rgb(255, 85, 118)",
		"rgb(255,43,0)",
		"#FFD700",
		"var(--primary-clr)", // TODO: primary color comes from admin, not front, weird glitch, might wanna abandon or let the use prepare color list for his needs in other theme tab
		"#3f00b5",
		"rgb(160,65,112)",
		"rgb(65,160,113)",
		"#e60000",
		"#ff9900",
		"#ffff00",
		"#008a00",
		"#0066cc",
		"#9933ff",
		"#ffffff",
		"#facccc",
		"#ffebcc",
		"#ffffcc",
		"#cce8cc",
		"#cce0f5",
		"#ebd6ff",
		"#bbbbbb",
		"#f06666",
		"#ffc266",
		"#ffff66",
		"#66b966",
		"#66a3e0",
		"#c285ff",
		"#888888",
		"#a10000",
		"#b26b00",
		"#b2b200",
		"#006100",
		"#0047b2",
		"#6b24b2",
		"#444444",
		"#5c0000",
		"#663d00",
		"#666600",
		"#003700",
		"#002966",
		"#3d1466",
		"#000000",
	];

	constructor(newCms, node) {
		/** @type {NewCms} */
		this.newCms = newCms;
		this.node = node;

		var Size = Quill.import("attributors/style/size");
		Size.whitelist = [];
		for (let i = 0; i < 10; i++) {
			Size.whitelist.push(Math.round(Math.pow(1.25, i - 2) * 100) / 100 + "em");
		}

		this.editor = new Quill(node, {
			theme: "snow",
			modules: {
				syntax: true,
				toolbar: [
					[
						{
							size: Size.whitelist,
						},
					],
					["bold", "italic", "underline", "strike"],
					[
						{
							color: this.color_list,
						},
						{
							background: this.color_list,
						},
					],
					[
						{
							list: "ordered",
						},
						{
							list: "bullet",
						},
						{
							indent: "-1",
						},
						{
							indent: "+1",
						},
					],
					[
						{
							header: "1",
						},
						{
							header: "2",
						},
						{
							header: "3",
						},
					],
					[
						{
							align: [],
						},
					],
					["clean"],
				],
				table: false,
			},
		});

		this.ql_node = this.node.find(".ql-editor");
		this.ql_node.classList.add("field");

		this.newCms.container.addEventListener(
			IS_MOBILE ? "click" : "mousedown",
			(event) => {
				// idk why we have this but it wont hurt
				this.newCms.updateMouseCoords(event);
			}
		);

		this.any_changes = false;
		this.change_from_cms = false;

		this.editor.on("text-change", (delta, oldDelta, source) => {
			if (this.newCms.edit_block.edit_node) {
				const block_type = this.newCms.edit_block.edit_node.getAttribute(
					"data-block"
				);
				if (block_type == "quill_editor") {
					this.newCms.edit_block.edit_node
						.find(".newCms_block_content")
						.setContent(this.ql_node.innerHTML);

					if (!this.change_from_cms) {
						this.any_changes = true;
					}
				}
			}
		});

		this.newCms.container.addEventListener(
			IS_MOBILE ? "touchstart" : "mousemove",
			(event) => {
				this.newCms.updateMouseCoords(event);
				if (!this.newCms.mouse_target.findParentNode(this.newCms.sidebar)) {
					this.saveChanges();
				}
			}
		);

		this.newCms.container.addEventListener("click", (event) => {
			this.newCms.updateMouseCoords(event);
			if (!this.newCms.mouse_target.findParentNode(this.node)) {
				this.saveChanges();
			}
		});
	}

	// TODO: it should be a "property" of sidebar to delay the saving I think
	saveChanges() {
		if (!this.any_changes) {
			return;
		}
		this.any_changes = false;
		this.newCms.contentChange();
	}

	setEditorContent(html) {
		this.any_changes = false;
		this.change_from_cms = true;
		this.ql_node.setContent(html);
		setTimeout(() => {
			// sry!
			this.change_from_cms = false;
		}, 0);
	}
}
