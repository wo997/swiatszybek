<?php //route[admin/slider] 
?>

<?php startSection("head"); ?>


<title>Slider</title>

<style>
</style>

<script>
    useTool("cms");

    window.addEventListener("load", () => {
        fileManager.setDefaultTag("slider");
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
                    title: "Wersja desktopowa",
                    width: "40%",
                    render: (r) => {
                        return `${r.content_desktop}`;
                    },
                    escape: false
                },
                {
                    title: "Wersja mobilna",
                    width: "40%",
                    render: (r) => {
                        return `${r.content_mobile}`;
                    },
                    escape: false
                },
                getPublishedDefinition(),
                {
                    title: "",
                    width: "95px",
                    render: (r, i) => {
                        return `<div class='btn primary' onclick='editSlide(this, ${i})'>Edytuj <i class="fas fa-cog"></i></div>`;
                    },
                    escape: false
                }
            ],
            controls: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search">
                    <i class="fas fa-search"></i>
                </div>
                <div class="btn primary" onclick="newSlide(this)"><span>Nowy slajd</span> <i class="fa fa-plus"></i></div>
                `
        });
    });

    function newSlide(btn) {
        var data = {
            slide_id: "-1",
            content_desktop: "",
            content_mobile: "",
            published: "0"
        };
        setFormData(data, "#slideEdit");

        setTitle("Nowy slajd");
        showModal("slideEdit", {
            source: btn
        });
    }

    function editSlide(btn, i) {
        var data = mytable.results[i];
        setFormData(data, "#slideEdit");

        setTitle("Edycja slajdu");
        showModal("slideEdit", {
            source: btn
        });
    }

    function saveSlide(remove = false) {
        var f = $("#slideEdit");

        if (!remove && !validateForm(f)) {
            return;
        }
        var params = getFormData(f);

        if (remove) {
            params["remove"] = true;
        }

        xhr({
            url: "/admin/save_slider",
            params: params,
            success: (res) => {
                mytable.search();
            }
        });
    }

    function setTitle(title = "Edycja slajdu") {
        $(`#slideEdit .custom-toolbar .title`).innerHTML = title;
    }
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<div id="slideEdit" data-modal data-expand>
    <div class="stretch-vertical">
        <div class="custom-toolbar">
            <span class="title">Edycja slajdu</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveSlide();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div>
            <div class="field-title">Widoczność</div>
            <select name="published" class="field">
                <option value="1">Publiczny</option>
                <option value="0">Ukryty</option>
            </select>

            <h3>Zawartość slidera w wersji desktopowej <i class="fas fa-desktop"></i> <button type="button" onclick="editCMS(this.parent().next())" class="btn primary">Edytuj <i class="far fa-edit"></i></button></h3>
            <div class="cms preview_html" name="content_desktop" data-type="html"></div>

            <h3>Zawartość slidera w wersji mobilnej <i class="fas fa-mobile-alt"></i> <button type="button" onclick="editCMS(this.parent().next())" class="btn primary">Edytuj <i class="far fa-edit"></i></button></h3>
            <div class="cms preview_html" name="content_mobile" data-type="html"></div>

            <input type="hidden" name="slide_id">
        </div>
        <div style="margin-top:auto;align-self: flex-end; padding-top:30px">
            <button class="btn red" onclick="saveSlide(true);hideParentModal(this)">Usuń slajd <i class="fa fa-trash"></i></button>
        </div>
    </div>
</div>
<?php include "admin/default_page.php"; ?>