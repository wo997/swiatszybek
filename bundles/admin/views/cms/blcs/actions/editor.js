/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerFloatingProp({
		name: "move_btn",
		blc_groups: [{ match_tag: piep_cms_manager.match_textables, exclude: true }],
		menu_html: html`
			<button class="btn transparent small move_btn" data-tooltip="Przemieść blok">
				<i class="fas fa-arrows-alt"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".move_btn")) {
					setTimeout(() => {
						piep_cms.grabBlock({ type: "move" });
					});
				}
			});
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "copy_btn",
		menu_html: html`
			<button class="btn transparent small copy_btn" data-tooltip="Skopiuj blok">
				<i class="fas fa-copy"></i>
			</button>
		`,
		blc_groups: [
			{
				matcher: (v_node_data, piep_cms) => {
					if (piep_cms.isTextable(v_node_data.v_node)) {
						return false;
					}
					const blc_schema = piep_cms_manager.blcs_schema.find((b) => b.id === v_node_data.v_node.module_name);
					if (blc_schema && blc_schema.single_usage) {
						return false;
					}
					return true;
				},
			},
		],
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".copy_btn")) {
					const v_node = piep_cms.getVNodeById(piep_cms.focus_node_vid);
					if (!v_node) {
						return;
					}
					setTimeout(() => {
						// otherwise would be released immediately
						piep_cms.grabBlockFromVNode(v_node);
					});
				}
			});
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "remove_btn",
		blc_groups: [{ match_tag: piep_cms_manager.match_textables, exclude: true }],
		menu_html: html`
			<button class="btn transparent small remove_blc_btn" data-tooltip="Usuń blok">
				<i class="fas fa-trash"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".remove_blc_btn")) {
					const remove_vids = [piep_cms.focus_node_vid];

					for (const vid of piep_cms.getAllTextSelectionVids()) {
						const v_node_data = piep_cms.getVNodeDataById(vid);
						if (v_node_data) {
							const parent = v_node_data.parent_v_nodes[0];
							remove_vids.push(parent.id);
						}
					}

					piep_cms.removeVNodes(remove_vids.filter(onlyUnique));
					piep_cms.update({ all: true });
					piep_cms.setFocusNode(undefined);

					piep_cms.pushHistory(`remove_blc_${piep_cms.focus_node_vid}`);
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
