/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "template_hook_name",
		blc_groups: [
			{
				module_names: ["template_hook"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">
				Nazwa sekcji
				<div class="hover_info">Opisz co pojawi się w sekcji, np.: Opis produktu</div>
			</div>
			<input class="field" data-blc_prop="settings.template_hook_name" />
		`,
	});

	piep_cms_manager.registerProp({
		name: "template_hook_id",
		blc_groups: [
			{
				module_names: ["template_hook"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">
				ID sekcji
				<div class="hover_info">Unikalny identyfikator, np.: product_description</div>
			</div>
			<input class="field" data-blc_prop="settings.template_hook_id" />
		`,
	});
}

{
	piep_cms_manager.registerBlcSchema({
		id: "template_hook",
		icon: html`<i class="fas fa-anchor"></i>`,
		label: html`Sekcja szablonu`,
		v_node: {
			tag: "section",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "template_hook",
		},
		rerender_on: ["settings.template_hook_name", "settings.template_hook_id"],
		render: (v_node) => {
			let body = html`
				<div class="empty_module">
					<i class="fas fa-anchor"></i> Sekcja szablonu
					<p class="hover_info">Tutaj pojawią się treści dodane w podrzędnej stronie (np. produktu) lub szablonie</p>
					<br />
					Nazwa: ${def(v_node.settings.template_hook_name, "BRAK")} <br />
					ID: ${def(v_node.settings.template_hook_id, "BRAK")}
				</div>
			`;
			return body;
		},
	});
}
