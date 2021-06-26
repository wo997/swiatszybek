/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "view_product_images_variants_buy",
		icon: html`<i class="fas fa-cube"></i>`,
		label: html`Produkt`,
		single_usage: true,
		width_schema: "has_content",
		tooltip: "(Zdjęcia, wybór wariantów, kup teraz)",
		nonclickable: true,
		group: "module",
		page_type: "general_product",
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "view_product_images_variants_buy",
		},
		rerender_on: [],
		render_html: (v_node) => {
			return html`<div class="empty_module">Galeria zdjęć produktu, wybór wariantów, przycisk "kup teraz"</div>`;
		},
	});
}
