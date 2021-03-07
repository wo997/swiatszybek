/* js[view] */

/**
 * @typedef {{
 *  first_name: string
 *  last_name: string
 *  country: string
 *  postal_code: string
 *  city: string
 *  street: string
 *  house_number: string
 *  apartment_number: string
 * }} AddressCompData
 *
 * @typedef {{
 * _data: AddressCompData
 * _set_data(data?: AddressCompData, options?: SetCompDataOptions)
 * _nodes: {
 * }
 * } & BaseComp} AddressComp
 */

/**
 * @param {AddressComp} comp
 * @param {*} parent
 * @param {AddressCompData} data
 */
function addressComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = {
			first_name: "",
			last_name: "",
			country: "Polska (PL)",
			postal_code: "",
			city: "",
			street: "",
			house_number: "",
			apartment_number: "",
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
			<div class="label">Imię</div>
			<input type="text" class="field" autocomplete="given-name" data-bind="{${data.first_name}}" />

			<div class="label">Nazwisko</div>
			<input type="text" class="field" autocomplete="family-name" data-bind="{${data.last_name}}" />

			<div class="label">Kraj (select UE countries with default poland?)</div>
			<input type="text" class="field" autocomplete="postal-code" data-bind="{${data.country}}" />

			<div class="label">Kod pocztowy</div>
			<input type="text" class="field" autocomplete="postal-code" data-bind="{${data.postal_code}}" />

			<div class="label">Miejscowość</div>
			<input type="text" class="field" autocomplete="family-name" data-bind="{${data.city}}" />

			<div class="label">Nazwa ulicy</div>
			<input type="text" class="field" autocomplete="family-name" data-bind="{${data.street}}" />

			<div class="label">Nr domu</div>
			<input type="text" class="field" autocomplete="family-name" data-bind="{${data.house_number}}" />

			<div class="label">Nr lokalu</div>
			<input type="text" class="field" autocomplete="family-name" data-bind="{${data.apartment_number}}" />
		`,
		initialize: () => {},
	});
}
