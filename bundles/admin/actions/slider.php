<?php //route[/{ADMIN}slider] 
?>

<?php startSection("head_content"); ?>


<title>Slider</title>

<style>
</style>

<script>
    useTool("cms");

    window.addEventListener("load", () => {
        fileManager.setDefaultName("slider");
    });

    domload(() => {
        createDatatable({
            name: "mytable",
            url: STATIC_URLS["ADMIN"] + "search_slider",
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
                        return `<div class='cms'>${r.content_desktop}</div>`;
                    },
                    escape: false
                },
                {
                    title: "Wersja mobilna",
                    width: "40%",
                    render: (r) => {
                        return `<div class='cms'>${r.content_mobile}</div>`;
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
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
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

        setModalTitle("#slideEdit", "Nowy slajd");
        showModal("slideEdit", {
            source: btn
        });
    }

    function editSlide(btn, i) {
        var data = mytable.results[i];
        setFormData(data, "#slideEdit");

        setModalTitle("#slideEdit", "Edycja slajdu");

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
            url: STATIC_URLS["ADMIN"] + "save_slider",
            params: params,
            success: (res) => {
                mytable.search();
            }
        });
    }
</script>

<?php startSection("body_content"); ?>

<div class="mytable"></div>

<div id="slideEdit" data-modal data-expand>
    <div class="modal_body">
        <div class="custom_toolbar">
            <span class="title"></span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fas fa-times"></i></button>
            <button class="btn primary" onclick="saveSlide();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll_panel scroll_shadow panel_padding">
            <div>
                <div class="label">Widoczność</div>
                <select name="published" class="field">
                    <option value="1">Publiczny</option>
                    <option value="0">Ukryty</option>
                </select>

                <h3>Zawartość slidera w wersji desktopowej <i class="fas fa-desktop"></i> <button onclick="editCMS(this._parent()._next())" class="btn primary">Edytuj <i class="far fa-edit"></i></button></h3>
                <div class="cms preview_html" name="content_desktop" data-type="html"></div>

                <h3>Zawartość slidera w wersji mobilnej <i class="fas fa-mobile-alt"></i> <button onclick="editCMS(this._parent()._next())" class="btn primary">Edytuj <i class="far fa-edit"></i></button></h3>
                <div class="cms preview_html" name="content_mobile" data-type="html"></div>

                <input type="hidden" name="slide_id">

                <div style="margin-top:auto;align-self: flex-end; padding-top:30px">
                    <button class="btn red" onclick="saveSlide(true);hideParentModal(this)">Usuń slajd <i class="fa fa-trash"></i></button>
                </div>
            </div>
        </div>
    </div>
</div>
<?php include "bundles/admin/templates/default.php"; ?>