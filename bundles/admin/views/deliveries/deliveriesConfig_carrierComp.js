/* js[admin] */

/**
 * @typedef {{
 * name: string
 * weight: number
 * length: number
 * width: number
 * height: number
 * price: number
 * api_key: string
 * } & ListCompRowData} DimensionData
 *
 */

/**
 * @typedef {{
 * carrier_id: number
 * active: number
 * delivery_type_id: number
 * name: string
 * delivery_time_days: number
 * tracking_url_prefix: string
 * expanded: boolean
 * initial_dimensions: DimensionData[]
 * dimensions_dt?: DatatableCompData
 * api_key: string
 * img_url: string
 * } & ListCompRowData} DeliveriesConfig_CarrierCompData
 *
 * @typedef {{
 * _data: DeliveriesConfig_CarrierCompData
 * _set_data(data?: DeliveriesConfig_CarrierCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  expand_btn: PiepNode
 *  expand: PiepNode
 *  dimenions_dt: DatatableComp
 *  label: PiepNode
 * }
 * } & BaseComp} DeliveriesConfig_CarrierComp
 */

/**
 * @param {DeliveriesConfig_CarrierComp} comp
 * @param {*} parent
 * @param {DeliveriesConfig_CarrierCompData} data
 */
function DeliveriesConfig_CarrierComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			carrier_id: -1,
			active: 0,
			delivery_type_id: -1,
			name: "",
			tracking_url_prefix: "",
			delivery_time_days: 0,
			expanded: false,
			initial_dimensions: [],
			api_key: "",
			img_url: "",
		};
	}

	/**
	 *
	 * @param {DeliveriesConfig_CarrierCompData} data
	 */
	const setDefaults = (data) => {
		if (data && !data.dimensions_dt) {
			data.dimensions_dt = {
				columns: [
					{ key: "name", label: "Gabaryt", editable: "string" },
					{ key: "api_key", label: "Klucz integracji", editable: "string" },
					{ key: "weight", label: "Waga (kg)", editable: "number" },
					{ key: "length", label: "Długość (cm)", editable: "number" },
					{ key: "width", label: "Szerokość (cm)", editable: "number" },
					{ key: "height", label: "Wysokość (cm)", editable: "number" },
					{ key: "price", label: "Cena (zł)", editable: "number" },
				],
				empty_html: "Brak gabarytów",
				dataset: data.initial_dimensions,
				label: "Gabaryty",
				after_label: html`<button class="btn primary small add_dimension_btn">Dodaj gabaryt <i class="fas fa-plus"></i></button>`,
				pagination_data: { row_count: 15 },
				deletable: true,
				sortable: true,
				require_sort: { key: "pos", order: "asc" },
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
				comp._child(".add_dimension_btn").toggleAttribute("disabled", data.dimensions_dt.dataset.length > 5);
				comp._parent().classList.toggle("inactive", !data.active);
				comp._nodes.label.classList.toggle("slash", !data.active);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="flex align_center header">
				<div class="semi_bold semi_medium" html="{${data.row_index + 1}}"></div>
				.
				<div class="semi_bold semi_medium clickable_label ml1" html="{${data.name}}" data-node="{${comp._nodes.label}}"></div>
				<div style="margin-left:auto">
					<button class="btn primary small" data-node="{${comp._nodes.expand_btn}}" data-tooltip="{${data.expanded ? "Zwiń" : "Rozwiń"}}">
						<i class="fas fa-chevron-right"></i>
					</button>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
			<div style="flex-grow:1">
				<div class="expand_y" data-node="{${comp._nodes.expand}}">
					<div style="background:#fff;padding:10px;border-radius:4px;border:1px solid #ccc;margin-top:10px;">
						<div class="label">Nazwa dostawcy</div>
						<input class="field small" data-bind="{${data.name}}" />

						<div class="label">Widoczność w sklepie</div>
						<div class="radio_group boxes hide_checks number" data-bind="{${data.active}}">
							<div class="checkbox_area error">
								<div>
									<p-checkbox data-value="0"></p-checkbox>
									<span class="semi_bold">Nieaktywny <i class="fas fa-eye-slash"></i></span>
								</div>
							</div>
							<div class="checkbox_area success">
								<div>
									<p-checkbox data-value="1"></p-checkbox>
									<span class="semi_bold">Aktywny <i class="fas fa-eye"></i></span>
								</div>
							</div>
						</div>

						<div class="label">Klucz integracji</div>
						<input class="field small" data-bind="{${data.api_key}}" />

						<div class="label">Link do ikonki</div>
						<input class="field small" data-bind="{${data.img_url}}" />

						<div class="label">Czas doręczenia (dni robocze)</div>
						<input class="field small" data-bind="{${data.delivery_time_days}}" />

						<div class="label">Link do śledzenia paczki (prefix)</div>
						<input class="field small" data-bind="{${data.tracking_url_prefix}}" />

						<datatable-comp
							class="mtf small_dataset"
							data-bind="{${data.dimensions_dt}}"
							data-node="{${comp._nodes.dimenions_dt}}"
						></datatable-comp>
					</div>
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

			comp._nodes.dimenions_dt.addEventListener("click", (ev) => {
				const target = $(ev.target);

				if (target._parent(".add_dimension_btn")) {
					comp._data.dimensions_dt.dataset.push({ weight: 0, length: 0, width: 0, height: 0, name: "" });
					comp._render();
				}
			});
		},
	});
}
