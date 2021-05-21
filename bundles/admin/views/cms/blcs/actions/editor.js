/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerFloatingProp({
		name: "layout_btn",
		menu_html: html`
			<button class="btn transparent small layout_btn" data-tooltip="Edytuj wymiary, marginesy, itd...">
				<i class="fas fa-ruler-combined filter_icon"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".layout_btn")) {
					piep_cms.editLayout();
				}
			});
		},
	});

	piep_cms_manager.registerFloatingProp({
		name: "move_btn",
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
				matcher: (v_node_data) => {
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
		menu_html: html`
			<button class="btn transparent small remove_btn" data-tooltip="Usuń blok">
				<i class="fas fa-trash"></i>
			</button>
		`,
		init: (piep_cms) => {
			piep_cms.container.addEventListener("click", (ev) => {
				const target = $(ev.target);
				if (target._parent(".remove_btn")) {
					piep_cms.removeVNodes([piep_cms.focus_node_vid]);
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
