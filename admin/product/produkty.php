<?php //->[admin/produkty] 
?>

<?php startSection("head"); ?>

<title>Produkty</title>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    var tableName = "mytable";
    createTable({
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
          escape: false
        },
        getPublishedDefinition(),
        {
          title: "W magazynie",
          width: "100px",
          render: (r) => {
            return `${nonull(r.stock,0)} szt.`;
          }
        },
      ],
      controls: `
        <div class='float-icon'>
          <input type="text" placeholder="Szukaj..." data-param="search">
          <i class="fas fa-search"></i>
        </div>
        <select data-param="status">
          <option value=''>Wszystkie</option>
          <option value='published'>Tylko publiczne</option>
        </select>
        <button class="btn primary" onclick="addNew()"><span>Nowy produkt</span> <i class="fa fa-plus"></i></button>
      `
    });
  });

  function addNew() {
    showModal("newProduct");
  }
</script>

<?php endSection(); ?>

<?php startSection("content"); ?>

<div class="mytable"></div>

<div id="newProduct" data-modal>
  <form onsubmit="return validateForm({form:this})" action="/admin/create_product" method="post" class="default-form modal-padding">
    <label>
      <span>Nazwa produktu</span>
      <input type="text" name="title" id="title" data-validate>
    </label>
    <div style="text-align:right;padding-top:15px">
      <button class="btn secondary" type="button" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
      <button type="submit" class="btn primary">Dodaj <i class="fa fa-plus"></i></button>
    </div>
  </form>
</div>

<?php endSection(); ?>

<?php include "admin/default_page.php"; ?>