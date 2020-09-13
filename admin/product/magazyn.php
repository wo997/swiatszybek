<?php //route[admin/magazyn] 
?>

<?php startSection("head"); ?>

<title>Magazyn</title>

<style>
</style>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    var tableName = "mytable";
    createDatatable({
      name: tableName,
      url: "/admin/search_variant",
      lang: {
        subject: "produktów",
      },
      width: 1100,
      primary: "variant_id",
      db_table: "variant",
      //sortable: true,
      params: () => {
        return {
          order: "product_id ASC"
        }
      },
      definition: [{
          title: "Produkt",
          width: "70%",
          field: "title",
          render: (r) => {
            return `<a class="link" href='/admin/produkt/${r.product_id}'>${escapeHTML(r.title)}</a>`;
          },
          escape: false,
          searchable: "text",
          sortable: true,
        },
        {
          title: "Wariant",
          width: "30%",
          field: "name",
          searchable: "text",
        },
        {
          title: "Ilość w magazynie",
          width: "180px",
          render: (r) => {
            return `<input type="number" value="${r.stock}" onchange="dostawa(this.value, ${r.stock}, ${r.variant_id})">`;
          },
          escape: false
        },
        getPublishedDefinition(),
      ],
      controlsRight: `
            <div class='float-icon space-right'>
              <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
              <i class="fas fa-search"></i>
            </div>
          `
    });
  });

  function dostawa(now, was, variant_id) {
    ajax('/admin/change_variant_stock', {
      stock_difference: now - was,
      variant_id: variant_id
    }, (response) => {
      mytable.search();
      showNotification(`Pomyślnie zmieniono stan magazynowy na <b>${now} szt.</b>`);
    }, null);
  }
</script>

<?php startSection("content"); ?>

<h1>Stan magazynu</h1>

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>