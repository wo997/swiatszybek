<?php //route[admin/newsletter] 
?>

<?php startSection("head"); ?>

<title>Newsletter</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        createTable({
            name: "mytable",
            url: "/admin/search_newsletter",
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
            controls: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                    <a class="btn primary" href="/admin/napisz_newsletter">Wyślij wiadomość&nbsp;<i class="fa fa-envelope"></i></a>
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
<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>