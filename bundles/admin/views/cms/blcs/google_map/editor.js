/* js[piep_cms_dependencies] */
{
	piep_cms_manager.registerProp({
		name: "google_map_embed_code",
		blc_groups: [
			{
				module_names: ["google_map"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Kod umieszczania mapy google</div>
			<textarea class="field scroll_panel" data-blc_prop="settings.google_map_embed_code" style="height:100px"></textarea>
		`,
	});
}

{
	piep_cms_manager.registerBlcSchema({
		id: "google_map",
		icon: html`<i class="fas fa-map-marked-alt"></i>`,
		label: html`Mapa Google`,
		group: "module",
		nonclickable: true,
		layout_schema: "has_content",
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "google_map",
		},
		rerender_on: ["settings.google_map_embed_code"],
		render_html: (v_node) => {
			let body = html`<div class="empty_module">Mapa google</div>`;

			/** @type {string} */
			const google_map_embed_code = v_node.settings.google_map_embed_code;
			if (google_map_embed_code) {
				const match_src = google_map_embed_code.match(/src=".*?"/);
				if (match_src) {
					const src = match_src[0];
					body = html`<iframe ${src} allowfullscreen="" loading="lazy"></iframe>`;
				}
			}
			return body;
		},
	});
}
