/* js[admin] */

var zamowienia_table_filter_status_list = [
  {
    title: `Otwarte <i class="fas fa-hourglass-half"></i>`,
    color: "",
  },
  {
    title: `Zamknięte <i class='fas fa-times'></i>`,
    color: "",
  },
];

Object.entries(status_list).forEach(([key, value]) => {
  zamowienia_table_filter_status_list[key] = value;
});

var zamowienia_table_definition = [
  {
    title: "Nr zamówienia",
    width: "128px",
    render: (r) => {
      var products_info = "<table>";
      try {
        var produkty = JSON.parse(r.cache_basket);
        for (produkt of produkty) {
          products_info += `<tr><td><b>${produkt["total_price"]}zł</b></td><td>${produkt["quantity"]}szt. ${produkt["title"]}</td></tr>`;
        }
      } catch (e) {}
      products_info += "</table>";

      return `<a class="btn secondary" href='/zamowienie/${
        r.link
      }' style="margin-right:7px">#${escapeHTML(
        r.zamowienie_id
      )} <i class="fas fa-chevron-circle-right"></i></a><i class="fas fa-shopping-bag" data-tooltip="${products_info}"></i>`;
    },
    escape: false,
  },
  {
    title: "Klient",
    width: "20%",
    render: (r) => {
      var client = `${r.imie} ${r.nazwisko} ${r.firma}`;
      return r.user_id
        ? `<a href='/moje-konto/dane-uzytkownika/${
            r.user_id
          }'><i class='fa fa-user'></i> ${escapeHTML(client)}</a>`
        : `${client}`;
    },
    escape: false,
  },
  {
    title: "Koszt",
    width: "8%",
    render: (r) => {
      return `${r.koszt} zł`;
    },
  },
  {
    title: "Dostawa",
    width: "10%",
    render: (r) => {
      return r.dostawa;
    },
  },
  {
    title: "Status",
    width: "205px",
    render: (r) => {
      return renderStatus(r.status_id);
    },
    escape: false,
    field: "status_id",
    searchable: "select",
    select_values: Object.keys(zamowienia_table_filter_status_list),
    select_labels: Object.values(zamowienia_table_filter_status_list).map(
      (e) => {
        return e.title;
      }
    ),
  },
  {
    title: "Utworzono",
    width: "10%",
    render: (r) => {
      return nonull(r.zlozono);
    },
  },
  {
    title: "Wysłano",
    width: "10%",
    render: (r) => {
      return nonull(r.wyslano);
    },
  },
];
