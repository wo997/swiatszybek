<?php //route[admin/strony] 
?>

<?php startSection("head"); ?>

<title>Strony</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        var tableName = "mytable";
        createDatatable({
            name: tableName,
            url: "/admin/search_strony",
            db_table: "cms",
            primary: "cms_id",
            lang: {
                subject: "stron",
            },
            params: () => {},
            definition: [{
                    title: "URL (link)",
                    width: "20%",
                    render: (r) => {
                        return `${r.link ? r.link : "STRONA GŁÓWNA"}`
                    },
                },
                {
                    title: "Tytuł",
                    width: "20%",
                    field: "title",
                    searchable: "text",
                },
                {
                    title: "Tytuł SEO",
                    width: "20%",
                    field: "seo_title",
                    searchable: "text",
                },
                {
                    title: "Opis SEO",
                    width: "20%",
                    field: "seo_description",
                    searchable: "text",
                },
                getPublishedDefinition(),
                {
                    title: "",
                    width: "195px",
                    render: (r) => {
                        return `<a class="btn primary" target="_blank" href="/${r.link}">Podgląd <i class="fas fa-eye"></i></a> <a class='btn primary' href='/admin/strona/${r.cms_id}'>Edytuj <i class="fas fa-chevron-circle-right"></i></a>`;
                    },
                    escape: false
                }
            ],
            controlsRight: `
                <div class='float-icon space-right'>
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>        
                <button class="btn important" onclick='window.location="/admin/strona"'>Strona <i class="fa fa-plus"></i></button>
            `
        });
    });
</script>

<?php startSection("content"); ?>

<h1>Strony</h1>

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>