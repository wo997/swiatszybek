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
            return `
              <div class="link goto" onclick="window.location='/admin/produkt/${r.product_id}'">
                <div class="goto-label">${escapeHTML(r.title)}</div>
                <i class="fas fa-chevron-circle-right"></i>
              </div>
            `;
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
        <button class="btn important" onclick="addNew(this)">
          Produkt <i class="fas fa-plus-circle"></i>
        </button>
      `
    });
  });

  function addNew(btn) {
    setFormData({
      title: ""
    }, "#newProduct");

    showModal("newProduct", {
      source: btn
    });
  }

  function saveNewProduct() {
    var f = $("#newProduct");

    if (!validateForm(f)) {
      return;
    }

    var params = getFormData(f);

    xhr({
      url: "/admin/create_product",
      params: params,
      success: (res) => {
        // window.location.reload();
        mytable.search();
      }
    });
  }
</script>


<?php startSection("content"); ?>

<h1>Produkty</h1>

<div class="mytable"></div>

<div id="newProduct" data-modal data-form>
  <div class="modal-body">
    <label>
      <span>Nazwa produktu</span>
      <input type="text" name="title" id="title" data-validate class="field">
    </label>
    <div class="flexbar slim single-line">
      <button class="btn primary fill space-right" onclick="saveNewProduct(); hideParentModal(this)">Dodaj <i class="fa fa-check"></i></button>
      <button class="btn secondary fill" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
    </div>
  </div>
</div>


<?php include "admin/default_page.php"; ?>