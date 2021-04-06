/* js[admin] */

/**
 * @typedef {{
 * dimension_id: number
 * name: string
 * weight: number
 * length: number
 * width: number
 * height: number
 * } & ListCompRowData} DimensionData
 *
 */

/**
 * @typedef {{
 * courier_id: number
 * name: string
 * delivery_time_days: number
 * tracking_url_prefix: string
 * expanded: boolean
 * initial_dimensions: DimensionData[]
 * dimensions_dt?: DatatableCompData
 * } & ListCompRowData} DeliveriesConfig_CourierCompData
 *
 * @typedef {{
 * _data: DeliveriesConfig_CourierCompData
 * _set_data(data?: DeliveriesConfig_CourierCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  expand_btn: PiepNode
 *  expand: PiepNode
 *  add_dimension_btn: PiepNode
 * }
 * } & BaseComp} DeliveriesConfig_CourierComp
 */

/**
 * @param {DeliveriesConfig_CourierComp} comp
 * @param {*} parent
 * @param {DeliveriesConfig_CourierCompData} data
 */
function deliveriesConfig_courierComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { courier_id: -1, name: "", tracking_url_prefix: "", delivery_time_days: 0, expanded: false, initial_dimensions: [] };
	}

	/**
	 *
	 * @param {DeliveriesConfig_CourierCompData} data
	 */
	const setDefaults = (data) => {
		if (!data.dimensions_dt) {
			data.dimensions_dt = {
				columns: [
					{ key: "name", label: "Gabaryt", editable: "string" },
					{ key: "weight", label: "Waga", editable: "number" },
					{ key: "length", label: "Długość", editable: "number" },
					{ key: "width", label: "Szerokość", editable: "number" },
					{ key: "height", label: "Wysokość", editable: "number" },
				],
				empty_html: "Brak gabarytów",
				dataset: data.initial_dimensions,
				label: "",
				pagination_data: { row_count: 15 },
			};
		}
	};

	setDefaults(data);

	comp._set_data = (data, options = {}) => {
		setDefaults(data);

		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.expand, comp._data.expanded);
				comp._child(".fa-chevron-right").classList.toggle("open", data.expanded);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div style="display:flex;align-items:center">
				<div class="semi_bold medium clickable_label" html="{${data.row_index + 1 + ". " + data.name}}"></div>
				<div style="margin-left:auto">
					<button class="btn primary small" data-node="{${comp._nodes.expand_btn}}" data-tooltip="{${data.expanded ? "Zwiń" : "Rozwiń"}}">
						<i class="fas fa-chevron-right"></i>
					</button>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
			<div style="flex-grow:1">
				<div class="expand_y hidden animate_hidden" data-node="{${comp._nodes.expand}}">
					<hr style="margin:10px 0" />
					<div class="label first">Nazwa kuriera</div>
					<input class="field small" data-bind="{${data.name}}" />

					<div class="label">Czas doręczenia (dni robocze)</div>
					<input class="field small" data-bind="{${data.delivery_time_days}}" />

					<div class="label">Link do śledzenia paczki (prefix)</div>
					<input class="field small" data-bind="{${data.tracking_url_prefix}}" />

					<div>
						<span class="label medium inline"> Gabaryty (<span html="{${data.dimensions_dt.dataset.length}}"></span>) </span>
						<button
							class="btn primary small"
							data-node="{${comp._nodes.add_dimension_btn}}"
							disabled="{${data.dimensions_dt.dataset.length > 5}}"
						>
							Dodaj kuriera <i class="fas fa-plus"></i>
						</button>
					</div>

					<datatable-comp data-bind="{${data.dimensions_dt}}"></datatable-comp>
				</div>
			</div>
		`,
		initialize: () => {
			const toggle_expand = () => {
				comp._data.expanded = !comp._data.expanded;
				comp._render();
			};

			comp._child(".clickable_label").addEventListener("click", () => {
				toggle_expand();
			});

			comp._nodes.expand_btn.addEventListener("click", () => {
				toggle_expand();
			});

			comp._nodes.add_dimension_btn.addEventListener("click", () => {
				comp._data.dimensions_dt.dataset.push({ dimension_id: -1, weight: 0, length: 0, width: 0, height: 0, name: "" });
				comp._render();
			});
		},
	});
}
