<?php //route[admin/kody-rabatowe] 
?>

<?php startSection("head"); ?>

<title>Kody rabatowe</title>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    var tableName = "mytable";
    createDatatable({
      name: tableName,
      url: "/admin/search_kody_rabatowe",
      lang: {
        subject: "produktów",
      },
      width: 1100,
      params: () => {},
      definition: [{
          title: "Kod",
          width: "10%",
          render: (r) => {
            return r.kod;
          }
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
          }
        },
        {
          title: "Od",
          width: "10%",
          render: (r) => {
            return r.date_from;
          }
        },
        {
          title: "Do",
          width: "10%",
          render: (r) => {
            return r.date_to;
          }
        },
        {
          title: "Ilość",
          width: "10%",
          render: (r) => {
            return r.ilosc;
          }
        },
        {
          title: "",
          width: "100px",
          render: (r) => {
            return `<a class='btn admin-primary' href='/admin/kod_rabatowy/${r.kod_id}'>Edytuj <i class="fas fa-chevron-circle-right"></i></a>`;
          },
          escape: false
        },
      ],
      controls: `
        <div class='float-icon'>
          <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
          <i class="fas fa-search"></i>
        </div>
        <a class="btn admin-primary" href="/admin/kod_rabatowy"><span>Nowy kod rabatowy</span> <i class="fa fa-plus"></i></a>
      `
    });
  });
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>