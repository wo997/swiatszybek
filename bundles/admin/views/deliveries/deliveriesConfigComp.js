/* js[admin] */

/**
 * @typedef {{
 * couriers: DeliveriesConfig_CarrierCompData[]
 * parcel_lockers: DeliveriesConfig_CarrierCompData[]
 * in_persons: DeliveriesConfig_CarrierCompData[]
 * is_free_from_price: number
 * free_from_price: string
 * free_from_price_max_weight_kg: string
 * allow_cod: number
 * cod_from_price: string
 * cod_fee: string
 * is_price_based_on_dimensions: number
 * pricing_dt?: DatatableCompData
 * }} DeliveriesConfigCompData
 *
 * @typedef {{
 * _data: DeliveriesConfigCompData
 * _set_data(data?: DeliveriesConfigCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_courier_btn: PiepNode
 *  add_parcel_locker_btn: PiepNode
 *  add_in_person_btn: PiepNode
 *  case_free_from_price: PiepNode
 *  case_allow_cod: PiepNode
 *  pricing_dt: DatatableComp
 *  case_not_dimensions_pricing: PiepNode
 * }
 * } & BaseComp} DeliveriesConfigComp
 */

/**
 * @param {DeliveriesConfigComp} comp
 * @param {*} parent
 * @param {DeliveriesConfigCompData} data
 */
function deliveriesConfigComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			couriers: [],
			parcel_lockers: [],
			in_persons: [],
			is_free_from_price: 0,
			free_from_price: "",
			free_from_price_max_weight_kg: "",
			allow_cod: 0,
			cod_from_price: "",
			cod_fee: "",
			is_price_based_on_dimensions: 1,
		};
	}

	/** @type {DatatableCompData} */
	const pricing_dt = {
		columns: [
			{ key: "carrier_id", label: "Dostawca", searchable: "string", sortable: true, map_name: "carrier" },
			{ key: "delivery_type_id", label: "Typ dostawy", searchable: "select", map_name: "delivery_type", quick_filter: true },
			{ key: "base_price", label: "Cena bazowa", editable: "number", batch_edit: true },
			{ key: "cart_price_percent", label: "+% ceny produktów", editable: "number", batch_edit: true },
		],
		label: "Ceny dostawy",
		maps: [
			{
				name: "carrier",
				getMap: () => {
					const data = comp._data;
					if (!data) {
						return;
					}
					const all_carriers = [...data.couriers, ...data.parcel_lockers, ...data.in_persons];
					const map = all_carriers.map((d) => {
						const obj = {
							val: d.carrier_id,
							label: d.name,
						};
						return obj;
					});
					return map;
				},
			},
			{
				name: "delivery_type",
				getMap: () => {
					const map = delivery_types.map((d) => {
						const obj = {
							val: d.delivery_type_id,
							label: d.name,
						};
						return obj;
					});
					return map;
				},
			},
		],
		selectable: true,
		selection: [],
		dataset: [],
		print_row_as_string: (row_data) => {
			const carrier_map_data = comp._nodes.pricing_dt._get_map("carrier");
			const delivery_type_map_data = comp._nodes.pricing_dt._get_map("delivery_type");
			let res = "";
			const carrier_info = carrier_map_data.map.find((e) => e.val === row_data.carrier_id);
			const delivery_type_info = delivery_type_map_data.map.find((e) => e.val === row_data.delivery_type_id);
			if (carrier_info) {
				res += carrier_info.label;
			}
			if (delivery_type_info) {
				res += " " + delivery_type_info.label;
			}
			return res;
		},
	};
	data.pricing_dt = def(data.pricing_dt, pricing_dt);

	comp._set_data = (data, options = {}) => {
		const all_carriers = [...data.couriers, ...data.parcel_lockers, ...data.in_persons];
		for (const carrier of all_carriers) {
			if (!data.pricing_dt.dataset.find((c) => c.carrier_id === carrier.carrier_id)) {
				data.pricing_dt.dataset.push({
					carrier_id: carrier.carrier_id,
					delivery_type_id: carrier.delivery_type_id,
					base_price: 0,
					cart_price_percent: 0,
				});
			}
		}
		const existing_ids = [];
		for (const carrier of data.pricing_dt.dataset) {
			if (all_carriers.map((e) => e.carrier_id).includes(carrier.carrier_id)) {
				existing_ids.push(carrier.carrier_id);
			}
		}
		if (existing_ids.length < data.pricing_dt.dataset.length) {
			data.pricing_dt.dataset = data.pricing_dt.dataset.filter((e) => existing_ids.includes(e.carrier_id));
		}

		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.case_free_from_price, !!data.is_free_from_price);
				expand(comp._nodes.case_allow_cod, !!data.allow_cod);
				expand(comp._nodes.case_not_dimensions_pricing, !data.is_price_based_on_dimensions);

				comp._nodes.pricing_dt._children("datatable-row-comp").forEach((/** @type {DatatableRowComp} */ row) => {
					const carrier_id = row._data.row_data.carrier_id;
					const data = comp._data;
					const all_carriers = [...data.couriers, ...data.parcel_lockers, ...data.in_persons];
					const carrier = all_carriers.find((e) => e.carrier_id === carrier_id);
					row.classList.toggle("inactive", !!(!carrier || !carrier.active));
					carrier_id;
				});
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div>
				<span class="label medium bold inline first"> Kurierzy (<span html="{${data.couriers.length}}"></span>) </span>
				<button class="btn primary small" data-node="{${comp._nodes.add_courier_btn}}" disabled="{${data.couriers.length > 5}}">
					Dodaj kuriera <i class="fas fa-plus"></i>
				</button>
			</div>
			<list-comp data-bind="{${data.couriers}}" class="wireframe space separate light_gray_rows" data-primary="carrier_id">
				<deliveries-config_carrier-comp></deliveries-config_carrier-comp>
			</list-comp>

			<div>
				<span class="label medium bold inline"> Paczkomaty (<span html="{${data.parcel_lockers.length}}"></span>) </span>
				<button class="btn primary small" data-node="{${comp._nodes.add_parcel_locker_btn}}" disabled="{${data.parcel_lockers.length > 5}}">
					Dodaj paczkomat <i class="fas fa-plus"></i>
				</button>
			</div>
			<list-comp data-bind="{${data.parcel_lockers}}" class="wireframe space separate light_gray_rows" data-primary="carrier_id">
				<deliveries-config_carrier-comp></deliveries-config_carrier-comp>
			</list-comp>

			<div>
				<span class="label medium bold inline"> Punkty odbioru (<span html="{${data.in_persons.length}}"></span>) </span>
				<button class="btn primary small" data-node="{${comp._nodes.add_in_person_btn}}" disabled="{${data.in_persons.length > 5}}">
					Dodaj punkt odbioru <i class="fas fa-plus"></i>
				</button>
			</div>
			<list-comp data-bind="{${data.in_persons}}" class="wireframe space separate light_gray_rows" data-primary="carrier_id">
				<deliveries-config_carrier-comp></deliveries-config_carrier-comp>
			</list-comp>

			<div class="label medium bold">
				Sposób wyznaczenia ceny wysyłki zamówienia
				<div class="hover_info">
					W przypadku sprzedaży produktów niskomarżowych warto rozważyć opcję - Cena na podstawie wymiarów oraz wagi. Umożliwi to utrzymanie
					stosunkowo niskich cen względem konkurencji, bez obaw, że stracimy na którymkolwiek z zamówień. Zaletą opcji - cena stała / Cena
					zależna od wartości produktów - jest to, że nie musimy uzupełniać wszystkich wymiarów oraz wag produktów, co jest czasochłonnym
					zadaniem.
				</div>
			</div>

			<div
				class="radio_group boxes hide_checks columns_2 number semi_bold"
				style="max-width:400px"
				data-bind="{${data.is_price_based_on_dimensions}}"
			>
				<div class="checkbox_area">
					<p-checkbox data-value="1"></p-checkbox>
					<span>Cena na podstawie wymiarów oraz wagi</span>
				</div>

				<div class="checkbox_area">
					<p-checkbox data-value="0"></p-checkbox>
					<span>Cena stała / zależna od wartości produktów</span>
				</div>
			</div>

			<div class="expand_y" data-node="{${comp._nodes.case_not_dimensions_pricing}}">
				<datatable-comp class="pt2" data-bind="{${data.pricing_dt}}" data-node="{${comp._nodes.pricing_dt}}"></datatable-comp>
			</div>

			<div class="label medium bold">Płatność za pobraniem (kurier)</div>
			<div class="radio_group boxes hide_checks columns_2 number semi_bold" style="max-width:200px" data-bind="{${data.allow_cod}}">
				<div class="checkbox_area">
					<p-checkbox data-value="0"></p-checkbox>
					<span>Nie</span>
				</div>

				<div class="checkbox_area">
					<p-checkbox data-value="1"></p-checkbox>
					<span>Tak</span>
				</div>
			</div>

			<div class="expand_y" data-node="{${comp._nodes.case_allow_cod}}">
				<div class="label">Dodatkowa opłata względem przedpłaty <span class="semi_bold {${data.cod_fee}?hidden}">(Brak)</span></div>
				<span class="glue_children">
					<input class="field max_weight inline trim" inputmode="numeric" data-bind="{${data.cod_fee}}" />
					<span class="field_desc"> zł </span>
				</span>

				<div class="label">Cena minimalna <span class="semi_bold {${data.cod_from_price}?hidden}">(Brak)</span></div>
				<span class="glue_children">
					<input class="field free_from inline trim" inputmode="numeric" data-bind="{${data.cod_from_price}}" />
					<span class="field_desc"> zł </span>
				</span>
			</div>

			<div class="label medium bold">Darmowa wysyłka od określonej ceny minimalnej</div>
			<div
				class="radio_group boxes hide_checks columns_2 number semi_bold"
				style="max-width:200px"
				data-bind="{${data.is_free_from_price}}"
			>
				<div class="checkbox_area">
					<p-checkbox data-value="0"></p-checkbox>
					<span>Nie</span>
				</div>

				<div class="checkbox_area">
					<p-checkbox data-value="1"></p-checkbox>
					<span>Tak</span>
				</div>
			</div>

			<div class="expand_y" data-node="{${comp._nodes.case_free_from_price}}">
				<div class="label">Cena minimalna <span class="semi_bold {${data.free_from_price}?hidden}">(Brak)</span></div>
				<span class="glue_children">
					<input class="field free_from inline trim" inputmode="numeric" data-bind="{${data.free_from_price}}" />
					<span class="field_desc"> zł </span>
				</span>

				<div class="label">Waga maksymalna <span class="semi_bold {${data.free_from_price_max_weight_kg}?hidden}">(Brak)</span></div>
				<span class="glue_children">
					<input class="field max_weight inline trim" inputmode="numeric" data-bind="{${data.free_from_price_max_weight_kg}}" />
					<span class="field_desc"> kg </span>
				</span>
			</div>

			<div style="height:100px"></div>
		`,
		initialize: () => {
			const addCarrier = (delivery_type_id) => {
				showLoader();

				const carrier = {
					delivery_type_id,
					initial_dimensions: "[]",
					active: 0,
				};

				xhr({
					url: STATIC_URLS["ADMIN"] + "/carrier/save",
					params: {
						carrier,
					},
					success: (res) => {
						const data = comp._data;
						const carrier_data = res.carrier;
						let target;

						if (carrier_data.delivery_type_id === 1) {
							target = data.couriers;
						}
						if (carrier_data.delivery_type_id === 2) {
							target = data.parcel_lockers;
						}
						if (carrier_data.delivery_type_id === 3) {
							target = data.in_persons;
						}

						if (target) {
							target.push({
								carrier_id: carrier_data.carrier_id,
								delivery_time_days: 0,
								delivery_type_id,
								expanded: true,
								initial_dimensions: [],
								name: "",
								tracking_url_prefix: "",
								active: 0,
								api_key: "",
								img_url: "",
								google_maps_embed_code: "",
								google_maps_share_link: "",
							});

							comp._render();
						}

						hideLoader();
					},
				});
			};

			comp._nodes.add_courier_btn.addEventListener("click", () => {
				addCarrier(1);
			});

			comp._nodes.add_parcel_locker_btn.addEventListener("click", () => {
				addCarrier(2);
			});

			comp._nodes.add_in_person_btn.addEventListener("click", () => {
				addCarrier(3);
			});
		},
	});
}
