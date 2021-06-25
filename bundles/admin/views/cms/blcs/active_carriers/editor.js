/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "active_carriers",
		icon: html`<i class="fas fa-shipping-fast"></i>`,
		label: html`Aktywni przewoźnicy`,
		standalone: true,
		group: "module",
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "active_carriers",
			settings: {
				active_carriers_theme: "light",
			},
		},
		rerender_on: ["settings.active_carriers_theme"],
		backend_render: true,
	});

	piep_cms_manager.registerProp({
		name: "active_carriers",
		type_groups: ["advanced"],
		blc_groups: [{ module_names: ["active_carriers"], priority: 100 }],
		menu_html: html`
			<span class="label">Motyw aktywnych przewoźników</span>
			<div class="pretty_radio" data-blc_prop="settings.active_carriers_theme" style="--columns:2">
				<div class="checkbox_area">
					<p-checkbox data-value="light"></p-checkbox>
					<span>Jasny</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="dark"></p-checkbox>
					<span>Ciemny</span>
				</div>
			</div>
		`,
	});
}
