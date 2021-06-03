/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "html_code",
		blc_groups: [
			{
				module_names: ["html_code"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Kod HTML</div>
			<textarea class="field scroll_panel" data-blc_prop="settings.html_code" style="height:200px"></textarea>
		`,
	});
}

{
	piep_cms_manager.registerBlcSchema({
		id: "html_code",
		icon: html`<i class="fas fa-code"></i>`,
		label: html`Kod HTML`,
		nonclickable: true,
		group: "module",
		is_advanced: true,
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "html_code",
		},
		rerender_on: ["settings.html_code"],
		render: (v_node) => {
			let body = html`<div class="empty_module">Pusty blok HTML</div>`;
			if (v_node.settings.html_code) {
				body = v_node.settings.html_code;
			}
			return body;
		},
	});
}
