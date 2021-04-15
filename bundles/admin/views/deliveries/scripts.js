/* js[view] */

domload(() => {
	/** @type {DeliveriesConfigComp} */
	// @ts-ignore
	const deliveries_config_comp = $("deliveries-config-comp.main");

	deliveriesConfigComp(deliveries_config_comp, undefined);

	$(".main_header .save_btn").addEventListener("click", () => {
		const data = deliveries_config_comp._data;
		const all_carriers = [...data.couriers, ...data.parcel_lockers, ...data.in_persons];
	});
});
