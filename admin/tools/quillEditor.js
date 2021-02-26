// // dependencies
// useTool("fileManager");

// const button_styles = [
// 	"primary",
// 	"secondary",
// 	"subtle",
// 	"black",
// 	"black-outline",
// 	"important",
// ];

// const fontAwesomeList = [
// 	"fas fa-address-book",
// 	"far fa-address-book",

// 	"fas fa-angle-double-down",
// 	"fas fa-angle-down",
// 	"fas fa-chevron-down",
// 	"fas fa-arrow-down",
// 	"fas fa-arrow-alt-circle-down",
// 	"far fa-arrow-alt-circle-down",

// 	"fas fa-angle-double-right",
// 	"fas fa-angle-right",
// 	"fas fa-chevron-right",
// 	"fas fa-arrow-right",
// 	"fas fa-arrow-alt-circle-right",
// 	"far fa-arrow-alt-circle-right",

// 	"fas fa-angle-double-left",
// 	"fas fa-angle-left",
// 	"fas fa-chevron-left",
// 	"fas fa-arrow-left",
// 	"fas fa-arrow-alt-circle-left",
// 	"far fa-arrow-alt-circle-left",

// 	"fas fa-angle-double-up",
// 	"fas fa-angle-up",
// 	"fas fa-chevron-up",
// 	"fas fa-arrow-up",
// 	"fas fa-arrow-alt-circle-up",
// 	"far fa-arrow-alt-circle-up",

// 	"fas fa-quote-left",
// 	"fas fa-quote-right",

// 	"fas fa-calendar-alt",
// 	"far fa-calendar-alt",
// 	"fas fa-check",
// 	"fas fa-check-circle",
// 	"far fa-check-circle",
// 	"fas fa-envelope",
// 	"far fa-envelope",
// 	"fas fa-envelope-open",
// 	"far fa-envelope-open",
// 	"fas fa-hand-point-left",
// 	"far fa-hand-point-left",
// 	"fas fa-info-circle",
// 	"fas fa-phone",
// 	"fas fa-phone-square",
// 	"fas fa-question",
// 	"far fa-hourglass",
// 	"fas fa-stopwatch",
// 	"fas fa-book",
// 	"fas fa-book-open",
// 	"fas fa-bookmark",
// 	"far fa-bookmark",
// 	"fas fa-comment",
// 	"far fa-comment",
// 	"fas fa-info",
// 	"fas fa-paperclip",
// 	"fas fa-pencil-alt",
// 	"fas fa-search",
// 	"fas fa-tag",
// 	"fas fa-tags",
// 	"fas fa-tasks",
// 	"fas fa-file",
// 	"far fa-file",
// 	"fas fa-exclamation",
// 	"fas fa-plus",
// 	"fas fa-minus",
// 	"fas fa-user",
// 	"far fa-user",
// 	"fas fa-thumbs-up",
// 	"far fa-thumbs-up",
// 	"fab fa-facebook-f",
// 	"fab fa-facebook-square",
// 	"fab fa-instagram",
// 	"fab fa-twitter",
// 	"fab fa-twitter-square",

// 	"fas fa-bullhorn",
// 	"fas fa-camera",
// 	"fas fa-shopping-cart",
// 	"fas fa-cart-plus",
// 	"fas fa-shipping-fast",
// 	"fas fa-bell",
// 	"far fa-bell",
// 	"fas fa-bolt",
// 	"fas fa-award",
// 	"fas fa-map-marker-alt",
// 	"fas fa-location-arrow",
// 	"fas fa-download",
// 	"fas fa-external-link-alt",
// 	"fas fa-exclamation-triangle",
// 	"fas fa-exclamation-circle",
// 	"fas fa-heart",
// 	"far fa-heart",
// 	"fas fa-smile",
// 	"far fa-smile",
// 	"fas fa-smile-wink",
// 	"far fa-smile-wink",
// 	"fas fa-frown",
// 	"far fa-frown",
// 	"fas fa-thumbs-down",
// 	"far fa-thumbs-down",
// 	"fas fa-star",
// 	"far fa-star",
// 	"fas fa-dice-three",
// ];

// window.quillEditor = {
// 	myColorList: [
// 		"rgb(255, 85, 118)",
// 		"rgb(255,43,0)",
// 		"#FFD700",
// 		"var(--primary-clr)",
// 		"#3f00b5",
// 		"rgb(160,65,112)",
// 		"rgb(65,160,113)",
// 		"#e60000",
// 		"#ff9900",
// 		"#ffff00",
// 		"#008a00",
// 		"#0066cc",
// 		"#9933ff",
// 		"#ffffff",
// 		"#facccc",
// 		"#ffebcc",
// 		"#ffffcc",
// 		"#cce8cc",
// 		"#cce0f5",
// 		"#ebd6ff",
// 		"#bbbbbb",
// 		"#f06666",
// 		"#ffc266",
// 		"#ffff66",
// 		"#66b966",
// 		"#66a3e0",
// 		"#c285ff",
// 		"#888888",
// 		"#a10000",
// 		"#b26b00",
// 		"#b2b200",
// 		"#006100",
// 		"#0047b2",
// 		"#6b24b2",
// 		"#444444",
// 		"#5c0000",
// 		"#663d00",
// 		"#666600",
// 		"#003700",
// 		"#002966",
// 		"#3d1466",
// 		"#000000",
// 	],
// 	callback: null,
// 	lastSelection: { index: 0, length: 0 },
// 	isLastNodeLink: null,
// 	source: null,
// 	wrapper: null,
// 	active_elem: null,
// 	open: (source, params = {}) => {
// 		if (!source) return;
// 		quillEditor.source = source;
// 		quillEditor.callback = params.callback;
// 		var quill_editor_container = $("#quillEditor .quill-editor-container");
// 		var quill_editor_wrapper = $("#quillEditor .quill-wrapper");
// 		removeClassesWithPrefix(quill_editor_container, "align-");
// 		removeClassesWithPrefix(quill_editor_container, "block-padding-");
// 		removeClassesWithPrefix(quill_editor_wrapper, "align-");
// 		removeClassesWithPrefix(quill_editor_wrapper, "block-padding-");

// 		if (params.block) {
// 			quillEditor.block = params.block;

// 			quillEditor.toggleQuillSize(true);
// 			matchClassesWithPrefix(params.block, "align-").forEach((u) => {
// 				quill_editor_container.classList.add(u);
// 			});
// 			matchClassesWithPrefix(params.block, "block-padding-").forEach((u) => {
// 				quill_editor_container.classList.add(u);
// 			});

// 			setNodeImageBackground(
// 				quill_editor_container,
// 				getNodeImageBackground(params.block)
// 			);

// 			var color = getNodeBackgroundColor(params.block);
// 			var opacity = getNodeBackgroundColorOpacity(params.block);
// 			if (opacity > 0) {
// 				setNodeBackgroundColor(quill_editor_container, color);
// 				setNodeBackgroundColorOpacity(quill_editor_container, opacity);
// 			} else {
// 				removeNodeColorBackground(quill_editor_container);
// 			}
// 		} else {
// 			setNodeImageBackground(quill_editor_container);
// 		}

// 		if (params.container) {
// 			quillEditor.block = params.container;

// 			quillEditor.toggleQuillSize(true);
// 			matchClassesWithPrefix(params.container, "align-").forEach((u) => {
// 				quill_editor_wrapper.classList.add(u);
// 			});
// 			matchClassesWithPrefix(params.container, "block-padding-").forEach(
// 				(u) => {
// 					quill_editor_wrapper.classList.add(u);
// 				}
// 			);

// 			setNodeImageBackground(
// 				quill_editor_wrapper,
// 				getNodeImageBackground(params.container)
// 			);

// 			var color = getNodeBackgroundColor(params.container);
// 			var opacity = getNodeBackgroundColorOpacity(params.container);
// 			if (opacity > 0) {
// 				setNodeBackgroundColor(quill_editor_wrapper, color);
// 				setNodeBackgroundColorOpacity(quill_editor_wrapper, opacity);
// 			} else {
// 				removeNodeColorBackground(quill_editor_wrapper);
// 			}
// 		} else {
// 			setNodeImageBackground(quill_editor_wrapper);
// 		}

// 		quillEditor.wasInTable = false;
// 		var qlContainer = $(".quill-editor-container .ql-editor");
// 		qlContainer.innerHTML = source.innerHTML;
// 		qlContainer.style.padding = window.getComputedStyle(source).padding;

// 		setTimeout(() => {
// 			quillEditor.editor.history.clear();
// 			quillEditor.hideCustomQuillButtons();
// 			quillEditor.fixHeight(40);
// 		});

// 		showModal("quillEditor", { source: source });
// 	},
// 	save: () => {
// 		var cursor = $("#quillEditor .ql-cursor");
// 		if (cursor) cursor.remove();

// 		var target = quillEditor.source;
// 		var content = $("#quillEditor .ql-editor").innerHTML;
// 		target.innerHTML = content;
// 		/*var src = document.getElementById(target.id + "-src"); // deprecated?
//     if (src) src.value = content;*/
// 		if (quillEditor.callback) {
// 			quillEditor.callback();
// 		}
// 	},
// 	hideCustomQuillButtons: () => {
// 		$$(".quill-cloud").forEach((e) => {
// 			e.style.display = "";
// 		});
// 	},
// 	isSelectionInNode: (tagName) => {
// 		var sel_node = $(getSelection().focusNode);
// 		if (!sel_node) return false;
// 		if (sel_node.tagName == tagName) return sel_node;
// 		sel_node = sel_node._parent();
// 		if (sel_node.tagName == tagName) return sel_node;
// 		sel_node = sel_node._parent();
// 		if (sel_node.tagName == tagName) return sel_node;
// 		return false;
// 	},
// 	toggleQuillSize: (fromTarget = null) => {
// 		var e = $("#quillEditor .quill-editor-container");
// 		if (fromTarget === null) {
// 			fromTarget = e.style.width == "100%" || e.style.width == "";
// 		}
// 		if (fromTarget && quillEditor.block) {
// 			e.style.width = quillEditor.block.getBoundingClientRect().width + "px";
// 			$(
// 				"#quillEditor .toggle_size"
// 			).innerHTML = `<i class="fas fa-expand"></i>`;
// 		} else {
// 			e.style.width = "100%";
// 			$(
// 				"#quillEditor .toggle_size"
// 			).innerHTML = `<i class="fas fa-compress"></i>`;
// 		}
// 	},
// 	isInTable: (elem) => {
// 		return findParentByTagName(elem, "TABLE");
// 	},
// 	checkIfTable: () => {
// 		var table = quillEditor.isInTable(getSelection().focusNode);
// 		if (table && table.findParentByClassName("quill-cloud")) {
// 			return;
// 		}
// 		var table_menu = $("#quillEditor .table_menu");
// 		if (table) {
// 			var container = $("#quillEditor .quill-wrapper");
// 			table_menu.style.display = "block";
// 			var tr = table.getBoundingClientRect();
// 			var cr = container.getBoundingClientRect();
// 			table_menu.style.left = tr.x - cr.x + "px";
// 			table_menu.style.top = tr.y - cr.y + container.scrollTop + "px";
// 		} else table_menu.style.display = "";
// 	},
// 	markLastSelection: () => {
// 		quillEditor.isLastNodeLink = quillEditor.isSelectionInNode("A");
// 		var s = quillEditor.editor.getSelection();
// 		if (s) quillEditor.lastSelection = s;

// 		quillEditor.wasWasWasInTable = quillEditor.wasWasInTable;
// 		quillEditor.wasWasInTable = quillEditor.wasInTable;
// 		quillEditor.wasInTable = false;
// 		var nativeSelection = getSelection();
// 		if (
// 			nativeSelection &&
// 			findParentByTagName(nativeSelection.anchorNode, "TD") &&
// 			!findParentByClassName(nativeSelection.anchorNode, "quill-cloud")
// 		) {
// 			quillEditor.wasInTable = true;
// 			quillEditor.lastSelecitonInTable = quillEditor.lastSelection;
// 		}

// 		quillEditor.toggleButtonsDisablationInTable(quillEditor.wasInTable);
// 	},

// 	toggleButtonsDisablationInTable: (disabled) => {
// 		$$(".ql-header, .ql-list, .ql-video, .ql-table").forEach((e) => {
// 			e.classList.toggle("ql-btn-disabled", disabled);
// 		});
// 	},

// 	selectHyperLink: () => {
// 		var x = getSelection();
// 		var q = quill.getSelection();
// 		if (x && q && q.length == 0) {
// 			quillEditor.selectText(active_elem);
// 			var q = quill.getSelection();
// 			quill.getFormat();
// 			quill.formatText(q.index, q.length, { myLink: true });
// 		}
// 	},

// 	removeLink: () => {
// 		quillEditor.selectAnything();

// 		var x = getSelection();
// 		var q = quillEditor.editor.getSelection();
// 		if (x && q && q.length == 0)
// 			quillEditor.selectText(quillEditor.active_elem);

// 		$("#quillEditor .ql-myLink").click();
// 		quillEditor.hideCustomQuillButtons();
// 	},

// 	selectText: (node) => {
// 		if (document.body.createTextRange) {
// 			const range = document.body.createTextRange();
// 			range.moveToElementText(node);
// 			range.select();
// 		} else if (window.getSelection) {
// 			const selection = window.getSelection();
// 			const range = document.createRange();
// 			range.selectNodeContents(node);
// 			selection.removeAllRanges();
// 			selection.addRange(range);
// 		} else {
// 			console.warn("Could not select text in node: Unsupported browser.");
// 		}
// 	},

// 	selectAnything: () => {
// 		var ed = $("#quillEditor .quill-editor-container");
// 		var wasTop = ed.scrollTop;

// 		var selection = quillEditor.editor.getSelection();
// 		if (!selection) {
// 			quillEditor.editor.setSelection(
// 				quillEditor.lastSelection.index,
// 				quillEditor.lastSelection.length
// 			);
// 		}

// 		ed.scrollTop = wasTop;
// 	},

// 	insertSpecialChar: (char) => {
// 		quillEditor.selectAnything();
// 		var selection = quillEditor.lastSelection;

// 		quillEditor.editor.insertEmbed(
// 			selection.index,
// 			"customIcon",
// 			{
// 				value: `${char}`,
// 			},
// 			"api"
// 		);

// 		quillEditor.editor.setSelection(selection.index + 1, 0);
// 	},

// 	insertVideo: (src) => {
// 		quillEditor.selectAnything();
// 		var selection = quillEditor.lastSelection;

// 		if (getIdFromYoutubeUrl(src)) {
// 			quillEditor.editor.insertEmbed(
// 				selection.index,
// 				"YTVideo",
// 				{
// 					value: `${src}`,
// 				},
// 				"api"
// 			);
// 		} else {
// 			quillEditor.editor.insertEmbed(
// 				selection.index,
// 				"MyVideo",
// 				{
// 					src: `${src}`,
// 				},
// 				"api"
// 			);
// 		}

// 		quillEditor.editor.setSelection(selection.index + 1, 0);
// 	},

// 	quillImageCallback: (src) => {
// 		//src = "/uploads/df/" + src;
// 		quillEditor.editor.insertEmbed(
// 			quillEditor.lastSelection.index,
// 			"image",
// 			src
// 		);
// 	},

// 	fixQLtooltip: () => {
// 		var tool = $(".ql-tooltip");
// 		if (tool) {
// 			var left = parseInt(tool.style.left);
// 			var top = parseInt(tool.style.top);
// 			if (left < 20) {
// 				tool.style.left = "20px";
// 			}
// 			if (top < 20) {
// 				tool.style.top = "20px";
// 			}
// 			var maxleft =
// 				tool._parent().getBoundingClientRect().width -
// 				tool.getBoundingClientRect().width -
// 				30;
// 			if (left > maxleft) tool.style.left = maxleft + "px";
// 			var maxtop =
// 				tool._parent().getBoundingClientRect().height -
// 				tool.getBoundingClientRect().height -
// 				30;
// 			if (top > maxtop) tool.style.top = maxtop + "px";
// 		}
// 	},

// 	chooseVideoFromGallery: (btn) => {
// 		fileManager.open(null, {
// 			callback: (src) => {
// 				quillEditor.insertVideo(src);
// 				hideModal("putVideo");
// 			},
// 			source: btn,
// 			asset_types: ["video"],
// 		});
// 	},

// 	putVideoBySource: (input, pseudo_form = null) => {
// 		if (!validateForm(pseudo_form ? pseudo_form : "#putVideo")) {
// 			return false;
// 		}
// 		quillEditor.insertVideo(input.value);
// 		input.value = "";
// 		hideModal("putVideo");
// 	},

// 	modifyNode: (prop, v) => {
// 		var n = quillEditor.active_elem;

// 		var isMyVideo = false;
// 		if (n.tagName == "MYVIDEO") {
// 			isMyVideo = true;
// 			n = n._child("video");
// 		}

// 		if (!n) return;
// 		if (["width"].indexOf(prop) != -1) {
// 			n.style[prop] = v;
// 		} else if (prop == "youtube") {
// 			if (isMyVideo) {
// 				n.src = v;
// 			} else {
// 				n.src = getThumbnailFromYoutubeId(getIdFromYoutubeUrl(v));
// 			}
// 		} else if (prop == "mylinkstyle") {
// 			n.className = v;
// 		} else if (prop == "linktitle") {
// 			if (!v) {
// 				v = "…";
// 			}
// 			n.innerHTML = v;
// 		} else if (prop == "buttontitle") {
// 			n._child("span").innerHTML = v;
// 		} else if (prop == "buttonhref") {
// 			n.setAttribute("data-href", v);
// 		} else if (prop == "buttonstyle") {
// 			for (let style of button_styles) {
// 				n.classList.remove(style);
// 			}
// 			n.classList.add("btn");
// 			if (v) {
// 				n.classList.add(v);
// 			}
// 		} else if (prop == "buttonfontsize") {
// 			for (let style of ["medium", "big", "large", "xlarge"]) {
// 				n.classList.remove(style);
// 			}
// 			if (v) {
// 				n.classList.add(v);
// 			}
// 		} else if (prop == "buttonheight") {
// 			for (let style of ["tall"]) {
// 				n.classList.remove(style);
// 			}
// 			if (v) {
// 				n.classList.add(v);
// 			}
// 		} else {
// 			n.setAttribute(prop, v);
// 		}
// 	},

// 	fixHeight: (repeat = 0) => {
// 		var expectYmin = quillEditor.block
// 			? quillEditor.block.getBoundingClientRect().height
// 			: 100000;
// 		var contentHeight = $("#quillEditor .ql-editor").getBoundingClientRect()
// 			.height;
// 		var h = Math.min(
// 			expectYmin,
// 			$("#quillEditor .quill-wrapper").getBoundingClientRect().height -
// 				$("#quillEditor .ql-toolbar.ql-snow").getBoundingClientRect().height -
// 				10
// 		);

// 		$("#quillEditor .quill-editor-container").style.minHeight =
// 			contentHeight < h ? h + "px" : "";

// 		if (repeat > 0) {
// 			requestAnimationFrame(() => {
// 				quillEditor.fixHeight(repeat - 1);
// 			});
// 		}
// 	},

// 	considerUploadingImages() {
// 		if (!fileManager) return;

// 		if (!$("#quillEditor [upload_image]")) {
// 			var counter = 0;
// 			var srcs = [];
// 			var e = [...$$("#quillEditor .ql-editor img")].forEach((e) => {
// 				if (e.src.indexOf("data:image/") == -1) return;
// 				counter++;
// 				e.setAttribute("upload_image", counter);
// 				srcs.push(e.src);
// 			});

// 			if (counter > 0) {
// 				var formData = new FormData();
// 				formData.append("tag", fileManager.defaultTag);
// 				formData.append("base64", JSON.stringify(srcs));
// 				formData.append("search", "");

// 				fileManager.fileAction(formData);
// 			}
// 		}
// 	},
// 	loaded: () => {
// 		var Size = Quill.import("attributors/style/size");
// 		Size.whitelist = [];
// 		for (let i = 0; i < 10; i++) {
// 			Size.whitelist.push(Math.round(Math.pow(1.25, i - 2) * 100) / 100 + "em");
// 		}

// 		Quill.register(Size, true);

// 		let Inline = Quill.import("blots/inline");
// 		let Embed = Quill.import("blots/embed");
// 		let BlockEmbed = Quill.import("blots/block/embed");

// 		class Shadow extends Inline {
// 			static create(value) {
// 				let node = super.create();
// 				node.setAttribute("class", "shadow");
// 				return node;
// 			}
// 		}
// 		Shadow.blotName = "shadow";
// 		Shadow.tagName = "shadow";
// 		Quill.register(Shadow);

// 		class Przycisk extends Inline {
// 			static create(value) {
// 				let node = super.create();
// 				node.setAttribute("class", "przycisk");
// 				return node;
// 			}
// 		}
// 		Przycisk.blotName = "przycisk";
// 		Przycisk.tagName = "przycisk";
// 		Quill.register(Przycisk);

// 		class MyVideo extends Embed {
// 			static create(data) {
// 				let node = super.create();
// 				/*node.setAttribute("src", data.value);
//         node.setAttribute("class", "ql-video");
//         node.setAttribute("controls", true);*/
// 				node.cssText = data.style;
// 				node.innerHTML = `<video controls="true" class='ql-video"' src='${data.src}'></video>`;
// 				return node;
// 			}

// 			deleteAt(index, length) {
// 				super.deleteAt(0, 1);
// 			}

// 			length() {
// 				return 1;
// 			}

// 			static value(node) {
// 				var vid = $(node)._child("video");
// 				return {
// 					/*value: node.getAttribute("src"),
//           width: node.style.width,*/
// 					src: vid.src,
// 					style: node.cssText,
// 				};
// 			}
// 		}
// 		MyVideo.blotName = "MyVideo";
// 		MyVideo.tagName = "myvideo";
// 		Quill.register(MyVideo);

// 		class MyLink extends Inline {
// 			static create(data) {
// 				let node = super.create();
// 				if (data.href) node.setAttribute("href", data.href);
// 				return node;
// 			}

// 			static formats(node) {
// 				return {
// 					href: node.getAttribute("href"),
// 				};
// 			}
// 		}
// 		MyLink.blotName = "myLink";
// 		MyLink.tagName = "a";
// 		Quill.register(MyLink);

// 		class Button extends Embed {
// 			static create(data) {
// 				let node = super.create();
// 				node.innerHTML = def(data.label);
// 				node.className = def(data.class);
// 				node.setAttribute("data-href", def(data.href));
// 				return node;
// 			}

// 			static deleteAt(index, length) {
// 				super.deleteAt(0, 1);
// 			}

// 			static length() {
// 				return 1;
// 			}

// 			static value(node) {
// 				return {
// 					label: node.innerHTML,
// 					class: node.className,
// 					href: node.getAttribute("data-href"),
// 				};
// 			}
// 		}
// 		Button.blotName = "button";
// 		Button.tagName = "button";
// 		Quill.register(Button);

// 		class YTVideo extends Embed {
// 			static create(data) {
// 				var src = data.value;
// 				if (!isYTThumbnail(src)) {
// 					var id = getIdFromYoutubeUrl(src);
// 					if (id) {
// 						src = getThumbnailFromYoutubeId(id);
// 					}
// 				}

// 				let node = super.create();
// 				var style = data.width ? `style='width:${data.width}'` : "";
// 				node.innerHTML = `<img class='ql-video' ${style} src='${src}'>`;
// 				return node;
// 			}

// 			static deleteAt(index, length) {
// 				super.deleteAt(0, 1);
// 			}

// 			static length() {
// 				return 1;
// 			}

// 			static value(node) {
// 				var img = $(node)._child("img");
// 				return {
// 					src: img.getAttribute("src"),
// 					width: img.style.width,
// 				};
// 			}
// 		}
// 		YTVideo.blotName = "YTVideo";
// 		YTVideo.tagName = "yt-video";
// 		Quill.register(YTVideo);

// 		class CustomIcon extends Embed {
// 			static create(data) {
// 				let node = super.create();
// 				node.innerHTML = `<i class='${data.value}'><span>&nbsp;&nbsp;&nbsp;</span></i>`;
// 				return node;
// 			}

// 			static deleteAt(index, length) {
// 				super.deleteAt(0, 1);
// 			}

// 			static length() {
// 				return 1;
// 			}

// 			static value(node) {
// 				var n = $(node)._child("i");
// 				var v = n ? n.className : "";
// 				return { value: v };
// 			}
// 		}
// 		CustomIcon.blotName = "customIcon";
// 		CustomIcon.tagName = "ql-icon";
// 		Quill.register(CustomIcon);

// 		class CustomImg extends Embed {
// 			static create(data) {
// 				let node = super.create();

// 				var alt = "";
// 				if (data.alt) alt = data.alt;
// 				node.setAttribute("alt", alt);

// 				var src = "";
// 				if (data.value) src = data.value;
// 				node.setAttribute("src", src);

// 				var href = "";
// 				if (data.href) href = data.href;
// 				node.setAttribute("data-href", href);

// 				var style = "";
// 				if (data.width) style = `width:${data.width}`;
// 				node.setAttribute("style", style);

// 				return node;
// 			}

// 			static deleteAt(index, length) {
// 				super.deleteAt(0, 1);
// 			}

// 			static length() {
// 				return 1;
// 			}

// 			static value(node) {
// 				return {
// 					value: node.getAttribute("src"),
// 					alt: node.getAttribute("alt"),
// 					href: node.getAttribute("data-href"),
// 					width: node.style.width,
// 				};
// 			}
// 		}
// 		CustomImg.blotName = "customImg";
// 		CustomImg.tagName = "img";
// 		Quill.register(CustomImg);

// 		class BreakLine extends Embed {
// 			static create(data) {
// 				let node = super.create();
// 				return node;
// 			}

// 			static deleteAt(index, length) {
// 				super.deleteAt(0, 1);
// 			}

// 			static length() {
// 				return 1;
// 			}
// 		}
// 		BreakLine.blotName = "breakLine";
// 		BreakLine.tagName = "break-line";
// 		Quill.register(BreakLine);

// 		quillEditor.editor = new Quill(".quill-editor-container", {
// 			scrollingContainer: "#quillEditor .quill-wrapper",
// 			theme: "snow",
// 			modules: {
// 				syntax: true,
// 				toolbar: [
// 					[
// 						{
// 							size: Size.whitelist,
// 						},
// 					],
// 					["bold", "italic", "underline", "strike"],
// 					[
// 						{
// 							color: quillEditor.myColorList,
// 						},
// 						{
// 							background: quillEditor.myColorList,
// 						},
// 					],
// 					[
// 						{
// 							list: "ordered",
// 						},
// 						{
// 							list: "bullet",
// 						},
// 						{
// 							indent: "-1",
// 						},
// 						{
// 							indent: "+1",
// 						},
// 					],
// 					[
// 						{
// 							header: "1",
// 						},
// 						{
// 							header: "2",
// 						},
// 						{
// 							header: "3",
// 						},
// 					],
// 					[
// 						{
// 							align: [],
// 						},
// 					],
// 					["myLink", "button", "image", "video"],
// 					["clean"],
// 					["shadow"],
// 				],
// 				table: true,
// 			},
// 		});

// 		$$(".ql-size .ql-picker-options .ql-picker-item").forEach((e) => {
// 			e.style.fontSize = e.getAttribute("data-value");
// 		});

// 		var toolbar = $("#quillEditor .ql-toolbar.ql-snow");
// 		toolbar._parent()._parent().appendChild(toolbar);

// 		//window.better_table = quill.getModule('better-table');
// 		table = quillEditor.editor.getModule("table");

// 		$("#quillEditor .ql-image").outerHTML += "";
// 		setTimeout(() => {
// 			$("#quillEditor .ql-image").onclick = function () {
// 				fileManager.open(null, {
// 					callback: quillEditor.quillImageCallback,
// 					source: this,
// 					asset_types: ["image"],
// 				});
// 			};
// 		}, 200);

// 		$("#quillEditor .ql-video").outerHTML += "";
// 		setTimeout(() => {
// 			$("#quillEditor .ql-video").onclick = function () {
// 				if (quillEditor.source) {
// 					showModal("putVideo", { source: this });
// 				}
// 			};
// 		}, 200);

// 		$("#quillEditor .ql-button").outerHTML += "";
// 		setTimeout(() => {
// 			$("#quillEditor .ql-button").onclick = function () {
// 				quillEditor.selectAnything();
// 				var selection = quillEditor.lastSelection;

// 				quillEditor.editor.insertEmbed(
// 					selection.index,
// 					"button",
// 					{
// 						label: "Mój link",
// 						class: "btn primary",
// 					},
// 					"api"
// 				);

// 				quillEditor.editor.setSelection(selection.index + 1, 0);
// 			};
// 		}, 200);

// 		var fa = "";

// 		for (let f of fontAwesomeList) {
// 			fa += `<div onclick='quillEditor.insertSpecialChar("${f}")'><i class='${f}'></i></div>`;
// 		}

// 		$("#quillEditor .ql-toolbar").insertAdjacentHTML(
// 			"beforeend",
// 			`
//             <span class="ql-formats">
//                 <button class="ql-table" data-tooltip="Wstaw tabelkę" onclick="table.insertTable(1, 2);" style="white-space: nowrap;width: auto;"><i class="fas fa-table"></i></button>
//             </span>
//             <span class="ql-formats tooltip-wrapper tooltip-icons" onclick="this.classList.toggle('active')">
//                 <i class="fas fa-icons" data-tooltip="Wstaw ikonkę" style="margin-top: 3px;"></i>
//                 <div class="tooltip-content" style='margin-top: 3px;'>
//                     ${fa}
//                 </div>
//             </span>
//         `
// 		);

// 		quillEditor.editor.on("text-change", (delta, oldDelta, source) => {
// 			quillEditor.fixHeight();

// 			var keyPressed = null;
// 			for (a of delta.ops) {
// 				if (a.insert) {
// 					if (a.insert.length === 1 && a.insert != " ") keyPressed = a.insert;
// 					if (a.insert == "\n" && quillEditor.isSelectionInNode("A")) {
// 						setTimeout(() => {
// 							$("#quillEditor .ql-myLink").click();
// 						}, 0);
// 					}
// 				}
// 			}

// 			quillEditor.considerUploadingImages();

// 			$$("#quillEditor .ql-editor a").forEach((e) => {
// 				if (e.innerHTML.length > 2) {
// 					/*if (e.innerHTML.charAt(0) != " ") {
//                         e.innerHTML = " " + e.innerHTML;
//                     }
//                     if (e.innerHTML.charAt(e.innerHTML.length-1) != " ") {
//                         e.innerHTML += " ";
//                     }*/
// 					/*if (e.innerHTML.charAt(1) != " ") {
//                         e.innerHTML = " " + e.innerHTML;
//                     }*/
// 					/*if (e.innerHTML.charAt(e.innerHTML.length-2) != " ") {
//                         e.innerHTML += " ";
//                     }*/
// 				}
// 			});

// 			$$(`[contenteditable="false"] [contenteditable="false"]`).forEach((e) => {
// 				e.outerHTML = e.innerHTML.replace(/﻿/g, "");
// 			});

// 			quillEditor.markLastSelection();

// 			if (keyPressed && false) {
// 				var isNodeLink = quillEditor.isSelectionInNode("A");
// 				var ln = quillEditor.isLastNodeLink;
// 				//console.log(quillEditor.isLastNodeLink, isNodeLink, keyPressed);

// 				var s = getSelection();
// 				if (isNodeLink && s.anchorOffset === 0) {
// 					var i = quillEditor.lastSelection.index + 2;
// 					setTimeout(() => {
// 						quillEditor.editor.setSelection(i, 0);
// 					}, 0);
// 				}

// 				if (ln && !isNodeLink) {
// 					quillEditor.editor.history.undo();
// 					quillEditor.editor.insertText(
// 						quillEditor.lastSelection.index - 1,
// 						" " + keyPressed
// 					);
// 					quillEditor.editor.setSelection(
// 						quillEditor.lastSelection.index + 1,
// 						0
// 					);
// 				}
// 			}

// 			quillEditor.checkIfTable();
// 		});

// 		quillEditor.editor.on("selection-change", () => {
// 			var s = getSelection();
// 			var p = window.lastP;
// 			p = findParentByTagName(s.anchorNode, "P");
// 			var jump = p != window.lastP;
// 			window.lastP = p;

// 			//console.log("["+s.anchorOffset+"]",quillEditor.isLastNodeLink,quillEditor.isSelectionInNode("A"));

// 			if (true) {
// 				if (window.justLeftPressed) {
// 					/*if (quillEditor.isLastNodeLink != quillEditor.isSelectionInNode("A") && s.anchorOffset === 1) {
//                         quillEditor.editor.insertText(quillEditor.lastSelection.index," ");
//                         quillEditor.editor.formatText(quillEditor.lastSelection.index,1,{myLink:false});
//                         quillEditor.editor.setSelection(quillEditor.lastSelection.index+1,0);
//                         quillEditor.isLastNodeLink = quillEditor.isSelectionInNode("A");
//                     }
//                     window.justLeftPressed = false;*/
// 				}

// 				if (window.justRightPressed) {
// 					/*if (jump && quillEditor.isLastNodeLink) {
//                         quillEditor.editor.insertText(quillEditor.lastSelection.index," ");
//                         quillEditor.editor.formatText(quillEditor.lastSelection.index,2,{myLink:false});
//                         quillEditor.editor.setSelection(quillEditor.lastSelection.index+1,0);
//                     }
//                     window.justRightPressed = false;*/
// 				}

// 				quillEditor.markLastSelection();
// 				quillEditor.checkIfTable();
// 			}

// 			quillEditor.markLastSelection();
// 		});

// 		var observer = new MutationObserver((mutations) => {
// 			/*if (!$(".ql-myLink.ql-active")) {
//         var x = getSelection().anchorNode;
//         var cloud = false;
//         if (x) {
//           if (findParentByClassName(x, ["quill-cloud"])) {
//             cloud = true;
//           }
//         }
//         if (!cloud) {
//           quillEditor.hideCustomQuillButtons();
//         }
//       }*/
// 			for (var m of mutations) {
// 				for (var n of m.addedNodes) {
// 					if (quillEditor.wasInTable && n.tagName == "P") {
// 						if (!findParentByTagName(n, "TD") && n._parent()) {
// 							n.remove();
// 						}
// 					}
// 					if (n.tagName == "A" && !n.href) {
// 						if (validURL(n.innerHTML)) {
// 							n.href = n.innerHTML;
// 						}
// 						n.click();
// 					}
// 				}
// 			}
// 			quillEditor.fixQLtooltip();

// 			var x = $("#quillEditor .ql-myLink:not([data-tooltip])");
// 			if (x) {
// 				x.innerHTML =
// 					'<i class="fas fa-link" style="transform: translateY(-2px);"></i>';
// 				x.setAttribute("data-tooltip", "Ustaw zaznaczenie jako link");
// 			}

// 			var x = $("#quillEditor .ql-shadow:not([data-tooltip])");
// 			if (x) {
// 				x.setAttribute("data-tooltip", "Cień");
// 			}

// 			var x = $("#quillEditor .ql-clean:not([data-tooltip])");
// 			if (x) {
// 				x.setAttribute("data-tooltip", "Usuń formatowanie");
// 			}

// 			var x = $("#quillEditor .ql-image:not([data-tooltip])");
// 			if (x) {
// 				x.setAttribute("data-tooltip", "Wstaw zdjęcie");
// 			}

// 			var x = $("#quillEditor .ql-button:not([data-tooltip])");
// 			if (x) {
// 				x.setAttribute("data-tooltip", "Wstaw przycisk");
// 				x.innerHTML = `<div style="padding: 0 3px;font-size: 0.8em;font-weight: 600;height: 15px;width: 21px;position: relative;color: #444;border: 2px solid #444;background: #fff;border-radius: 3px;">
//           <i class="fas fa-mouse-pointer" style="position: absolute;left: 9px;top: 2px;color: white;transform: scale(1.5);"></i>
//           <i class="fas fa-mouse-pointer" style="position: absolute;left: 9px;top: 1px;"></i>
//         </div>`;
// 			}

// 			var x = $("#quillEditor .ql-video:not([data-tooltip])");
// 			if (x) {
// 				x.setAttribute("data-tooltip", "Wstaw film");
// 			}

// 			scaleVideos();

// 			$$("iframe.ql-video").forEach((e) => {
// 				e.outerHTML = `<video src="${e.src}" class="ql-video" controls="true"></video>`;
// 			});

// 			$$("#quillEditor break-line").forEach((e) => {
// 				var n = e._next();
// 				e.classList.toggle(
// 					"break-grow",
// 					(n && n.tagName == "BREAK-LINE") || !n
// 				);
// 			});
// 		});

// 		observer.observe($("#quillEditor"), {
// 			childList: true,
// 			subtree: true,
// 		});

// 		$("#quillEditor .ql-editor").addEventListener("keydown", (e) => {
// 			quillEditor.hideCustomQuillButtons();
// 			if (e.key === "Escape") {
// 				$("#quillEditor .ql-clean").click();
// 			}
// 			if (e.key === "ArrowRight") {
// 				var end =
// 					quillEditor.lastSelection.index + 1 == quillEditor.editor.getLength();
// 				if (quillEditor.isLastNodeLink && end) {
// 					$("#quillEditor .ql-myLink").click();
// 					quillEditor.editor.insertText(quillEditor.lastSelection.index, " ");
// 				}
// 				window.justRightPressed = true;
// 			}
// 			if (e.key === "ArrowLeft") {
// 				var end = quillEditor.lastSelection.index == 0;
// 				if (quillEditor.isLastNodeLink && end) {
// 					quillEditor.editor.insertText(0, " ");
// 					quillEditor.editor.setSelection(0, 0);
// 					quillEditor.editor.formatText(0, 1, { myLink: false });
// 				}
// 				window.justLeftPressed = true;
// 			}
// 			var nativeSelection = getSelection();
// 			if (
// 				quillEditor.wasWasWasInTable ||
// 				quillEditor.wasWasInTable ||
// 				quillEditor.wasInTable
// 			) {
// 				// weird as hell    nativeSelection && findParentByTagName(nativeSelection.anchorNode,"TD") || quillEditor.wasInTable) {

// 				if (e.key === "Enter") {
// 					var s = quillEditor.lastSelecitonInTable.index;

// 					quillEditor.editor.insertEmbed(s, "breakLine", {}, "user");
// 					quillEditor.editor.setSelection(s + 1);
// 					quillEditor.editor.focus();
// 				}
// 			}
// 			if (
// 				nativeSelection &&
// 				findParentByTagName(nativeSelection.anchorNode, "TD")
// 			) {
// 				if (e.key === "Delete") {
// 					var n = $(nativeSelection.focusNode);
// 					var deleted = false;
// 					if (
// 						(n && n.tagName == "BREAK-LINE") ||
// 						(n && n._parent() && n._parent().tagName == "BREAK-LINE")
// 					) {
// 						quillEditor.editor.deleteText(quillEditor.lastSelection.index, 1);
// 						deleted = true;
// 					}
// 					if (!deleted && n) {
// 						n = n._next();
// 						if (
// 							(n && n.tagName == "BREAK-LINE") ||
// 							(n && n._parent() && n._parent().tagName == "BREAK-LINE")
// 						) {
// 							quillEditor.editor.deleteText(quillEditor.lastSelection.index, 1);
// 						}
// 					}
// 				}
// 			}
// 		});

// 		$("#quillEditor").addEventListener("click", (event) => {
// 			if (
// 				findParentByClassName(event.target, "quill-cloud") ||
// 				findParentByClassName(event.target, "ql-active-element")
// 			) {
// 				return;
// 			}
// 			removeClasses("ql-active-element");
// 			quillEditor.hideCustomQuillButtons();
// 			var touchQL = event.target == $(".quill-editor-container");
// 			if (event.toElement == $(".quill-wrapper") || touchQL) {
// 				$("#quillEditor .ql-editor").classList.add("attention");
// 				setTimeout(() => {
// 					$("#quillEditor .ql-editor").classList.remove("attention");
// 				}, 200);
// 			}
// 		});

// 		$("#quillEditor .ql-editor").addEventListener("dblclick", (e) => {
// 			var n = $(e.target);
// 			quillEditor.active_elem = null;

// 			if (
// 				["IMG", "MYVIDEO", "A", "BUTTON"].indexOf(n.tagName) != -1 &&
// 				!n.classList.contains("ql-icon")
// 			) {
// 				n.classList.add("ql-active-element");
// 				quillEditor.active_elem = n;

// 				var cloud = null;
// 				if (n.tagName == "MYVIDEO") {
// 					cloud = $(".video-buttons");
// 					var vid = n._child("video");
// 					cloud._child(".src").value = vid.src;
// 					cloud._child(".width").value = vid.style.width;
// 					cloud._child(".alt").value = vid.getAttribute("alt");
// 				} else if (n.classList.contains("ql-video")) {
// 					cloud = $(".video-buttons");
// 					cloud._child(".src").value = getUrlFromYoutubeId(
// 						getIdFromYoutubeThumbnail(n.src)
// 					);
// 					cloud._child(".width").value = n.style.width;
// 					cloud._child(".alt").value = n.getAttribute("alt");
// 				} else if (n.tagName == "A") {
// 					cloud = $(".my-link");
// 					cloud._child(".href").value = n.href;
// 					cloud._child(".title").value = n.innerHTML;
// 					cloud._child(".alt").value = n.getAttribute("alt");
// 				} else if (n.tagName == "BUTTON") {
// 					cloud = $(".button-options");
// 					cloud._child(".title").value = n.textContent;
// 					cloud._child(".href").value = n.getAttribute("data-href");
// 					cloud._child(".alt").value = n.getAttribute("alt");
// 				} else {
// 					cloud = $(".image-buttons");
// 					cloud._child(".width").value = n.style.width;
// 					cloud._child(".alt").value = n.getAttribute("alt");
// 					cloud._child(".href").value = n.getAttribute("data-href");
// 				}

// 				if (cloud) {
// 					cloud.style.display = "block";

// 					var pr = cloud._parent().getBoundingClientRect();
// 					var er = n.getBoundingClientRect();
// 					var cr = cloud.getBoundingClientRect();

// 					var left = er.x - pr.x + (er.width - cr.width) / 2;
// 					var top = er.y - pr.y - cr.height;

// 					var minLeft = 10;
// 					if (left < minLeft) left = minLeft;
// 					var maxLeft = pr.width - cr.width - 10;
// 					if (left > maxLeft) left = maxLeft;
// 					if (top < 0) top = er.y - pr.y + er.height;
// 					var maxTop = pr.height - cr.height - 10;
// 					if (top > maxTop) top = maxTop;

// 					cloud.style.left = left + "px";
// 					cloud.style.top = top + cloud._parent().scrollTop + "px";

// 					quillEditor.editor.setSelection();
// 				}
// 				return;
// 			}
// 		});

// 		/*var wasY = 0;
//         $("#quillEditor .quill-wrapper").addEventListener("scroll", function(e) {
//             var nowY = e.srcElement.scrollTop;
//             var diff = wasY - nowY;
//             for (m of $$("#quillEditor .quill-cloud, #quillEditor .table_menu")) {
//                 m.style.top = Math.round(+m.style.top.replace(/[^0-9-.]/g, '') + diff) + "px";
//             }
//             wasY = nowY;
//         });*/

// 		window.addEventListener("click", () => {
// 			quillEditor.fixQLtooltip();
// 		});
// 	},
// };

// var button_styles_html = "";

// for (let style of button_styles) {
// 	button_styles_html += `
//     <div onclick="quillEditor.modifyNode('buttonstyle','${style}')" style='display:inline-block'>
//       <div class="btn ${style}">A</div>
//     </div>
//   `;
// }

// registerModalContent(
// 	`
//     <div id="quillEditor" data-expand="true">
//         <div class="modal_body stretch-vertical">
//             <div class="custom-toolbar">
//                 <span class="title">Edytor bloku</span>
//                 <button class="btn secondary toggle_size" onclick="quillEditor.toggleQuillSize();" data-tooltip="Ustaw na szerokość bloku / cały ekran"> <i class="fas fa-expand"></i> </button>
//                 <button class="btn secondary" onclick="showModal('quill_poradnik')">Poradnik <i class="fas fa-info-circle"></i></button>
//                 <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fas fa-times"></i></button>
//                 <button class="btn primary" onclick="quillEditor.save();hideParentModal(this);">Zapisz <i class="fa fa-save"></i></button>
//             </div>
//             <div class="quill-wrapper stretch-vertical">
//                 <div class="quill-editor-container"></div>
//                 <div class="table_menu">
//                     <img onclick="table.insertRowAbove()" src="/img/tableaddtop.png">
//                     <img onclick="table.insertRowBelow()" src="/img/tableaddbottom.png">
//                     <img onclick="table.insertColumnLeft()" src="/img/tableaddleft.png">
//                     <img onclick="table.insertColumnRight()" src="/img/tableaddright.png">
//                     <img onclick="table.deleteRow()" src="/img/tabledeleterow.png">
//                     <img onclick="table.deleteColumn()" src="/img/tabledeletecolumn.png">
//                     <img onclick="table.deleteTable()" src="/img/tabledelete.png">
//                 </div>
//                 <div class="image-buttons quill-cloud">
//                   <table style="width:300px">
//                     <tr>
//                       <td>Szerokość</td>
//                       <td>
//                         <input type='text' autocomplete="off" placeholder='30px, 100%...' class='width field slim' oninput="quillEditor.modifyNode('width',this.value)">
//                       </td>
//                     </tr>
//                     <tr>
//                       <td>Opis ALT</td>
//                       <td>
//                         <input type='text' autocomplete="off" placeholder='' class='alt field slim' oninput="quillEditor.modifyNode('alt',this.value)">
//                       </td>
//                     </tr>
//                     <tr>
//                       <td>Link</td>
//                       <td>
//                         <div class="glue_children">
//                           <input type="text" autocomplete="off" class="href field slim" placeholder='Opcjonalny link' oninput="quillEditor.modifyNode('data-href',this.value)">
//                           <button class="btn primary slim" onclick="window.open($(this)._prev().value);" data-tooltip="Otwórz link w nowej karcie"><i class="fas fa-external-link-alt"></i></button>
//                         </div>
//                       </td>
//                     </tr>
//                   </table>
//                 </div>
//                 <div class="video-buttons quill-cloud">
//                   <table style="width:300px">
//                     <tr>
//                       <td>Żródło</td>
//                       <td>
//                         <div class="glue_children">
//                           <input type="text" autocomplete="off" class="src field slim" placeholder='https://www.youtube.com/watch?v=...' oninput="quillEditor.modifyNode('youtube',this.value)">
//                           <button class="btn primary slim" onclick="window.open($(this)._prev().value);" data-tooltip="Otwórz link w nowej karcie"><i class="fas fa-external-link-alt"></i></button>
//                         </div>
//                       </td>
//                     </tr>
//                     <tr>
//                       <td>Szerokość</td>
//                       <td>
//                         <input type='text' autocomplete="off" placeholder='30px, 100%...' class='width field slim' oninput="quillEditor.modifyNode('width',this.value)">
//                       </td>
//                     </tr>
//                     <tr>
//                       <td>Opis ALT</td>
//                       <td>
//                         <input type='text' autocomplete="off" placeholder='' class='alt field slim' oninput="quillEditor.modifyNode('alt',this.value)">
//                       </td>
//                     </tr>

//                   </table>
//                 </div>
//                 <div class="my-link quill-cloud">
//                     <table style="width:300px">
//                       <tr>
//                         <td>Napis</td>
//                         <td>
//                           <input type="text" autocomplete="off" class="title field slim" oninput="quillEditor.modifyNode('linktitle',this.value)">
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Link</td>
//                         <td>
//                           <div class="glue_children">
//                             <input type="text" autocomplete="off" placeholder="https://google.com" class="href field slim" oninput="quillEditor.modifyNode('href',this.value)" style="flex-grow: 1;">
//                             <button class="btn secondary" onclick="quillEditor.removeLink()" data-tooltip="Usuń link"><i class="fas fa-unlink"></i></button>
//                             <button class="btn primary slim" onclick="window.open($(this)._prev()._prev().value);" data-tooltip="Otwórz link w nowej karcie"><i class="fas fa-external-link-alt"></i></button>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Opis ALT</td>
//                         <td>
//                           <input type='text' autocomplete="off" placeholder='' class='alt field slim' oninput="quillEditor.modifyNode('alt',this.value)">
//                         </td>
//                       </tr>
//                     </table>
//                 </div>
//                 <div class="button-options quill-cloud">

//                     <table style="width:300px">
//                       <tr>
//                         <td>Napis</td>
//                         <td>
//                           <input type="text" autocomplete="off" class="title field slim" oninput="quillEditor.modifyNode('buttontitle',this.value)">
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Link</td>
//                         <td>
//                           <div class="glue_children">
//                             <input type="text" autocomplete="off" placeholder="https://google.com" class="href field slim" oninput="quillEditor.modifyNode('data-href',this.value)" style="flex-grow: 1;">
//                             <button class="btn primary" onclick="window.open($(this)._prev().value);" data-tooltip="Otwórz link w nowej karcie"><i class="fas fa-external-link-alt"></i></button>
//                           </div>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Opis ALT</td>
//                         <td>
//                           <input type='text' autocomplete="off" placeholder='' class='alt field slim' oninput="quillEditor.modifyNode('alt',this.value)">
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Szerokość</td>
//                         <td>
//                           <input type='text' autocomplete="off" placeholder='30px, 100%...' class='width field slim' oninput="quillEditor.modifyNode('width',this.value)">
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Rozmiar</td>
//                         <td>
//                           <select class='fontsize field slim inline' oninput="quillEditor.modifyNode('buttonfontsize',this.value)">
//                             <option value="">XS</option>
//                             <option value="medium">S</option>
//                             <option value="big">M</option>
//                             <option value="large">L</option>
//                             <option value="xlarge">XL</option>
//                           </select>
//                           <select class='height field slim inline' oninput="quillEditor.modifyNode('buttonheight',this.value)">
//                             <option value="">Niski</option>
//                             <option value="tall">Wysoki</option>
//                           </select>
//                         </td>
//                       </tr>
//                       <tr>
//                         <td>Styl</td>
//                         <td>

//                           ${button_styles_html}
//                         </td>
//                       </tr>
//                     </table>
//                 </div>
//             </div>
//         </div>
//         <link href="/admin/tools/quillEditor.css?v=${RELEASE}" rel="stylesheet">
//     </div>
//     `,
// 	//<div class="btn primary slim" onclick="buttonGallery.open(quillEditor.active_elem)">Wybierz <i class="fas fa-paint-brush"></i></div>
// 	() => {
// 		quillEditor.loaded();
// 	}
// );

// registerModalContent(`
//     <div id="putVideo" class="form-spacing">
//         <div class="modal_body" style="width: 100%;max-width: 300px;">
//             <div class="custom-toolbar">
//                 <span class="title">Wstawianie filmu</span>
//                 <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fas fa-times"></i></button>
//             </div>
//             <div>
//               <div class="field-wrapper">
//                 <span class="label">Link do filmu Youtube</span>
//                 <div class="glue_children">
//                     <input type="text" class="field" data-validate="youtube-video">
//                     <button class="btn primary" onclick="quillEditor.putVideoBySource($(this)._prev(), $(this)._parent())">Wstaw</button>
//                 </div>
//               </div>

//               <div class="field-wrapper">
//                 <span class="label">Link do dowolnego filmu</span>
//                 <div class="glue_children">
//                     <input type="text" class="field" data-validate="">
//                     <button class="btn primary" onclick="quillEditor.putVideoBySource($(this)._prev(), $(this)._parent())">Wstaw</button>
//                 </div>
//               </div>

//               <span class="label">
//                 Wybierz z galerii filmów
//                 <button class="btn primary" onclick="quillEditor.chooseVideoFromGallery(this);">Wybierz</button>
//               </span>

//             </div>
//         </div>
//     </div>
// `);
