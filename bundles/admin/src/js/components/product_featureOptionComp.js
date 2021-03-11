/* js[admin] */

/**
 * @typedef {{
 * product_feature_id?: number
 * product_feature_option_id: number
 * data_type?: string
 * value?: string
 * double_value?: number
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
	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				comp._children(`[data-data_type]`).forEach((e) => {
					e.classList.toggle("hidden", e.dataset.data_type != data.data_type);
				});

				const physical_measure_data = physical_measures[data.physical_measure];
				if (physical_measure_data && physical_measure_data.units && physical_measure_data.units.length > 0) {
					const options = physical_measure_data.units
						.map((unit) => {
							return html`<option value="${unit.factor}">${unit.name}</option>`;
						})
						.join("");

					const unit_picker = comp._nodes.physical_value_unit;
					unit_picker._set_content(options);

					// @ts-ignore
					const unit_factors = [...unit_picker.options].map((e) => +e.value).sort();
					const unit_factor = def(getLast(unit_factors.filter((e) => e < data.double_value * 1.000001)), unit_factors[0]);

					unit_picker._set_value(unit_factor, { quiet: true });
					const accuracy = 100000;
					comp._nodes.physical_value_input._set_value(Math.round((accuracy * data.double_value) / unit_factor) / accuracy, { quiet: true });

					comp._nodes.physical_value_wrapper.classList.remove("hidden");
					comp._nodes.double_value.classList.add("hidden");
				} else {
					comp._nodes.physical_value_wrapper.classList.add("hidden");
					comp._nodes.double_value.classList.remove("hidden");
				}
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="option_header">
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
					<input class="field small inline" inputmode="numeric" data-number data-node="{${comp._nodes.physical_value_input}}" />
					<select class="field inline blank unit_picker" data-node="{${comp._nodes.physical_value_unit}}"></select>
				</div>
				<div style="margin-left:auto">
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
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

			const save_db_action = () => {
				setTimeout(() => {
					const data = comp._data;

					/** @type {Product_FeatureOptionCompData} */
					const product_feature_option = { product_feature_option_id: data.product_feature_option_id };

					if (data.data_type === "text_value") {
						product_feature_option.text_value = data.text_value;
					}
					if (data.data_type === "datetime_value") {
						product_feature_option.datetime_value = data.datetime_value;
					}
					if (data.data_type === "double_value") {
						product_feature_option.double_value = data.double_value;
					}

					xhr({
						url: STATIC_URLS["ADMIN"] + "/product/feature/option/save",
						params: {
							product_feature_option,
						},
						success: (res) => {
							refreshProductFeatures();
						},
					});
				});
			};

			comp._children(".save_to_db").forEach((input) => {
				input.addEventListener("blur", save_db_action);
			});

			comp._children(".bind_datetime_value").forEach((input) => {
				input.addEventListener("changeDate", save_db_action);
			});

			const recalculate_unit = () => {
				comp._nodes.double_value._set_value(comp._nodes.physical_value_unit._get_value() * comp._nodes.physical_value_input._get_value());
				save_db_action();
			};

			comp._nodes.physical_value_unit.addEventListener("change", () => {
				recalculate_unit();
			});

			comp._nodes.physical_value_input.addEventListener("change", () => {
				recalculate_unit();
			});
		},
	});
}
