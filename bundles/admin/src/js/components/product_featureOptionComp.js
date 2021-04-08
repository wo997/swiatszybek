/* js[admin] */

/**
 * @typedef {{
 * product_feature_id?: number
 * product_feature_option_id: number
 * data_type?: string
 * value?: string
 * double_value?: number
 * double_base?: string
 * unit_id?: string
 * datetime_value?: string
 * text_value?: string
 * save_db_timeout?: number
 * saving_db?: boolean
 * physical_measure?: string
 * } & ListCompRowData} Product_FeatureOptionCompData
 *
 * @typedef {{
 * _data: Product_FeatureOptionCompData
 * _set_data(data?: Product_FeatureOptionCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  option_name: PiepNode
 *  double_value: PiepNode
 *  physical_value_wrapper: PiepNode
 *  physical_value_input: PiepNode
 *  physical_value_unit: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_FeatureOptionComp
 */

/**
 * @param {Product_FeatureOptionComp} comp
 * @param {*} parent
 * @param {Product_FeatureOptionCompData} data
 */
function product_featureOptionComp(
	comp,
	parent,
	data = {
		product_feature_option_id: -1,
		product_feature_id: -1,
	}
) {
	let last_saved_product_feature_option;

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				comp._children(`[data-data_type]`).forEach((e) => {
					e.classList.toggle("hidden", e.dataset.data_type != data.data_type);
				});

				if (data.data_type === "double_value") {
					const physical_measure_data = physical_measures[data.physical_measure];
					if (physical_measure_data && physical_measure_data.units && physical_measure_data.units.length > 0) {
						const options = physical_measure_data.units
							.map((unit) => {
								return html`<option value="${unit.id}">${unit.name}</option>`;
							})
							.join("");

						const unit_picker = comp._nodes.physical_value_unit;
						unit_picker._set_content(options);
						unit_picker._set_value(data.unit_id, { quiet: true });
						if (!data.unit_id) {
							setTimeout(() => {
								comp._data.unit_id = unit_picker._get_value();
								comp._render();
							});
						}

						comp._nodes.physical_value_wrapper.classList.remove("hidden");
						comp._nodes.double_value.classList.add("hidden");
					} else {
						comp._nodes.physical_value_wrapper.classList.add("hidden");
						comp._nodes.double_value.classList.toggle("hidden", def(data.data_type, "").endsWith("_list"));
					}
				} else {
					comp._nodes.physical_value_wrapper.classList.add("hidden");
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="title inline" data-data_type="text_list" html="{${data.value}}"></div>
			<input class="field small inline save_to_db" data-data_type="text_value" data-bind="{${data.text_value}}" />
			<input class="field small inline default_datepicker" data-data_type="datetime_value" data-bind="{${data.datetime_value}}" />
			<input
				class="field small inline save_to_db"
				inputmode="numeric"
				data-number
				data-data_type="double_value"
				data-bind="{${data.double_value}}"
				data-node="{${comp._nodes.double_value}}"
			/>
			<div class="glue_children" data-node="{${comp._nodes.physical_value_wrapper}}">
				<input
					class="field small inline"
					inputmode="numeric"
					data-number
					data-node="{${comp._nodes.physical_value_input}}"
					data-bind="{${data.double_base}}"
					data-input_delay="500"
				/>
				<select
					class="field inline blank unit_picker"
					data-node="{${comp._nodes.physical_value_unit}}"
					data-bind="{${data.unit_id}}"
				></select>
			</div>
			<div style="margin-left:auto">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>
		`,
		initialize: () => {
			/** @type {ListComp} */
			// @ts-ignore
			const list = comp._parent_comp;

			/** @type {ProductComp} */
			// @ts-ignore
			const product_comp = list._parent_comp._parent_comp._parent_comp;

			list.addEventListener("remove_row", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				if (detail.res.removed || !comp._data) {
					return;
				}

				if (detail.row_index !== comp._data.row_index) {
					return;
				}

				detail.res.removed = true;

				const pfoi = product_comp._data.product_feature_option_ids;
				const id = pfoi.indexOf(comp._data.product_feature_option_id);
				if (id !== -1) {
					pfoi.splice(id, 1);
				}
				product_comp._render();
			});

			list.addEventListener("move_row", (ev) => {
				// @ts-ignore
				const detail = ev.detail;
				if (detail.res.moved || !comp._data) {
					return;
				}

				const from_id = detail.from;
				if (from_id !== comp._data.row_index) {
					return;
				}

				detail.res.moved = true;

				const pfoi = product_comp._data.product_feature_option_ids;
				const id = pfoi.indexOf(comp._data.product_feature_option_id);
				if (id !== -1) {
					// swaping is possible because we made sure that the data options are always next each other
					const other_id = id + detail.to - from_id;

					const from = clamp(0, id, pfoi.length - 1);
					const to = clamp(0, other_id, pfoi.length - 1);

					const temp = pfoi.splice(from, 1);
					pfoi.splice(to, 0, ...temp);
				}
				product_comp._render();
			});

			const considerSavingToDb = (refresh = true) => {
				setTimeout(() => {
					const data = comp._data;
					if (!data) {
						return;
					}

					/** @type {Product_FeatureOptionCompData} */
					const save_product_feature_option = { product_feature_option_id: data.product_feature_option_id };

					const curr_option = product_feature_options.find((opt) => opt.product_feature_option_id === data.product_feature_option_id);

					let need_request = false;

					if (data.data_type === "text_value") {
						if (curr_option.text_value !== data.text_value) {
							need_request = true;
						}
						save_product_feature_option.text_value = data.text_value;
					}
					if (data.data_type === "datetime_value") {
						if (curr_option.datetime_value !== data.datetime_value) {
							need_request = true;
						}
						save_product_feature_option.datetime_value = data.datetime_value;
					}
					if (data.data_type === "double_value") {
						if (
							curr_option.double_base !== data.double_base ||
							curr_option.unit_id !== data.unit_id ||
							curr_option.double_value !== data.double_value
						) {
							need_request = true;
						}

						if (data.unit_id === null) {
							save_product_feature_option.double_value = data.double_value;
						} else {
							save_product_feature_option.double_base = data.double_base;
							save_product_feature_option.unit_id = data.unit_id;
						}
					}

					if (need_request) {
						if (isEquivalent(last_saved_product_feature_option, save_product_feature_option)) {
							return;
						}
						last_saved_product_feature_option = save_product_feature_option;

						xhr({
							url: STATIC_URLS["ADMIN"] + "/product/feature/option/save",
							params: {
								product_feature_option: save_product_feature_option,
							},
							success: (res) => {
								if (refresh) {
									refreshProductFeatures();
								}
							},
						});
					}
				});
			};

			comp._children(".save_to_db").forEach((input) => {
				input.addEventListener("blur", () => {
					considerSavingToDb();
				});
			});

			comp._children(".bind_datetime_value").forEach((input) => {
				input.addEventListener("changeDate", () => {
					considerSavingToDb();
				});
			});

			comp._nodes.physical_value_unit.addEventListener("change", () => {
				considerSavingToDb();
			});

			comp._nodes.physical_value_input.addEventListener("change", () => {
				considerSavingToDb();
			});

			product_comp.addEventListener("history_change", () => {
				considerSavingToDb(false);
			});
		},
	});
}
