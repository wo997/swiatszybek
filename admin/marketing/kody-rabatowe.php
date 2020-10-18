<?php //route[{ADMIN}kody-rabatowe] 
?>

<?php startSection("head"); ?>

<title>Kody rabatowe</title>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    var tableName = "mytable";
    createDatatable({
      name: tableName,
      url: STATIC_URLS["ADMIN"] + "search_kody_rabatowe",
      lang: {
        subject: "produktów",
      },
      width: 1100,
      params: () => {},
      definition: [{
          title: "Kod",
          width: "10%",
          field: "kod",
          render: (r) => {
            return `
              <div class="link goto">
                <a class="goto-label" href="${STATIC_URLS["ADMIN"]}kod_rabatowy/${r.kod_id}">${escapeHTML(r.kod)}</a>
                <i class="fas fa-chevron-circle-right"></i>
              </div>
            `;
          },
          escape: false,
          searchable: "text",
        },
        {
          title: "Wartość",
          width: "10%",
          render: (r) => {
            return r.kwota + (r.type == "percent" ? "%" : "zł");
          }
        },
        {
          title: "Użytkownik",
          width: "10%",
          render: (r) => {
            return r.user_list || !r.user_id_list ? r.user_list : "Wszyscy";
          },
        },
        {
          title: "Od",
          width: "10%",
          field: "date_from",
          searchable: "date",

        },
        {
          title: "Do",
          width: "10%",
          field: "date_to",
          searchable: "date",
        },
        {
          title: "Ilość",
          width: "10%",
          field: "ilosc",
        },
      ],
      controlsRight: `
        <div class='float-icon space-right'>
          <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
          <i class="fas fa-search"></i>
        </div>
        <a class="btn important" href="${STATIC_URLS["ADMIN"]}kod_rabatowy"><span>Kod </span> <i class="fa fa-plus"></i></a>
      `
    });
  });
</script>

<?php startSection("content"); ?>

<h1>Kody rabatowe</h1>

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>