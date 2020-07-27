<?php //->[admin/kategorie] 
?>

<?php startSection("head"); ?>

<title>Kategorie produktów</title>

<style>

</style>

<script>
    useTool("cms");

    document.addEventListener("DOMContentLoaded", function() {
        createTable({
            name: "mytable",
            url: "/admin/search_product_categories",
            lang: {
                subject: "kategorii",
                main_category: ">"
            },
            primary: "category_id",
            db_table: "product_categories",
            sortable: true,
            tree_view: {
                form: "editCategory",
                loadCategoryForm: loadCategoryForm,
            },
            definition: [{
                    title: "Kategoria",
                    width: "10%",
                    render: (r) => {
                        return `${r.title}`;
                    },
                },
                {
                    title: "link",
                    width: "10%",
                    render: (r) => {
                        return `${r.link}`;
                    },
                },
                {
                    title: "Podkategorie",
                    width: "10%",
                    render: (r) => {
                        return `${nonull(r.subcategories,"brak")}`;
                    }
                },
                {
                    title: "Opis górny",
                    width: "10%",
                    render: (r) => {
                        return r.description_text.replace(/\n/g, "");
                    }
                },
                {
                    title: "Zawartość (dół)",
                    width: "10%",
                    render: (r) => {
                        return r.content_text.replace(/\n/g, "");
                    }
                },
                {
                    title: "Ikonka",
                    width: "60px",
                    render: (r) => {
                        return `<img src="/uploads/sm/${r.icon}" style="max-width: 100%;max-height: 32px;display: block;">`;
                    },
                    escape: false
                },
                {
                    title: "Publiczna?",
                    width: "95px",
                    render: (r) => {
                        return renderIsPublished(r);
                    },
                    escape: false
                },
                {
                    title: "",
                    width: "185px",
                    render: (r, i, t) => {
                        return `
                            <div class="btn secondary" onclick="${t.name}.showEditCategory(${i})">Edytuj <i class="fa fa-cog"></i></div>
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

        createTable({
            name: "atrybuty",
            url: "/admin/search_product_attributes",
            lang: {
                subject: "atrybutów",
            },
            primary: "attribute_id",
            db_table: "product_attributes",
            selectable: {
                data: [],
                output: "attributes"
            },
            definition: [{
                    title: "Nazwa atrybutu",
                    width: "25%",
                    render: (r) => {
                        return `${r.name}`;
                    },
                },
                {
                    title: "Typ danych",
                    width: "20%",
                    render: (r) => {
                        return `${attribute_data_types[r.data_type].description}`;
                    },
                },
                {
                    title: "Wartości",
                    width: "60%",
                    render: (r) => {
                        return `${nonull(r.attr_values).replace(/,/g,", ")}`;
                    },
                },
            ],
            controlsRight: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Filtruj..." data-param="search">
                        <i class="fas fa-search"></i>
                    </div>
                    <a href="/admin/atrybuty" target="_blank" class="btn primary" onclick="editAttribute()"><span>Zarządaj</span> <i class="fa fa-cog"></i></a>
                `
        });
    });

    function loadCategoryForm(form, data, isNew) {
        if (!data.name) data.name = "";

        var formElement = $(`#${form}`);

        if (isNew) {
            data = {
                ...data,
                title: "",
                link: "",
                published: "",
                icon: "",
                attributes: [],
                description: "",
                content: "",
                published: "0",
                variant_id: "-1"
            };
        }

        setFormData(data, formElement);

        var canDelete = !data.subcategories;

        formElement.querySelector(".caseCanDelete").classList.toggle("hidden", isNew);
        toggleDisabled(formElement.querySelector(`.btn.red`), !canDelete);
        formElement.querySelector(".btn.red + i").classList.toggle("hidden", canDelete);

        clearValidateRequired();
    }

    function saveCategoryForm(remove = false) {
        var f = $("#editCategory");
        if (!remove && !validateForm({
                form: f
            })) return;
        var params = getFormData(f);
        if (remove) {
            params["remove"] = true;
        }
        xhr({
            url: "/admin/save_product_category",
            params: params,
            success: (res) => {
                mytable.postSaveCategory(params, remove);
                loadCategoryPicker("product_categories", {
                    skip: 0
                });
            }
        });
        hideModal(mytable.tree_view.form);
    }

    document.addEventListener("DOMContentLoaded", function() {
        loadCategoryPicker("product_categories", {
            skip: 0
        });
    });

    function rewriteURL() {
        $(`[name="link"]`).value = getLink($(`[name="title"]`).value);
    }
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<div id="editCategory" data-modal data-expand>
    <div class="stretch-vertical">
        <div class="custom-toolbar">
            <span class="title">Edycja kategorii</span>
            <button class="btn secondary" onclick="hideParentModal(this)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveCategoryForm();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div style="padding:10px">
            <div class="field-title">Nazwa kategorii</div>
            <input type="text" name="title" data-validate autocomplete="off" class="field">

            <div class="field-title">Link</div>
            <div style="display:flex">
                <input type="text" name="link" data-validate autocomplete="off" class="field">
                <div class="btn primary" onclick="rewriteURL()" style="flex-shrink:0">Uzupełnij na podstawie tytułu</div>
            </div>

            <div class="field-title">Widoczność</div>
            <select name="published" class="form-field">
                <option value="1">Publiczna</option>
                <option value="0">Ukryta</option>
            </select>

            <div class="field-title">
                Ikonka
                <button type="button" class="btn primary" onclick="imagePicker.open(this.nextElementSibling)">Wybierz</button>
                <img name="icon" data-type="src" data-src-prefix="/uploads/sm/" style="max-width:100px;max-height:100px" />
            </div>

            <div class="field-title">Kategoria nadrzędna</div>
            <input type="hidden" name="parent_id" data-category-picker data-category-picker-source="product_categories" data-single>

            <div class="field-title">Atrybuty produktów kategorii</div>
            <div class="atrybuty"></div>

            <div class="field-title">Opis górny <button class="btn primary" type="button" onclick='quillEditor.open($("#editCategory .description"));'>Edytuj</button></div>
            <div class="description ql-editor preview_html" name="description" data-type="html" style="max-height: 300px;"></div>

            <div class="field-title">Zawartość (dół) <button class="btn primary" type="button" onclick="editCMS($('#editCategory .content'),{ontop:true});">Edytuj </button></div>
            <div class="content cms preview_html" name="content" data-type="html" style="max-height: 300px;"></div>

            <br>
            <div class="caseCanDelete">
                <button class="btn red" onclick="if(confirm('Czy aby na pewno chcesz usunąć tą kategorię?')) saveCategoryForm(true);">Usuń <i class="fa fa-times"></i></button>
                <i class='fas fa-info-circle' data-tooltip='Możliwe tylko po usunięciu podkategorii'></i>
            </div>

            <input type="hidden" name="category_id">

        </div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>