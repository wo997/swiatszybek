<?php //route[admin/konfiguracja]

$category = isset($url_params[2]) ? $url_params[2] : null;

?>

<?php startSection("head"); ?>

<title>Konfiguracja</title>

<style>

</style>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        createTable({
            name: "config_table",
            url: "/admin/search_konfiguracja",
            lang: {
                subject: "stałych"
            },
            primary: "prop_id",
            db_table: "konfiguracja",
            sortable: true,
            requiredParam: () => {
                return "<?= $category ?>";
            },
            definition: [{
                    title: "Id",
                    width: "10%",
                    render: (r) => {
                        return `${r.prop_id}`;
                    },
                },
                {
                    title: "Nazwa",
                    width: "10%",
                    render: (r) => {
                        return `${r.prop_name_nice}`;
                    },
                },
                {
                    title: "Klucz",
                    width: "10%",
                    render: (r) => {
                        return `${r.prop_name}`;
                    },
                },
                {
                    title: "Wartość",
                    width: "10%",
                    render: (r) => {
                        return `${r.prop_value}`;
                    },
                },
                {
                    title: "",
                    width: "185px",
                    render: (r, i, t) => {
                        return `
                            <div class="btn secondary" onclick="${t.name}.showEditCategory(this,${i})">Edytuj <i class="fa fa-cog"></i></div>
                            <div class="btn primary" onclick="${t.name}.openCategory(${i})">Więcej <i class="fas fa-chevron-circle-right"></i></div>
                        `;
                    },
                    escape: false
                }
            ],
            controls: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Filtruj..." data-param="search">
                        <i class="fas fa-search"></i>
                    </div>
                `
        });

        // TODO instead of createtable
        // createSimpleList();
    });
</script>

<?php startSection("content"); ?>

<div class="config_table"></div>

<?php include "admin/default_page.php"; ?>