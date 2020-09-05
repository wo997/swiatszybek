<?php //route[admin/produkty] 
?>

<?php startSection("head"); ?>

<title>Produkty</title>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    var tableName = "mytable";
    createDatatable({
      name: tableName,
      url: "/admin/search_products",
      db_table: "products",
      primary: "product_id",
      lang: {
        subject: "produktów",
      },
      width: 1100,
      params: () => {},
      definition: [{
          title: "Nazwa produktu",
          width: "50%",
          render: (r) => {
            return `<a class="btn secondary" href='/admin/produkt/${r.product_id}'>Pokaż <i class="fas fa-chevron-circle-right"></i></a>&nbsp;&nbsp;${escapeHTML(r.title)}`
          },
          escape: false,
          field: "title",
          searchable: "text",
          sortable: true,
        },
        getPublishedDefinition({
          field: "p.published"
        }),
        {
          title: "W magazynie",
          width: "145px",
          render: (r) => {
            return `${nonull(r.stock,0)} szt.`;
          },
          field: "stock",
          sortable: true,
        },
      ],
      controlsRight: `
        <div class='float-icon space-right'>
          <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
          <i class="fas fa-search"></i>
        </div>
        <button class="btn important" style="height:32px" onclick="addNew(this)">
          <span class='hide-mobile'>Nowy produkt</span>
          <i class='fas fa-cube hide-desktop'></i>
          <i class="fa fa-plus"></i>
        </button>
      `
    });
  });

  function addNew(btn) {
    showModal("newProduct", {
      source: btn
    });
  }
</script>


<?php startSection("content"); ?>

<br>
<div class="mytable"></div>

<div id="newProduct" data-modal>
  <form onsubmit="return validateForm(this)" action="/admin/create_product" method="post" class="modal-padding">
    <label>
      <span>Nazwa produktu</span>
      <input type="text" name="title" id="title" data-validate class="field">
    </label>
    <div style="text-align:right;padding-top:15px">
      <button class="btn secondary" type="button" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
      <button type="submit" class="btn primary">Dodaj <i class="fa fa-check"></i></button>
    </div>
  </form>
</div>


<?php include "admin/default_page.php"; ?>