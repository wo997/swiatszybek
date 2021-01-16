/* js[view] */

domload(() => {
	useTool("loader");

	var tableName = "mytable";

	var statusDefinition = zamowienia_table_definition.find(
		(e) => e.title == "Status"
	);

	if (statusDefinition) {
		statusDefinition.className = "switchControls";
		statusDefinition.render = (r) => {
			return `
          ${renderStatus(r.status_id)}
          <select data-value="${
						r.status_id
					}" onchange="changeZamowienieStatus('${
				r.link
			}',this.value, { can_undo: true })">
            <?= $options ?>
          </select>
        `;
		};
	}

	createDatatable({
		name: tableName,
		url: STATIC_URLS["ADMIN"] + "search_zamowienia",
		lang: {
			subject: "zamówień",
		},
		primary: "zamowienie_id",
		table: "zamowienia",
		width: 1400,
		definition: zamowienia_table_definition,
		controlsRight: `
        <div class='float-icon'>
          <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
          <i class="fas fa-search"></i>
        </div>
      `,
		bulk_menu: `
        <div style="text-align:center;">
          Zmień status dla zaznaczonych zamówień (<span class='bulk_selection_count'></span>)
          <select onchange="bulkStatusUpdate(this);">
            <option value="">- STATUS -</option>
            <?= $options ?>
          </select>
        </div>
      `,
		onSearch: () => {
			setTimeout(() => {
				$$("select[data-value]").forEach((e) => {
					e.value = e.getAttribute("data-value");
				});
			}, 0);
		},
	});
});

async function bulkStatusUpdate(select) {
	var status_id = select.value;

	select.value = "";

	var datatable = getParentDatatable(select);

	var links = datatable.results
		.filter((value, index) => {
			return datatable.bulk_selection.indexOf(index) !== -1;
		})
		.map((r) => r.link);

	if (
		!confirm(
			`Czy chcesz zmienić wszystkie statusy (${datatable.bulk_selection.length})?`
		)
	)
		return;

	loader.show();

	for (let link of links) {
		await changeZamowienieStatus(link, status_id, {
			bulk: true,
		});
	}

	mytable.search(() => {
		loader.hide();
	});
}

function changeZamowienieStatus(zamowienie_link, new_status_id, options = {}) {
	// TODO: maybe it should be a bulk request instead
	return new Promise((resolve) => {
		xhr({
			url: `${STATIC_URLS["ADMIN"]}zmien_status/${zamowienie_link}/${new_status_id}`,
			success: (res) => {
				if (def(options.bulk, false)) {
					resolve("resolved");
				} else {
					mytable.search(() => {
						if (def(options.can_undo, false)) {
							var was_status_id = res.zamowienie_data.status_id;
							new_status_id = res.new_status_id; // just in case someone else edited
							zamowienie_link = res.zamowienie_data.link;
							var zamowienie_id = res.zamowienie_data.zamowienie_id;

							var was_status_title = def(
								status_list.find((e) => e.id == was_status_id),
								{
									title: "",
								}
							).title;
							var now_status_title = def(
								status_list.find((e) => e.id == new_status_id),
								{
									title: "",
								}
							).title;

							showNotification(
								/*html*/ `
                                        <div style='text-align:center;line-height:1.8'>
                                            <div class='header'>Zmieniono status</div>
                                            Zamówienie #${zamowienie_id}
                                            <br>
                                            ${was_status_title} <i class="fas fa-angle-double-right"></i> ${now_status_title}
                                            <br>
                                            <button class='btn primary semi-bold' onclick="changeZamowienieStatus('${zamowienie_link}', ${was_status_id});dismissParentNotification(this);">
                                                Cofnij
                                                <span class='countdown'></span>
                                            </button>
                                        </div>
                                    `,
								{
									duration: 5000,
								}
							);
						}

						resolve("resolved");
					});
				}
			},
		});
	});
}
