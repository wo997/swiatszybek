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

	/** @type {DeliveriesConfigCompData} */
	const data = { couriers: [], parcel_lockers: [], in_persons: [] };
	carriers_data.sort((a, b) => Math.sign(a.pos - b.pos));
	carriers_data.forEach((carrier_data) => {
		/** @type {DimensionData[]} */
		const initial_dimensions = [];
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
			},
			success: (res) => {
				// showNotification("Zapisano zmiany", { one_line: true, type: "success" });
				// hideLoader();
				window.location.reload(); // makes sure ids were set, to change in the future
			},
		});
	});
});
