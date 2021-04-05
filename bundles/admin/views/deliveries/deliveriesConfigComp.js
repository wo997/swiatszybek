/* js[admin] */

/**
 * @typedef {{
 * couriers: DeliveriesConfig_CourierCompData[]
 * }} DeliveriesConfigCompData
 *
 * @typedef {{
 * _data: DeliveriesConfigCompData
 * _set_data(data?: DeliveriesConfigCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  add_courier_btn: PiepNode
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
			couriers: [{ courier_id: -1, name: "xxx", tracking_url_prefix: "https", delivery_time_days: 2, expanded: false }],
		};
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				// reuse the code idk
				// const toggle_free_from = $(".toggle_free_from");
				// toggle_free_from.addEventListener("change", () => {
				// 	expand($(".case_free_from"), toggle_free_from._get_value());
				// });
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="label big first">Lista przewoźników / punktów odbioru</div>

			<div>
				<span class="label medium inline first"> Kurierzy (<span html="{${data.couriers.length}}"></span>) </span>
				<button class="btn primary small" data-node="{${comp._nodes.add_courier_btn}}" disabled="{${data.couriers.length > 5}}">
					Dodaj kuriera <i class="fas fa-plus"></i>
				</button>
			</div>

			<list-comp data-bind="{${data.couriers}}" class="wireframe space" data-primary="courier_id">
				<deliveries-config_courier-comp></deliveries-config_courier-comp>
			</list-comp>

			<div class="label medium">Paczkomaty (<span html="{${data.couriers.length}}"></span>)</div>

			<list-comp data-bind="{${data.couriers}}" class="wireframe space" data-primary="courier_id">
				<deliveries-config_courier-comp></deliveries-config_courier-comp>
			</list-comp>

			<div class="label medium">Punkty odbioru sklepu (<span html="{${data.couriers.length}}"></span>)</div>

			<list-comp data-bind="{${data.couriers}}" class="wireframe space" data-primary="courier_id">
				<deliveries-config_courier-comp></deliveries-config_courier-comp>
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
				data.couriers.push({ courier_id: -1, name: "", tracking_url_prefix: "", delivery_time_days: 0, expanded: false });
				comp._render();
			});
		},
	});
}
