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
		name: "remove_btn",
		menu_html: html`
			<button class="btn transparent small remove_btn" data-tooltip="Usuń blok">
				<i class="fas fa-trash"></i>
			</button>
		`,
	});

	piep_cms_manager.registerFloatingProp({
		name: "hide_menu_btn",
		menu_html: html`
			<button class="btn transparent small hide_menu_btn" data-tooltip="Ukryj menu">
				<i class="fas fa-times"></i>
			</button>
		`,
	});
}
