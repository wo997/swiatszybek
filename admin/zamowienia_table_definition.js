var zamowienia_table_definition = [
  {
    title: "Nr zamówienia",
    width: "110px",
    render: (r) => {
      var produkty = JSON.parse(r.basket);
      var pr = "";
      for (produkt of produkty) {
        pr += `${produkt["q"]}szt. ${produkt["t"]}<br>`;
      }
      return `<a class="btn secondary" href='/zamowienie/${
        r.link
      }' style="margin-right:7px">#${escapeHTML(
        r.zamowienie_id
      )} <i class="fas fa-chevron-circle-right"></i></a><i class="fas fa-shopping-bag" data-tooltip="${pr}"></i>`;
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
    width: "185px",
    render: (r) => {
      return renderStatus(r.status);
    },
    escape: false,
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
