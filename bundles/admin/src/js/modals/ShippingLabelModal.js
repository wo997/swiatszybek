/* js[admin] */

/**
 * @param {*} shop_order_data
 * @param {ShowModalParams} options
 */
function showShippingLabelModal(shop_order_data, options = {}) {
	const ex = $("#ShippingLabelModal");
	if (!ex) {
		registerModalContent(html`
			<div id="ShippingLabelModal" data-dismissable data-expand>
				<div class="modal_body" style="max-width:400px;height: auto;">
					<div class="custom_toolbar">
						<span class="title medium">Drukuj etykietę nadawczą</span>
						<button class="btn subtle mla" onclick="hideParentModal(this)">Zamknij <i class="fas fa-times"></i></button>
					</div>
					<div class="scroll_panel scroll_shadow panel_padding">
						<div class="mtfn">
							<span class="label">Typ wysyłki</span>
							<select class="field delivery_type_id">
								<option value="1">Kurier</option>
								<option value="2">Paczkomat</option>
							</select>

							<span class="label">Przewoźnik</span>
							<select class="field carrier_id">
								<option value="ups">UPS</option>
								<option value="inpost">InPost</option>
								<option value="dpd">DPD</option>
								<option value="dhl">DHL</option>
								<option value="pocztex">Pocztex</option>
							</select>

							<hr class="mtf" />

							<div class="case_inpost expand_y">
								<form class="case_created" action="${STATIC_URLS["ADMIN"]}/carrier/inpost/print_label" method="post" target="_blank">
									<input type="hidden" name="inpost_shipment_id" />
									<div class="label medium mtf">Etykieta nadawcza została już utworzona!</div>
									<button class="btn primary mtf fill" type="submit">Drukuj <i class="fas fa-print"></i></button>
									<hr class="mtf" />
								</form>

								<form action="${STATIC_URLS["ADMIN"]}/carrier/inpost/print_label" method="post" target="_blank">
									<input type="hidden" name="shop_order_id" />
									<input type="hidden" name="delivery_type_id" />

									<span class="label">Gabaryt</span>
									<select class="field" name="package_api_key">
										<option value="small">Gabaryt A - 8 x 38 x 64 cm, do 25 kg</option>
										<option value="medium">Gabaryt B - 19 x 38 x 64 cm, do 25 kg</option>
										<option value="large">Gabaryt C - 41 x 38 x 64 cm, do 25 kg</option>
										<option value="xlarge">Gabaryt D - 50 x 50 x 80 cm, do 25 kg</option>
									</select>

									<span class="label">Wartość ubezpieczenia</span>
									<div class="glue_children">
										<input class="field" name="insurance" />
										<div class="field_desc">zł</div>
									</div>

									<span class="label">Wysyłka weekendowa</span>
									<p-checkbox onchange="$(this)._next().value=$(this)._get_value()"></p-checkbox>
									<input name="end_of_week_collection" type="hidden" value="0" />

									<button class="btn primary mtf fill" type="submit">Utwórz i drukuj <i class="fas fa-print"></i></button>
								</form>
							</div>
						</div>
					</div>
				</div>
			</div>
		`);

		$$("#ShippingLabelModal form").forEach((e) => {
			e.addEventListener("submit", () => {
				hideModal("ShippingLabelModal");
				window.dispatchEvent(new CustomEvent("shipping_label_open"));
			});
		});
	}

	const slm = $("#ShippingLabelModal");

	const delivery_type_id_input = slm._child(".delivery_type_id");
	const carrier_id_input = slm._child(".carrier_id");

	const deliveryChange = () => {
		expand(case_inpost, carrier_id_input._get_value() === "inpost");

		slm._children(`[name="delivery_type_id"]`).forEach((e) => {
			e._set_value(delivery_type_id_input._get_value());
		});
	};
	carrier_id_input.addEventListener("change", deliveryChange);
	delivery_type_id_input.addEventListener("change", deliveryChange);

	const case_inpost = slm._child(".case_inpost");
	{
		const case_created = case_inpost._child(".case_created");
		const package_api_key_input = case_inpost._child(`[name="package_api_key"]`);
		const insurance_input = case_inpost._child(`[name="insurance"]`);
		const inpost_shipment_id = case_inpost._child(`[name="inpost_shipment_id"]`);

		delivery_type_id_input._set_value(shop_order_data.delivery_type_id);
		const carrier = carriers.find((c) => c.carrier_id === shop_order_data.carrier_id);
		if (carrier) {
			carrier_id_input._set_value(carrier.api_key);
		}
		package_api_key_input._set_value(shop_order_data.package_api_key);
		insurance_input._set_value(5000);

		package_api_key_input._set_value(shop_order_data.package_api_key);

		inpost_shipment_id._set_value(shop_order_data.inpost_shipment_id);
		case_created.classList.toggle("hidden", !shop_order_data.inpost_shipment_id);
	}

	slm._children(`[name="shop_order_id"]`).forEach((e) => {
		e._set_value(shop_order_data.shop_order_id);
	});

	showModal("ShippingLabelModal", options);
}
