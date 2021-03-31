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
			{ label: "Nr telefonu", key: "phone", width: "1", searchable: "string" },
			{
				label: "Rola",
				key: "role_id",
				width: "1",
				searchable: "select",
				map_name: "roles",
				editable: "select",
				editable_callback: (data) => {
					xhr({
						url: STATIC_URLS["ADMIN"] + "/user/save",
						params: {
							user: {
								user_id: data.user_id,
								role_id: data.role_id,
							},
						},
						success: (res) => {
							showNotification(
								html`<div class="header">Użytkownik ${data.email}</div>
									<div class="center">Rola: ${user_roles.find((e) => e.role_id === data.role_id).name}</div>`
							);
							datatable_comp._backend_search();
						},
					});
				},
			},
		],
		maps: [
			{
				name: "roles",
				getMap: () => {
					const map = user_roles
						.filter((role) => role.role_id > 0)
						.map((role) => {
							const obj = {
								val: role.role_id,
								label: role.name,
							};
							return obj;
						});
					return map;
				},
			},
		],
		primary_key: "user_id",
		empty_html: html`Brak użytkowników`,
		label: "Użytkownicy",
		save_state_name: "admin_users",
	});
});
