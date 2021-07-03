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
 * just_general_product_id?: number
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
 *  text_value: PiepNode
 * } & ListControlTraitNodes
 * } & BaseComp} Product_FeatureOptionComp
 */

/**
 * @param {Product_FeatureOptionComp} comp
 * @param {*} parent
 * @param {Product_FeatureOptionCompData} data
 */
function Product_FeatureOptionComp(
	comp,
	parent,
	data = {
		product_feature_option_id: -1,
		product_feature_id: -1,
	}
) {
	const set_h = () => {
		autoHeight(comp._nodes.text_value);
	};

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				comp._children(`[data-data_type]`).forEach((e) => {
					e.classList.toggle("hidden", e.dataset.data_type != data.data_type);
				});

				if (data.data_type === "double_value") {
					const product_feature = product_features.find((pf) => pf.product_feature_id === data.product_feature_id);
					const physical_measure_data = physical_measures[data.physical_measure];
					if (physical_measure_data && physical_measure_data.units && physical_measure_data.units.length > 0) {
						const options = physical_measure_data.units
							.filter((unit) => product_feature.units.find((u) => u.id === unit.id))
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

				if (!OPTIMIZE_COMPONENTS) {
					modifyProductFeatures();
				}

				if (comp._changed_data.text_value) {
					setTimeout(set_h);
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="title inline" data-data_type="text_list" html="{${data.value}}"></div>
			<textarea
				class="field small inline"
				style="flex-grow: 1;"
				data-data_type="text_value"
				data-bind="{${data.text_value}}"
				data-node="{${comp._nodes.text_value}}"
				data-input_delay="200"
			></textarea>
			<input
				class="field small inline default_datepicker"
				data-data_type="datetime_value"
				data-bind="{${data.datetime_value}}"
				data-input_delay="200"
			/>
			<input
				class="field small inline number"
				inputmode="numeric"
				data-data_type="double_value"
				data-bind="{${data.double_value}}"
				data-node="{${comp._nodes.double_value}}"
				data-input_delay="200"
			/>
			<div class="glue_children" data-node="{${comp._nodes.physical_value_wrapper}}">
				<input
					class="field small inline number"
					inputmode="numeric"
					data-node="{${comp._nodes.physical_value_input}}"
					data-bind="{${data.double_base}}"
					data-input_delay="200"
				/>
				<select
					class="field small inline blank unit_picker"
					data-node="{${comp._nodes.physical_value_unit}}"
					data-bind="{${data.unit_id}}"
				></select>
			</div>
			<div class="mla pl2">
				<p-batch-trait data-trait="list_controls"></p-batch-trait>
			</div>
		`,
		initialize: () => {
			comp._nodes.text_value.addEventListener("input", set_h);
			window.addEventListener("finished_components_optimization", set_h);
			set_h();

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

			window.addEventListener("product_features_changed", () => {
				comp._render({ force_render: true });
			});

			window.addEventListener("modify_product_features", (ev) => {
				// @ts-ignore
				const detail = ev.detail;

				const data = comp._data;

				if (!data || !data.data_type || !data.data_type.endsWith("_value")) {
					return;
				}

				const product_feature_option = product_feature_options.find(
					(opt) => opt.product_feature_option_id === data.product_feature_option_id
				);

				if (!detail.option_ids.includes(data.product_feature_option_id)) {
					detail.option_ids.push(data.product_feature_option_id);
				}

				if (data.data_type === "double_value") {
					if (data.unit_id === null) {
						product_feature_option.double_value = data.double_value;
						product_feature_option.value = data.double_value + "";
					} else {
						product_feature_option.double_base = data.double_base;
						product_feature_option.unit_id = data.unit_id;

						// u could precalc double value but seems unnecessary
						// we need a value for sure tho
						product_feature_option.value = data.double_base;
						if (physical_measure_unit_map[data.unit_id]) {
							product_feature_option.value += " " + physical_measure_unit_map[data.unit_id].name;
						}
					}
				} else if (data.data_type === "text_value") {
					product_feature_option.text_value = data.text_value;
					product_feature_option.value = data.text_value;
				} else if (data.data_type === "datetime_value") {
					product_feature_option.datetime_value = data.datetime_value;
					product_feature_option.value = data.datetime_value;
				}
			});
		},
	});
}
