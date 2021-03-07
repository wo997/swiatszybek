/* js[view] */

/**
 * @typedef {{
 *  party: string
 *  first_name: string
 *  last_name: string
 *  company: string
 *  nip: string
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
 *  case_person: PiepNode
 *  case_company: PiepNode
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
			party: "person",
			first_name: "",
			last_name: "",
			company: "",
			nip: "",
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
			render: () => {
				expand(comp._nodes.case_company, data.party === "company");
				expand(comp._nodes.case_person, data.party === "person");
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div class="label big first">Adres</div>
			<div class="radio_group boxes columns_2" data-bind="{${data.party}}">
				<div class="checkbox_area box">
					<div>
						<p-checkbox data-value="person"></p-checkbox>
						<span>Osoba prywatna</span>
					</div>
				</div>
				<div class="checkbox_area box">
					<div>
						<p-checkbox data-value="company"></p-checkbox>
						<span>Firma</span>
					</div>
				</div>
			</div>

			<div class="expand_y" data-node="{${comp._nodes.case_person}}">
				<div class="label">Imię</div>
				<input type="text" class="field" autocomplete="given-name" data-bind="{${data.first_name}}" />

				<div class="label">Nazwisko</div>
				<input type="text" class="field" autocomplete="family-name" data-bind="{${data.last_name}}" />
			</div>

			<div class="expand_y" data-node="{${comp._nodes.case_company}}">
				<div class="label">Nazwa firmy</div>
				<input type="text" class="field" autocomplete="organization" data-bind="{${data.company}}" />

				<div class="label">NIP</div>
				<input type="text" class="field" data-bind="{${data.nip}}" />
			</div>

			<div class="label">Kraj (select UE countries with default poland?)</div>
			<input type="text" class="field" autocomplete="postal-code" data-bind="{${data.country}}" />

			<div class="label">Kod pocztowy</div>
			<input type="text" class="field" autocomplete="postal-code" data-bind="{${data.postal_code}}" />

			<div class="label">Miejscowość</div>
			<input type="text" class="field" autocomplete="family-name" data-bind="{${data.city}}" />

			<div class="label">Nazwa ulicy</div>
			<input type="text" class="field" autocomplete="family-name" data-bind="{${data.street}}" />

			<div class="form_columns">
				<div class="form_column first">
					<div class="label">Nr domu</div>
					<input type="text" class="field" autocomplete="family-name" data-bind="{${data.house_number}}" />
				</div>

				<div class="form_column">
					<div class="label">Nr lokalu</div>
					<input type="text" class="field" autocomplete="family-name" data-bind="{${data.apartment_number}}" />
				</div>
			</div>
		`,
		initialize: () => {},
	});
}
