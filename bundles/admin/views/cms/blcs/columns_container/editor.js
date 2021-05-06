/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "columns_container_layout_type",
		blc_groups: [
			{
				has_classes: ["columns_container"],
				priority: 10,
			},
		],
		type_groups: ["layout"],
		menu_html: html`
			<div class="label">Typ układu</div>
			<div class="pretty_radio pretty_blue flex columns_2 spiky" data-blc_prop="settings.layout_type">
				<div class="checkbox_area" data-tooltip="Typ zalecany.<br>Szerokości kolumn wyrażone procentowo.">
					<p-checkbox data-value="basic"></p-checkbox>
					Podstawowy
				</div>
				<div class="checkbox_area" data-tooltip="Dowolne szerokości kolumn">
					<p-checkbox data-value="advanced"></p-checkbox>
					Zaawansowany
				</div>
			</div>
		`,
	});
}
