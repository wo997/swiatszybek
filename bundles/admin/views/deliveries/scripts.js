/* js[view] */

// inpost parcel dimension examples
// this could be a map easily
// "small", "Gabaryt A - 8 x 38 x 64 cm, do 25 kg"
// "medium", "Gabaryt B - 19 x 38 x 64 cm, do 25 kg"
// "large", "Gabaryt C - 41 x 38 x 64 cm, do 25 kg"
// "xlarge", "Gabaryt D - 50 x 50 x 80 cm, do 25 kg"

domload(() => {
	/** @type {DeliveriesConfigComp} */
	// @ts-ignore
	const deliveries_config_comp = $("deliveries-config-comp.main");
	deliveries_config_comp.style.display = "none";
	deliveriesConfigComp(deliveries_config_comp, undefined);

	const data = deliveries_config_comp._data;

	if (deliveries_config) {
		data.allow_cod = deliveries_config.allow_cod;
		data.cod_fee = deliveries_config.cod_fee;
		data.cod_from_price = deliveries_config.cod_from_price;
		data.free_from_price = deliveries_config.free_from_price;
		data.free_from_price_max_weight = deliveries_config.free_from_price_max_weight;
		data.is_price_based_on_dimensions = deliveries_config.is_price_based_on_dimensions;
		data.is_free_from_price = deliveries_config.is_free_from_price;
	}

	carriers_data.sort((a, b) => Math.sign(a.pos - b.pos));
	carriers_data.forEach((carrier_data) => {
		/** @type {DimensionData[]} */
		const initial_dimensions = [];
		try {
			for (const dimension_data of JSON.parse(carrier_data.dimensions_json)) {
				initial_dimensions.push({
					name: dimension_data.name,
					weight: dimension_data.weight,
					length: dimension_data.length,
					width: dimension_data.width,
					height: dimension_data.height,
					price: dimension_data.price,
				});
			}
		} catch {}

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
				delivery_time_days: carrier_data.delivery_time_days,
				delivery_type_id: carrier_data.delivery_type_id,
				expanded: false,
				initial_dimensions,
				name: carrier_data.name,
				tracking_url_prefix: carrier_data.tracking_url_prefix,
				active: carrier_data.active,
			});
		}
	});
	deliveries_config_comp._data = data;
	deliveries_config_comp._render();
	deliveries_config_comp.style.display = "";

	$(".main_header .save_btn").addEventListener("click", () => {
		const data = deliveries_config_comp._data;

		/**
		 *
		 * @param {DeliveriesConfig_CarrierCompData[]} some_carriers
		 */
		const append_data = (some_carriers) => {
			some_carriers.forEach((some_carrier) => {
				let dimensions = [];
				for (const dimension of some_carrier.dimensions_dt.dataset) {
					/** @type {DimensionData} */
					const dimension_data = dimension;
					dimensions.push({
						name: dimension_data.name,
						weight: dimension_data.weight,
						length: dimension_data.length,
						width: dimension_data.width,
						height: dimension_data.height,
						price: dimension_data.price,
					});
				}
				const dimensions_json = JSON.stringify(dimensions);

				carriers.push({
					carrier_id: some_carrier.carrier_id,
					name: some_carrier.name,
					delivery_time_days: some_carrier.delivery_time_days,
					delivery_type_id: some_carrier.delivery_type_id,
					tracking_url_prefix: some_carrier.tracking_url_prefix,
					dimensions_json,
					pos: some_carrier.row_index,
					active: some_carrier.active,
				});
			});
		};

		const carriers = [];

		append_data(data.couriers);
		append_data(data.parcel_lockers);
		append_data(data.in_persons);

		showLoader();

		xhr({
			url: STATIC_URLS["ADMIN"] + "/carrier/save_many",
			params: {
				carriers,
				config: {
					allow_cod: data.allow_cod,
					cod_fee: data.cod_fee,
					cod_from_price: data.cod_from_price,
					free_from_price: data.free_from_price,
					free_from_price_max_weight: data.free_from_price_max_weight,
					is_free_from_price: data.is_free_from_price,
					is_price_based_on_dimensions: data.is_price_based_on_dimensions,
				},
			},
			success: (res) => {
				showNotification("Zapisano zmiany", { one_line: true, type: "success" });
				hideLoader();
			},
		});
	});
});
