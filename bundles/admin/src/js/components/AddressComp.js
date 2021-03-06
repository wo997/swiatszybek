/* js[admin] */

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
 *  post_code: string
 *  city: string
 *  street: string
 *  building_number: string
 *  flat_number: string
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
function AddressComp(comp, parent, data = undefined) {
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
			post_code: "",
			city: "",
			street: "",
			building_number: "",
			flat_number: "",
		};
	}

	comp._validate = () => {
		const errors = validateInputs(comp._children(`[data-validate]`).filter((e) => !e._parent(".hidden")));
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
			<div class="radio_group boxes big_boxes hide_checks" style="--columns:2" data-bind="{${data.party}}">
				<div class="checkbox_area">
					<div>
						<p-checkbox data-value="person"></p-checkbox>
						<span class="semi_bold">Osoba prywatna</span>
					</div>
				</div>
				<div class="checkbox_area">
					<div>
						<p-checkbox data-value="company"></p-checkbox>
						<span class="semi_bold">Firma</span>
					</div>
				</div>
			</div>

			<div class="expand_y" data-node="{${comp._nodes.case_person}}">
				<div class="label">Imię</div>
				<input class="field pretty_errors" autocomplete="given-name" data-bind="{${data.first_name}}" data-validate="" />

				<div class="label">Nazwisko</div>
				<input class="field pretty_errors" autocomplete="family-name" data-bind="{${data.last_name}}" data-validate="" />
			</div>

			<div class="expand_y" data-node="{${comp._nodes.case_company}}">
				<div class="label">Nazwa firmy</div>
				<input class="field pretty_errors" autocomplete="organization" data-bind="{${data.company}}" data-validate="" />

				<div class="label">NIP</div>
				<input class="field pretty_errors" data-bind="{${data.nip}}" data-validate="nip" />
			</div>

			<div class="label">Nr telefonu</div>
			<input class="field pretty_errors" autocomplete="tel" data-bind="{${data.phone}}" data-validate="phone" />

			<div class="label">Adres e-mail</div>
			<input class="field pretty_errors" autocomplete="email" data-bind="{${data.email}}" data-validate="email" />

			<div class="mt2"></div>

			<div class="label">Kraj</div>
			<select class="field pretty_errors" autocomplete="country-name" data-bind="{${data.country}}">
				${ue_countries
					.filter((e) => e.nazwa === "Polska")
					.map((e) => html`<option value="${e.nazwa}">${e.nazwa}</option>`)
					.join("")}
			</select>

			<div class="label">Kod pocztowy</div>
			<input class="field pretty_errors" autocomplete="postal-code" data-bind="{${data.post_code}}" data-validate="" />

			<div class="label">Miejscowość</div>
			<input class="field pretty_errors" autocomplete="address-level2" data-bind="{${data.city}}" data-validate="" />

			<div class="label">Ulica</div>
			<input class="field pretty_errors" autocomplete="address-line1" data-bind="{${data.street}}" data-validate="" />

			<div class="form_columns">
				<div class="form_column">
					<div class="label">Nr domu</div>
					<input class="field pretty_errors" autocomplete="address-line2" data-bind="{${data.building_number}}" data-validate="" />
				</div>
				<div class="form_column">
					<div class="label">Nr lokalu <span class="optional_label"></span></div>
					<input class="field pretty_errors" autocomplete="address-line3" data-bind="{${data.flat_number}}" />
				</div>
			</div>
		`,
		// <input class="field pretty_errors" autocomplete="country-name" data-bind="{${data.country}}" /> autocomplete works only for text inputs, interesting
		initialize: () => {
			if (comp.classList.contains("optional_phone_email")) {
				comp._children(`.bind_phone, .bind_email`).forEach((e) => {
					e._prev().insertAdjacentHTML("beforeend", html` <span class="optional_label"></span>`);
					e.dataset.validate += "|optional";
				});
			}
		},
	});
}
