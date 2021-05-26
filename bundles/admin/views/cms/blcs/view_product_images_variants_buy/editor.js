/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "view_product_images_variants_buy",
		icon: html`<i class="fas fa-cube"></i>`,
		label: html`Produkt`,
		single_usage: true,
		tooltip: "(Zdjęcia, wybór wariantów, kup teraz)",
		nonclickable: true,
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
		render: (v_node) => {
			return html`<div class="empty_module" data-container_queries="">Galeria zdjęć produktu, wybór wariantów, przycisk "kup teraz"</div>`;
		},
	});
}
