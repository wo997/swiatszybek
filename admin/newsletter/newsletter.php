<?php //route[{ADMIN}newsletter] 
?>

<?php startSection("head"); ?>

<title>Newsletter</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        createDatatable({
            name: "mytable",
            url: STATIC_URLS["ADMIN"] + "search_newsletter",
            width: 800,
            params: () => {
                return {

                }
            },
            definition: [{
                    title: "Email",
                    width: "70%",
                    render: (r) => {
                        return `${r.email}`;
                    }
                },
                {
                    title: "Dodano",
                    width: "30%",
                    render: (r) => {
                        return `${r.requested}`;
                    }
                },
            ],
            controlsRight: `
                    <div class='float-icon space-right'>
                        <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                    <a class="btn important" href="${STATIC_URLS["ADMIN"]}napisz_newsletter">Wyślij <i class="fa fa-envelope"></i></a>
                `
        });
    });
</script>

<?php startSection("content"); ?>

<?php
if (isset($_GET["wyslano"])) {
    echo "<h3 style='text-align:center'>Wysłano newsletter!</h3>";
}
?>

<h1>Newsletter</h1>

<div class="mytable"></div>

<?php include "admin/page_template.php"; ?>