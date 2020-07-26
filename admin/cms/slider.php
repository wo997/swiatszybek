<?php //->[admin/slider] 
?>

<?php startSection("head"); ?>

<title>Slider</title>

<style>
    .ql-editor {
        font-size: 20px;
    }

    .typ {
        padding: 5px;
        background: #eee;
    }

    .typ .number {
        font-weight: bold;
    }

    .model {
        padding: 5px;
        padding-left: 70px;
        border-bottom: 1px solid #ccc;
    }

    .model:before {
        content: "●";
    }

    .number {
        width: 30px;
        border: none !important;
        margin-right: 5px;
        text-align: center;
        background: transparent;
    }

    #typy input {
        padding: 2px 4px;
    }

    .remove {
        background: #f44;
        color: white;
    }

    .unpublished {
        background: #fcc;
        filter: contrast(0.5);
    }

    .slide-img {
        max-width: 500px;
        display: block;
        margin-top: 8px;
    }

    .typ-wrapper {
        margin: 3px;
    }
</style>
<script>
    useTool("cms");

    window.addEventListener("load", () => {
        imagePicker.setDefaultTag("slider");
    });

    document.addEventListener("DOMContentLoaded", function() {
        createTable({
            name: "mytable",
            url: "/admin/search_slider",
            primary: "slide_id",
            db_table: "slides",
            sortable: true,
            params: () => {
                return {

                }
            },
            definition: [{
                    title: "ID",
                    width: "30%",
                    render: (r) => {
                        return `${r.slide_id}`;
                    }
                },
                {
                    title: "Content",
                    width: "70%",
                    render: (r) => {
                        return `${r.content}`;
                    }
                },
            ],
            controls: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Szukaj..." data-param="search">
                        <i class="fas fa-search"></i>
                    </div>
                    <a class="btn primary" href="/admin/napisz_newsletter">Wyślij wiadomość&nbsp;<i class="fa fa-envelope"></i></a>
                `
        });
    });
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<?php include "admin/default_page.php"; ?>