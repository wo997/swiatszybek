<?php //route[{ADMIN}oczekujacy] 
?>

<?php startSection("head"); ?>

<title>Oczekujący</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        var tableName = "mytable"; //notification_id, CONCAT(imie, ' ', nazwisko) as user, n.email, DATE_FORMAT(requested, '%d-%m-%Y %H:%i') as requested, sent, quantity, CONCAT(i.title,' ',v.name) as product

        createDatatable({
            name: tableName,
            url: STATIC_URLS["ADMIN"] + "search_oczekujacy",
            lang: {
                subject: "oczekujących",
            },
            params: () => {},
            definition: [{
                    title: "E-mail",
                    width: "10%",
                    render: (r) => {
                        return r.email;
                    }
                },
                {
                    title: "Produkt",
                    width: "15%",
                    render: (r) => {
                        return `<a class="link" href='${STATIC_URLS["ADMIN"]}produkt/${r.product_id}'>${escapeHTML(r.product)}</a>`;
                    },
                    nobreak: true,
                    escape: false
                },
                {
                    title: "Ilość",
                    width: "3%",
                    render: (r) => {
                        return r.stock;
                    }
                },
                {
                    title: "Kiedy",
                    width: "5%",
                    render: (r) => {
                        return r.requested;
                    }
                },
                {
                    title: "Status",
                    width: "4%",
                    render: (r) => {
                        return r.sent == 1 ? "<div style='background:#2c2' class='rect'>Wysłano maila</div>" : "<div style='background:#25c' class='rect'>Oczekuje</div>";
                    },
                    escape: false
                },
            ],
            controlsRight: `
        <div class='float-icon'>
          <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
          <i class="fas fa-search"></i>
        </div>
      `
        });
    });
</script>

<?php startSection("content"); ?>

<h1>Oczekujący na produkty</h1>

<div class="mytable"></div>

<?php include "admin/page_template.php"; ?>