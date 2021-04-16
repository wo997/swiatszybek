/* js[admin] */

/**
 * @typedef {{
 * couriers: DeliveriesConfig_CarrierCompData[]
 * parcel_lockers: DeliveriesConfig_CarrierCompData[]
 * in_persons: DeliveriesConfig_CarrierCompData[]
 * is_free_from_price: number
 * free_from_price: number
 * free_from_price_max_weight: number
 * allow_cod: number
 * cod_from_price: number
 * cod_fee: number
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
			free_from_price: 0,
			free_from_price_max_weight: 0,
			allow_cod: 0,
			cod_from_price: 0,
			cod_fee: 0,
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.case_free_from_price, !!data.is_free_from_price);
				expand(comp._nodes.case_allow_cod, !!data.allow_cod);
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
				<span class="label medium bold inline"> Punkty odbioru sklepu (<span html="{${data.in_persons.length}}"></span>) </span>
				<button class="btn primary small" data-node="{${comp._nodes.add_in_person_btn}}" disabled="{${data.in_persons.length > 5}}">
					Dodaj punkt odbioru <i class="fas fa-plus"></i>
				</button>
			</div>
			<list-comp data-bind="{${data.in_persons}}" class="wireframe space separate light_gray_rows" data-primary="carrier_id">
				<deliveries-config_carrier-comp></deliveries-config_carrier-comp>
			</list-comp>

			<div class="label medium bold">Płatność za pobraniem</div>
			<div class="radio_group boxes hide_checks columns_2" style="max-width:200px" data-bind="{${data.allow_cod}}" data-number>
				<div class="checkbox_area">
					<p-checkbox data-value="0"></p-checkbox>
					<span>Nie</span>
				</div>

				<div class="checkbox_area">
					<p-checkbox data-value="1"></p-checkbox>
					<span>Tak</span>
				</div>
			</div>

			<div class="expand_y hidden animate_hidden" data-node="{${comp._nodes.case_allow_cod}}">
				<div class="label">Dodatkowa opłata względem przedpłaty</div>
				<span class="glue_children">
					<input class="field max_weight inline" data-number inputmode="numeric" data-bind="{${data.cod_fee}}" />
					<span class="field_desc"> zł </span>
				</span>

				<div class="label">Cena minimalna</div>
				<span class="glue_children">
					<input class="field free_from inline" data-number inputmode="numeric" data-bind="{${data.cod_from_price}}" />
					<span class="field_desc"> zł </span>
				</span>
			</div>

			<div class="label medium bold">Sposób wyznaczenia ceny wysyłki zamówienia</div>
			<div class="user_info mb3">
				<i class="fas fa-info-circle"></i> W przypadku sprzedaży produktów niskomarżowych warto rozważyć opcję - Cena na podstawie wymiarów
				oraz wagi. Umożliwi to utrzymanie stosunkowo niskich cen względem konkurencji, bez obaw, czy stracimy na którymkolwiek z zamówień.
				Zaletą pozostałych opcji - Stała cena / Cena zależna od wartości produktów - jest to, że nie musimy uzupełniać wszystkich wymiarów
				oraz wag produktów, co jest czasochłonnym zadaniem.
			</div>
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

			<div class="label medium bold">Darmowa wysyłka od określonej ceny minimalnej</div>
			<div class="radio_group boxes hide_checks columns_2" style="max-width:200px" data-bind="{${data.is_free_from_price}}" data-number>
				<div class="checkbox_area">
					<p-checkbox data-value="0"></p-checkbox>
					<span>Nie</span>
				</div>

				<div class="checkbox_area">
					<p-checkbox data-value="1"></p-checkbox>
					<span>Tak</span>
				</div>
			</div>

			<div class="expand_y hidden animate_hidden" data-node="{${comp._nodes.case_free_from_price}}">
				<div class="label">Cena minimalna</div>
				<span class="glue_children">
					<input class="field free_from inline" data-number inputmode="numeric" data-bind="{${data.free_from_price}}" />
					<span class="field_desc"> zł </span>
				</span>

				<div class="label">Waga maksymalna</div>
				<span class="glue_children">
					<input class="field max_weight inline" data-number inputmode="numeric" data-bind="{${data.free_from_price_max_weight}}" />
					<span class="field_desc"> kg </span>
				</span>
			</div>
		`,
		initialize: () => {
			comp._nodes.add_courier_btn.addEventListener("click", () => {
				const data = comp._data;
				data.couriers.push({
					carrier_id: -1,
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
					carrier_id: -1,
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
					carrier_id: -1,
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
