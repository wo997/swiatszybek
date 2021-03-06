/* js[piep_cms_dependencies] */

{
	piep_cms_manager.registerBlcSchema({
		id: "product_list",
		icon: html`<i class="fas fa-cubes"></i>`,
		label: html`Lista produktów`,
		standalone: true,
		layout_schema: "has_content",
		group: "module",
		v_node: {
			tag: "div",
			id: -1,
			styles: {},
			classes: [],
			attrs: {},
			module_name: "product_list",
			settings: {
				product_list_count: 30,
				product_list_layout: "slider",
				product_list_display_what: "custom",
				product_list_only_discount: "0",
			},
		},
		rerender_on: [
			"settings.product_list_count",
			"settings.product_list_layout",
			"settings.product_list_sort",
			"settings.product_list_category_ids_csv",
			"settings.product_list_only_discount",
			"settings.product_list_initial_count",
		],
		backend_render: true,
	});

	piep_cms_manager.registerProp({
		name: "product_list",
		type_groups: ["advanced"],
		blc_groups: [{ module_names: ["product_list"], priority: 100 }],
		menu_html: html`
			<span class="label">Maksymalna ilość produktów</span>
			<input class="field" data-blc_prop="settings.product_list_count" />

			<span class="label">Wstępna ilość produktów (optymalizacja)</span>
			<input class="field" data-blc_prop="settings.product_list_initial_count" />

			<span class="label">Układ produktów</span>
			<div class="pretty_radio" data-blc_prop="settings.product_list_layout" style="--columns:2">
				<div class="checkbox_area">
					<p-checkbox data-value="slider"></p-checkbox>
					<span>Slajder</span>
				</div>
				<div class="checkbox_area">
					<p-checkbox data-value="grid"></p-checkbox>
					<span>Siatka</span>
				</div>
			</div>

			<span class="label">Wyświetlaj produkty</span>
			<div class="pretty_radio" data-blc_prop="settings.product_list_display_what" style="--columns:1">
				<div class="checkbox_area">
					<p-checkbox data-value="custom"></p-checkbox>
					<span>Dowolne kategorie i sortowanie</span>
				</div>
				${pageable_data.page_type === "general_product"
					? html`
							<div class="checkbox_area">
								<p-checkbox data-value="general_product"></p-checkbox>
								<span>Z tych samych kategorii co przeglądany produkt</span>
							</div>
					  `
					: ""}
			</div>

			<div class="case_display_custom">
				<div class="label">Sortuj listę produktów</div>
				<select class="field" data-blc_prop="settings.product_list_sort">
					<option value="bestsellery">Bestsellery</option>
					<option value="najnowsze">Najnowsze</option>
					<option value="ceny-rosnaco">Ceny rosnąco</option>
					<option value="ceny-malejaco">Ceny malejąco</option>
				</select>

				<div class="label">
					<span class="bold" style="color:var(--clr_buynow)">Tylko PROMOCJE</span>
				</div>
				<p-checkbox data-blc_prop="settings.product_list_only_discount"></p-checkbox>

				<div class="label">
					Kategorie produktów
					<button class="btn primary small choose_product_categories_btn">Wybierz</button>
				</div>
				<input class="hidden" data-blc_prop="settings.product_list_category_ids_csv" />

				<div class="scroll_panel scroll_preview categories_label" style="max-height:200px;cursor:pointer"></div>
			</div>
		`,
		init: (piep_cms, product_list_wrapper) => {
			const categories_input = product_list_wrapper._child(`[data-blc_prop="settings.product_list_category_ids_csv"]`);
			const what_categories_label = product_list_wrapper._child(`.categories_label`);
			const choose_product_categories_btn = product_list_wrapper._child(".choose_product_categories_btn");
			const display_what_input = product_list_wrapper._child(`[data-blc_prop="settings.product_list_display_what"]`);
			const case_display_custom = product_list_wrapper._child(`.case_display_custom`);

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

			display_what_input.addEventListener("value_set", () => {
				const display_what = display_what_input._get_value();
				case_display_custom.classList.toggle("hidden", display_what !== "custom");
			});
		},
	});
}
