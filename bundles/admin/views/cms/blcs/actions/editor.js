/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerFloatingProp({
		name: "layout_btn",
		menu_html: html`
			<button class="btn transparent small layout_btn" data-tooltip="Edytuj wymiary, marginesy, itd...">
				<i class="fas fa-ruler-combined filter_icon"></i>
			</button>
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "move_btn",
		menu_html: html`
			<button class="btn transparent small move_btn" data-tooltip="Przemieść blok">
				<i class="fas fa-arrows-alt"></i>
			</button>
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "copy_btn",
		menu_html: html`
			<button class="btn transparent small copy_btn" data-tooltip="Skopiuj blok">
				<i class="fas fa-copy"></i>
			</button>
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "remove_btn",
		menu_html: html`
			<button class="btn transparent small remove_btn" data-tooltip="Usuń blok">
				<i class="fas fa-trash"></i>
			</button>
		`,
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
