/* js[admin] */

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
    select_values: status_list.map((e) => {
      return e.id;
    }),
    select_labels: status_list.map((e) => {
      return e.title;
    }),
    renderSearch: (filters_html) => {
      var html = "";

      var first = true;
      zamowienia_status_groups.forEach((group) => {
        html += `<button class="btn subtle fill" style="background: #fafafa;${
          !first ? "margin-top:5px" : ""
        }" onclick="selectFilterCheckboxes(${JSON.stringify(group.ids)})">${
          group.label
        }</button>`;
        first = false;
      });

      html += filters_html;
      return html;
    },
  },
  {
    title: "Utworzono",
    width: "10%",
    field: "zlozono",
    sortable: true,
    searchable: "date",
  },
  {
    title: "Wysłano",
    width: "10%",
    field: "wyslano",
    sortable: true,
    searchable: "date",
  },
];
