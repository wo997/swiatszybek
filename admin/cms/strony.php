<?php //route[{ADMIN}strony] 
?>

<?php startSection("head_content"); ?>

<title>Strony</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        var tableName = "mytable";
        createDatatable({
            name: tableName,
            url: STATIC_URLS["ADMIN"] + "search_strony",
            db_table: "cms",
            primary: "cms_id",
            lang: {
                subject: "stron",
            },
            params: () => {},
            definition: [{
                    title: "Tytuł",
                    width: "20%",
                    field: "title",
                    render: (r) => {
                        return `
                            <a class="link text-plus-icon" href="${STATIC_URLS["ADMIN"]}strona/${r.cms_id}">
                                <span>${escapeHTML(r.title)}</span>
                                <i class="fas fa-chevron-circle-right"></i>
                            </a>
                        `;
                    },
                    escape: false,
                    searchable: "text",
                },
                {
                    title: "URL (link)",
                    width: "20%",
                    render: (r) => {
                        return `
                            <a class="link text-plus-icon" href="/${r.link}" target="_blank">
                                <span>${escapeHTML(r.link ? r.link : "STRONA GŁÓWNA")}</span>
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                        `;
                    },
                    escape: false,
                    searchable: "text",
                },
                getPublishedDefinition(),
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
            ],
            controlsRight: `
                <div class='float-icon space-right'>
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>        
                <button class="btn important" onclick='window.location="${STATIC_URLS["ADMIN"]}strona"'>Strona <i class="fa fa-plus"></i></button>
            `
        });
    });
</script>

<?php startSection("body_content"); ?>

<h1>Strony</h1>

<div class="mytable"></div>

<?php include "admin/page_template.php"; ?>