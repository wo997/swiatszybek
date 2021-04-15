/* js[admin] */

/**
 * @typedef {{
 * couriers: DeliveriesConfig_CarrierCompData[]
 * parcel_lockers: DeliveriesConfig_CarrierCompData[]
 * in_persons: DeliveriesConfig_CarrierCompData[]
 * }} DeliveriesConfigCompData
 *
 * @typedef {{
 * _data: DeliveriesConfigCompData
 * _set_data(data?: DeliveriesConfigCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_courier_btn: PiepNode
 *  add_parcel_locker_btn: PiepNode
 *  add_in_person_btn: PiepNode
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
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {},
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
			<list-comp data-bind="{${data.couriers}}" class="wireframe space separate light_gray_rows" data-primary="courier_id">
				<deliveries-config_carrier-comp></deliveries-config_carrier-comp>
			</list-comp>

			<div>
				<span class="label medium bold inline"> Paczkomaty (<span html="{${data.parcel_lockers.length}}"></span>) </span>
				<button class="btn primary small" data-node="{${comp._nodes.add_parcel_locker_btn}}" disabled="{${data.parcel_lockers.length > 5}}">
					Dodaj paczkomat <i class="fas fa-plus"></i>
				</button>
			</div>
			<list-comp data-bind="{${data.parcel_lockers}}" class="wireframe space separate light_gray_rows" data-primary="courier_id">
				<deliveries-config_carrier-comp></deliveries-config_carrier-comp>
			</list-comp>

			<div>
				<span class="label medium bold inline"> Punkty odbioru sklepu (<span html="{${data.in_persons.length}}"></span>) </span>
				<button class="btn primary small" data-node="{${comp._nodes.add_in_person_btn}}" disabled="{${data.in_persons.length > 5}}">
					Dodaj punkt odbioru <i class="fas fa-plus"></i>
				</button>
			</div>
			<list-comp data-bind="{${data.in_persons}}" class="wireframe space separate light_gray_rows" data-primary="courier_id">
				<deliveries-config_carrier-comp></deliveries-config_carrier-comp>
			</list-comp>

			<div class="label big">Ceny wysyłek</div>

			<span class="label medium">Kurierzy</span>

			<div class="label medium">Sposób wyznaczenia ceny</div>
			<div class="radio_group space_items">
				<div class="checkbox_area">
					<p-checkbox data-value="static"></p-checkbox>
					<span>Stała cena</span>
				</div>

				<div class="checkbox_area">
					<p-checkbox data-value="cart_price"></p-checkbox>
					<span>Cena zależna od wartości produktów</span>
				</div>

				<div class="checkbox_area">
					<p-checkbox data-value="dimensions"></p-checkbox>
					<span>Cena na podstawie wymiarów oraz wagi</span>
				</div>
			</div>

			<br /><br />

			<div class="label">Darmowa wysyłka od określonej ceny minimalnej</div>
			<p-checkbox class="toggle_free_from"></p-checkbox>

			<div class="expand_y hidden animate_hidden case_free_from">
				<div class="label">Cena minimalna</div>
				<input class="field free_from inline" data-number inputmode="numeric" />

				<div class="label">Waga maksymalna</div>
				<input class="field max_weight inline" data-number inputmode="numeric" />
			</div>
		`,
		initialize: () => {
			comp._nodes.add_courier_btn.addEventListener("click", () => {
				const data = comp._data;
				data.couriers.push({
					courier_id: -1,
					delivery_type_id: 1,
					name: "",
					tracking_url_prefix: "",
					delivery_time_days: 0,
					expanded: true,
					initial_dimensions: [],
				});
				comp._render();
			});

			comp._nodes.add_parcel_locker_btn.addEventListener("click", () => {
				const data = comp._data;
				data.parcel_lockers.push({
					courier_id: -1,
					delivery_type_id: 2,
					name: "",
					tracking_url_prefix: "",
					delivery_time_days: 0,
					expanded: true,
					initial_dimensions: [],
				});
				comp._render();
			});

			comp._nodes.add_in_person_btn.addEventListener("click", () => {
				const data = comp._data;
				data.in_persons.push({
					courier_id: -1,
					delivery_type_id: 3,
					name: "",
					tracking_url_prefix: "",
					delivery_time_days: 0,
					expanded: true,
					initial_dimensions: [],
				});
				comp._render();
			});
		},
	});
}
