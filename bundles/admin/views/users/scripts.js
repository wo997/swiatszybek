/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp.users");

	datatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "/user/search",
		columns: [
			{ label: "Imię", key: "first_name", width: "1", searchable: "string" },
			{ label: "Nazwisko", key: "last_name", width: "1", searchable: "string" },
			{ label: "E-mail", key: "email", width: "1", searchable: "string" },
		],
		primary_key: "user_id",
		empty_html: html`Brak użytkowników`,
		label: "Użytkownicy",
		selectable: true,
		save_state_name: "users",
	});
});
