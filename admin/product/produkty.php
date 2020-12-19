<?php //route[{ADMIN}produkty] 
?>

<?php startSection("head_content"); ?>

<title>Produkty</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        var tableName = "mytable";
        createDatatable({
            name: tableName,
            url: STATIC_URLS["ADMIN"] + "search_products",
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
              <a class="link text-plus-icon" href="${STATIC_URLS["ADMIN"]}produkt/${r.product_id}">
                <span>${escapeHTML(r.title)}</span>
                <i class="fas fa-chevron-circle-right"></i>
              </a>
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
        <button class="btn important" onclick="window.location='${STATIC_URLS["ADMIN"]}produkt'">
          Produkt <i class="fas fa-plus-circle"></i>
        </button>
      `
        });
    });
</script>


<?php startSection("body_content"); ?>

<h1>Produkty</h1>

<div class="mytable"></div>

<?php include "admin/page_template.php"; ?>