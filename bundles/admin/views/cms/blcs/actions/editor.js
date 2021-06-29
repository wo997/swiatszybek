/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerFloatingProp({
		name: "move_blc_btn",
		blc_groups: [{ match_tag: piep_cms_manager.match_textables, exclude: true }],
		menu_html: html`
			<button class="btn transparent small move_blc_btn" data-tooltip="Przemieść blok">
				<i class="fas fa-arrows-alt"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".move_blc_btn")) {
					piep_cms.grabBlock({ type: "move" });
				}
			});
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "copy_blc_btn",
		menu_html: html`
			<button class="btn transparent small copy_blc_btn" data-tooltip="Dodaj do schowka">
				<i class="fas fa-copy"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				const copy_blc_btn = target._parent(".copy_blc_btn");
				if (copy_blc_btn) {
					piep_cms.clipboard.copyWhateverIsSelected(copy_blc_btn);
				}
			});
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "remove_blc_btn",
		//blc_groups: [{ match_tag: piep_cms_manager.match_textables, exclude: true }],
		menu_html: html`
			<button class="btn transparent small remove_blc_btn" data-tooltip="Usuń blok">
				<i class="fas fa-trash"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".remove_blc_btn")) {
					if (piep_cms.text_selection) {
						piep_cms.removeTextInSelection();
						const fvid = piep_cms.text_selection.focus_vid;
						piep_cms.text_selection = undefined;
						piep_cms.update({ all: true });
						piep_cms.pushHistory(`remove_blc_${fvid}`);
					} else {
						piep_cms.removeVNodes([piep_cms.focus_node_vid]);
						piep_cms.update({ all: true });
						piep_cms.pushHistory(`remove_blc_${piep_cms.focus_node_vid}`);
					}
					piep_cms.setFocusNode(undefined);
				}
			});
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "unselect_everything",
		menu_html: html`
			<button class="btn transparent small unselect_everything" data-tooltip="Odznacz element">
				<i class="fas fa-times"></i>
			</button>
		`,
	});
}
