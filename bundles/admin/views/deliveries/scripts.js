/* js[view] */

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
		data.pricing_dt.dataset = def(deliveries_config.non_dimension_price_list, []);
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
					api_key: dimension_data.api_key,
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
				api_key: carrier_data.api_key,
				img_url: carrier_data.img_url,
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
			some_carriers.forEach((carrier_data) => {
				let dimensions = [];
				for (const dimension of carrier_data.dimensions_dt.dataset) {
					/** @type {DimensionData} */
					const dimension_data = dimension;
					dimensions.push({
						name: dimension_data.name,
						weight: dimension_data.weight,
						length: dimension_data.length,
						width: dimension_data.width,
						height: dimension_data.height,
						price: dimension_data.price,
						api_key: dimension_data.api_key,
					});
				}
				const dimensions_json = JSON.stringify(dimensions);

				carriers.push({
					carrier_id: carrier_data.carrier_id,
					name: carrier_data.name,
					delivery_time_days: carrier_data.delivery_time_days,
					delivery_type_id: carrier_data.delivery_type_id,
					tracking_url_prefix: carrier_data.tracking_url_prefix,
					dimensions_json,
					pos: carrier_data.row_index,
					active: carrier_data.active,
					api_key: carrier_data.api_key,
					img_url: carrier_data.img_url,
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
					non_dimension_price_list: data.pricing_dt.dataset,
				},
			},
			success: (res) => {
				showNotification("Zapisano zmiany", { one_line: true, type: "success" });
				hideLoader();
			},
		});
	});
});
