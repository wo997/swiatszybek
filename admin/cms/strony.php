<?php //->[admin/strony] 
?>

<?php startSection("head"); ?>

<title>Strony</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        var tableName = "mytable";
        createTable({
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
                    width: "10%",
                    render: (r) => {
                        return `${r.link ? r.link : "STRONA GŁÓWNA"}`
                    },
                    escape: false
                },
                {
                    title: "Tytuł",
                    width: "10%",
                    render: (r) => {
                        return r.title;
                    },
                    escape: false
                },
                {
                    title: "Opis",
                    width: "10%",
                    render: (r) => {
                        return r.meta_description;
                    },
                    escape: false
                },
                getPublishedDefinition(),
                {
                    title: "",
                    width: "95px",
                    render: (r) => {
                        return `<a class="btn primary" target="_blank" href="/${r.link}">Podgląd <i class="fas fa-eye"></i></a> <a class='btn primary' href='/admin/cms/${r.cms_id}'>Edytuj <i class="fas fa-chevron-circle-right"></i></a>`;
                    },
                    escape: false
                }
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
                <a class="btn primary" href="/admin/cms"><span>Nowa strona</span> <i class="fa fa-plus"></i></a>
            `
        });
    });
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>