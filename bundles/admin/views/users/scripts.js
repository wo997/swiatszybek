/* js[view] */

domload(() => {
	var tableName = "mytable";
	createDatatable({
		name: tableName,
		url: STATIC_URLS["ADMIN"] + "search_uzytkownicy",
		lang: {
			subject: "użytkowników",
		},
		width: 1300,
		definition: [
			{
				title: "Imię",
				width: "7%",
				field: "imie",
				searchable: "text",
			},
			{
				title: "Nazwisko",
				width: "7%",
				field: "nazwisko",
				searchable: "text",
			},
			{
				title: "Firma",
				width: "7%",
				field: "firma",
				searchable: "text",
			},
			{
				title: "Email",
				width: "12%",
				field: "email",
				searchable: "text",
			},
			{
				title: "Telefon",
				width: "6%",
				field: "telefon",
				searchable: "text",
			},
			{
				title: "Typ konta",
				width: "5%",
				render: (r) => {
					if (r.user_type == "google") {
						return '<img src="/img/google.png" style="width: 15px;vertical-align: sub;">';
					}
					if (r.user_type == "facebook") {
						return '<i class="fab fa-facebook-square" style="font-size: 15px;color: #3b5998;"></i>';
					}
					return "";
				},
			},
			{
				title: "Uprawnienia",
				width: "8%",
				render: (r) => {
					return privelege_list[r.privelege_id].name;
				},
				field: "privelege_id",
				searchable: "select",
				select_values: privelege_list.map((e) => {
					return e.id;
				}),
				select_labels: privelege_list.map((e) => {
					return e.name;
				}),
			},
			// {
			//     title: "Utworzono",
			//     width: "9%",
			//     field: "stworzono",
			//     sortable: true,
			//     searchable: "date",
			// },
			{
				title: "Zamówienia",
				width: "6%",
				render: (r, i, t) => {
					var zamowienia = def(r.zamowienia_count);
					return zamowienia;
				},
				escape: false,
			},
			{
				title: "",
				width: "116px",
				render: (r, i, t) => {
					return `
                            <div class="btn secondary" onclick="editUser(this, ${t.name}.results[${i}])">Szczegóły <i class="fa fa-chevron-right"></i></div>
                        `;
				},
				escape: false,
			},
		],
		controlsRight: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>                `,
	});
});

domload(() => {
	const definition = zamowienia_table_definition.filter(
		(elem) => ["imie", "nazwisko", "firma"].indexOf(elem.field) === -1
	);

	var tableName = "zamowieniatable";
	createDatatable({
		name: tableName,
		url: STATIC_URLS["ADMIN"] + "search_zamowienia",
		lang: {
			subject: "zamówień",
		},
		width: 1300,
		nosearch: true,
		definition,
	});
});

function editUser(src = null, data = null) {
	const form = $("#editUser");

	if (data === null) {
		data = {
			email: "",
			firma: "",
			imie: "",
			nazwisko: "",
			kolejnosc: 1,
			privelege_id: 0,
			telefon: "",
			user_id: -1,
			zamowienia_count: 0,
		};
	}

	$("#editUser .passwordCheckbox").setValue(0);
	setFormData(data, form);

	removeFilterByField(zamowieniatable, "user_id");
	zamowieniatable.fixed_filters = [
		{
			field: "user_id",
			type: "=",
			value: $(`#editUser [name="user_id"]`).getValue(),
		},
	];
	zamowieniatable.search();

	showModal(form.id, {
		source: src,
	});
}

function saveUser() {
	const form = $("#editUser");
	if (!validateForm(form)) {
		return;
	}
	var params = getFormData(form);
	params.admin = true;
	xhr({
		url: "/save_user",
		params,
		success: (res) => {
			mytable.search();
		},
	});
	hideModalTopMost();
}

function togglePasswordField(elem) {
	expand($("#editUser .changePassword"), $(elem).getValue());
}
