/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "product_list",
		icon: html`<i class="fas fa-cubes"></i>`,
		label: html`Lista produktów`,
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "product_list",
		},
		rerender_on: ["settings.product_list_sort", "settings.product_list_category_ids_csv"],
		render: (v_node) => {
			return undefined;
		},
	});

	piep_cms_manager.registerProp({
		name: "product_list_sort",
		type_groups: ["advanced"],
		blc_groups: [{ module_names: ["product_list"], priority: 100 }],
		menu_html: html`
			<div class="label">Sortuj listę produktów</div>
			<select class="field" data-blc_prop="settings.product_list_sort">
				<option value="bestsellery">Bestsellery</option>
				<option value="najnowsze">Najnowsze</option>
				<option value="ceny-rosnaco">Ceny rosnąco</option>
				<option value="ceny-malejaco">Ceny malejąco</option>
			</select>

			<div class="label">
				Kategorie produktów
				<button class="btn primary small choose_product_categories_btn">Wybierz</button>
			</div>
			<input class="hidden" data-blc_prop="settings.product_list_category_ids_csv" />
			<div class="scroll_panel scroll_preview product_list_categories_label" style="max-height:200px;cursor:pointer"></div>
		`,
		init: (piep_cms) => {
			const categories_input = piep_cms.side_menu._child(`[data-blc_prop="settings.product_list_category_ids_csv"]`);
			const what_categories_label = piep_cms.side_menu._child(`.product_list_categories_label`);
			const choose_product_categories_btn = piep_cms.side_menu._child(".choose_product_categories_btn");

			const getCategoryIds = () => {
				/** @type {string} */
				const category_ids_csv = categories_input._get_value();
				const category_ids = category_ids_csv
					.split(",")
					.map((e) => +e)
					.filter((e) => e);

				return category_ids;
			};
			const choose = () => {
				getSelectProductCategoriesModal()._show(
					{
						category_ids: getCategoryIds(),
						close_callback: (category_ids) => {
							categories_input._set_value(category_ids.join(","));
						},
					},
					{ source: choose_product_categories_btn }
				);
			};

			what_categories_label.addEventListener("click", choose);
			choose_product_categories_btn.addEventListener("click", choose);
			categories_input.addEventListener("value_set", () => {
				const category_ids = getCategoryIds();
				what_categories_label._set_content(
					category_ids.length === 0
						? "Wszystkie produkty"
						: product_categories
								.filter((c) => category_ids.includes(c.product_category_id))
								.map((c) => c.__category_path_names_csv.replace(/,/g, " ― "))
								.join("<br>")
				);
			});
		},
	});
}
