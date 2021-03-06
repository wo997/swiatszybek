/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.rebate_codes");

	DatatableComp(datatable_comp, undefined, {
		dataset: rebate_codes,
		//search_url: STATIC_URLS["ADMIN"] + "/rebate_code/search",
		columns: [
			{ label: "Kod", key: "code", width: "1", sortable: true, searchable: "string" },
			{
				label: "Wartość",
				key: "value",
				width: "1",
				sortable: true,
				searchable: "number",
				render: (value) => {
					return value + (value.includes("%") ? "" : " zł");
				},
			},
			{ label: "Ilość", key: "qty", width: "1", sortable: true, searchable: "number" },
			{ label: "Od", key: "available_from", width: "1", sortable: true, searchable: "date" },
			{ label: "Do", key: "available_till", width: "1", sortable: true, searchable: "date" },
			{
				label: "Akcja",
				key: "stock",
				width: "100px",
				render: (value, data) => {
					return html`<button class="btn subtle small edit_rebate_code" data-rebate_code_id="${data.rebate_code_id}">
						Edytuj <i class="fas fa-cog"></i>
					</button>`;
				},
			},
		],
		primary_key: "rebate_code_id",
		empty_html: html`Brak kodów rabatowych`,
		label: "Kody rabatowe",
		after_label: html`<button class="btn primary edit_rebate_code" data-rebate_code_id="-1">
			Utwórz kod rabatowy <i class="fas fa-plus"></i>
		</button> `,
	});

	datatable_comp.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const edit_rebate_code = target._parent(".edit_rebate_code");
		if (edit_rebate_code) {
			getRebateCodeModal()._show(+edit_rebate_code.dataset.rebate_code_id, { source: edit_rebate_code });
		}
	});

	window.addEventListener("rebate_codes_changed", () => {
		datatable_comp._data.dataset = rebate_codes;
		datatable_comp._render();
	});
});
