/* js[view] */

/**
 * @typedef {{
 *  party: string
 *  first_name: string
 *  last_name: string
 *  company: string
 *  nip: string
 *  phone: string
 *  email: string
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
 * _validate(): boolean
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
			phone: "",
			email: "",
			country: "Polska",
			postal_code: "",
			city: "",
			street: "",
			house_number: "",
			apartment_number: "",
		};
	}

	comp._validate = () => {
		const errors = validateInputs(comp._children(`[data-validate]`).filter((e) => !e._parent(".hidden", { skip: 0 })));
		if (errors.length > 0) {
			return false;
		}
		return true;
	};

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
			<form onsubmit="return false">
				<div class="radio_group boxes columns_2 hide_checks" data-bind="{${data.party}}">
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
					<input type="text" class="field" autocomplete="given-name" data-bind="{${data.first_name}}" data-validate="string" />

					<div class="label">Nazwisko</div>
					<input type="text" class="field" autocomplete="family-name" data-bind="{${data.last_name}}" data-validate="string" />
				</div>

				<div class="expand_y" data-node="{${comp._nodes.case_company}}">
					<div class="label">Nazwa firmy</div>
					<input type="text" class="field" autocomplete="organization" data-bind="{${data.company}}" data-validate="string" />

					<div class="label">NIP</div>
					<input type="text" class="field" data-bind="{${data.nip}}" data-validate="string|nip" />
				</div>

				<div class="label">Nr telefonu</div>
				<input type="text" class="field" autocomplete="tel" data-bind="{${data.phone}}" data-validate="string|phone" />

				<div class="label">Adres e-mail</div>
				<input type="text" class="field" autocomplete="email" data-bind="{${data.email}}" data-validate="string|email" />

				<div class="label">Kraj</div>
				<select class="field" autocomplete="country-name" data-bind="{${data.country}}">
					${countries_options_html}
				</select>

				<div class="label">Kod pocztowy</div>
				<input type="text" class="field" autocomplete="postal-code" data-bind="{${data.postal_code}}" data-validate="string" />

				<div class="label">Miejscowość</div>
				<input type="text" class="field" autocomplete="address-level2" data-bind="{${data.city}}" data-validate="string" />

				<div class="label">Nazwa ulicy</div>
				<input type="text" class="field" autocomplete="address-line1" data-bind="{${data.street}}" data-validate="string" />

				<div class="form_columns">
					<div class="form_column first">
						<div class="label">Nr domu</div>
						<input type="text" class="field" autocomplete="address-line2" data-bind="{${data.house_number}}" data-validate="string" />
					</div>

					<div class="form_column">
						<div class="label">Nr lokalu <span class="optional_label"></span></div>
						<input type="text" class="field" autocomplete="address-line3" data-bind="{${data.apartment_number}}" />
					</div>
				</div>
			</form>
		`,
		// <input type="text" class="field" autocomplete="country-name" data-bind="{${data.country}}" /> autocomplete works only for text inputs, interesting
		initialize: () => {},
	});
}
