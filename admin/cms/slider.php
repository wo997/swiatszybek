<?php //->[admin/slider] 
?>

<?php startSection("head"); ?>


<title>Slider</title>

<style>

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
                {
                    title: "Publiczny?",
                    width: "95px",
                    render: (r) => {
                        return renderIsPublished(r);
                    },
                    escape: false
                },
                {
                    title: "",
                    width: "95px",
                    render: (r, i) => {
                        return `<div class='btn primary' onclick='editSlide(${i})'>Edytuj <i class="fas fa-cog"></i></div>`;
                    },
                    escape: false
                }
            ],
            controls: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search">
                    <i class="fas fa-search"></i>
                </div>
                <div class="btn primary" onclick="newSlide()"><span>Nowy slajd</span> <i class="fa fa-plus"></i></div>
                `
        });
    });

    function newSlide() {
        var data = {
            slide_id: "-1",
            content: "",
            published: "0"
        };
        setFormData(data, $("#slideEdit"));

        setTitle("Nowy slajd");
        showModal("slideEdit");
    }

    function editSlide(i) {
        var data = mytable.results[i];
        setFormData(data, $("#slideEdit"));

        setTitle("Edycja slajdu");
        showModal("slideEdit");
    }

    function saveSlide(remove = false) {
        var f = $("#slideEdit");
        if (!remove && !validateForm({
                form: f
            })) return;
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

    // function editPage() {
    //     editCMS($(`#slideEdit [name="content"]`));
    // }
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<div id="slideEdit" data-modal data-expand>
    <div class="stretch-vertical">
        <div class="custom-toolbar">
            <span class="title">Edycja slajdu</span>
            <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveSlide();hideParentModal(this)">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div style="padding:10px">
            <div class="field-title">Widoczność</div>
            <select name="published" class="field">
                <option value="1">Publiczny</option>
                <option value="0">Ukryty</option>
            </select>

            <h3>Zawartość slidera w wersji desktopowej <i class="fas fa-desktop"></i> <button type="button" onclick="editCMS(this.parentNode.nextElementSibling)" class="btn primary">Edytuj <i class="far fa-edit"></i></button></h3>
            <div class="cms preview_html" name="content_desktop"></div>

            <h3>Zawartość slidera w wersji mobilnej <i class="fas fa-mobile-alt"></i> <button type="button" onclick="editCMS(this.parentNode.nextElementSibling)" class="btn primary">Edytuj <i class="far fa-edit"></i></button></h3>
            <div class="cms preview_html" name="content_mobile"></div>

            <input type="hidden" name="slide_id">
        </div>
    </div>
</div>
<?php include "admin/default_page.php"; ?>