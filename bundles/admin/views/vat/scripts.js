/* js[view] */
domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.vats");

	DatatableComp(datatable_comp, undefined, {
		dataset: vats,
		columns: [
			{ label: "Wartość", key: "value", width: "1", render: (value) => `${value * 100}%` },
			{ label: "Opis", key: "description", width: "1" },
			{
				label: "Akcja",
				width: "135px",
				render: () => {
					return html`<button class="btn subtle small edit_btn">Edytuj <i class="fas fa-cog"></i></button>`;
				},
			},
		],
		maps: [],
		primary_key: "vat_id",
		empty_html: html`Brak stawek VAT`,
		label: "Stawki VAT",
		after_label: html`<button class="btn primary add_vat_btn">
			Dodaj stawkę VAT
			<i class="fas fa-plus"></i>
		</button>`,
		save_state_name: "admin_vats",
	});

	datatable_comp.addEventListener("click", (ev) => {
		const target = $(ev.target);

		const add_vat_btn = target._parent(".add_vat_btn");
		if (add_vat_btn) {
			getVatModal()._show(-1, { source: add_vat_btn });
		}

		const edit_btn = target._parent(".edit_btn");
		if (edit_btn) {
			const list_row = edit_btn._parent(".list_row");
			if (list_row) {
				getVatModal()._show(+list_row.dataset.primary, { source: edit_btn });
			}
		}
	});

	window.addEventListener("vats_changed", () => {
		datatable_comp._data.dataset = vats;
		datatable_comp._render();
	});
});
