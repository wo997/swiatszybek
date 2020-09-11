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
          title: "Nazwa wariantu produktu",
          width: "70%",
          render: (r) => {
            return `<a class="btn secondary" href='/admin/produkt/${r.product_id}'>Pokaż <i class="fas fa-chevron-circle-right"></i></a>&nbsp;&nbsp;${escapeHTML(r.full_name)}`
          },
          escape: false
        },
        {
          title: "Ilość w magazynie",
          width: "130px",
          render: (r) => {
            return `<input type="number" value="${r.stock}" onchange="dostawa(this.value, ${r.stock}, ${r.variant_id})">`;
          },
          escape: false
        },
        getPublishedDefinition(),
      ],
      controls: `
            <div class='float-icon'>
              <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
              <i class="fas fa-search"></i>
            </div>
            <select data-param="status" class="field inline">
              <option value=''>Wszystkie</option>
              <option value='published'>Tylko publiczne</option>
              <option value='brak'>Brak w magazynie</option>
            </select>
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

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>