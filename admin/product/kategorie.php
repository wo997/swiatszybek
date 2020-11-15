<?php //route[{ADMIN}kategorie] 
?>

<?php startSection("head"); ?>

<title>Kategorie produktów</title>

<style>

</style>

<script>
    useTool("cms");

    document.addEventListener("DOMContentLoaded", function() {
        createDatatable({
            name: "mytable",
            url: STATIC_URLS["ADMIN"] + "search_product_categories",
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
                formParams: {
                    include_attributes: true
                }
            },
            definition: [{
                    title: "Kategoria",
                    width: "10%",
                    render: (r, i, t) => {
                        return `
                            <div class="link text-plus-icon" onclick="${t.name}.showEditCategory(this,${i})" data-tooltip="Sortuj malejąco / rosnąco">
                                <span>${r.title}</span>
                                <i class="fa fa-cog"></i>
                            </div>
                        `;
                    },
                    escape: false,
                    searchable: "text",
                    sortable: true,
                },
                {
                    title: "Podkategorie",
                    width: "13%",
                    render: (r, i, t) => {
                        return `
                            <div class="link text-plus-icon" onclick="${t.name}.openCategory(${i})" >
                                <span>${nonull(r.subcategories,"Brak")}</span>
                                <i class="fas fa-chevron-circle-right"></i>
                            </div>
                        `;
                    },
                    escape: false,
                    searchable: "text",
                    sortable: true,
                },
                getPublishedDefinition(),
                {
                    title: "link",
                    width: "7%",
                    render: (r) => {
                        return `${r.link}`;
                    },
                },
                {
                    title: "Ikonka",
                    width: "60px",
                    render: (r) => {
                        return `<img data-src="${r.icon}" style="max-width: 100%;max-height: 32px;display: block;">`;
                    },
                    escape: false
                },
                {
                    title: "Opis górny",
                    width: "6%",
                    render: (r) => {
                        return r.description_text.replace(/\n/g, "");
                    }
                },
                {
                    title: "Zawartość (dół)",
                    width: "6%",
                    render: (r) => {
                        return r.content_text.replace(/\n/g, "");
                    }
                },
            ],
            controlsRight: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                `,
            onSearch: () => {
                lazyLoadImages(false);
            }
        });

        createDatatable({
            name: "atrybuty",
            url: STATIC_URLS["ADMIN"] + "search_product_attributes",
            lang: {
                subject: "atrybutów",
            },
            primary: "attribute_id",
            db_table: "product_attributes",
            selectable: {
                data: [],
                output: "attributes",
                has_metadata: true,
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
                {
                    title: "Główny filtr <i class='fas fa-info-circle' data-tooltip='Wyświetl powyżej listy produktów'></i>",
                    width: "130px",
                    className: "metadata-column center",
                    render: (r) => {
                        return `
                            <label>
                                <input type='checkbox' data-metadata='main_filter'>
                                <div class="checkbox standalone"></div>
                            </label>`;
                    },
                    escape: false
                },
            ],
            controlsRight: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                `
        });
    });

    function loadCategoryForm(formId, data, isNew) {
        if (!data.name) data.name = "";

        var formElement = $(`#${formId}`);

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
                category_id: "-1"
            };
        }

        setFormData(data, formElement);

        var canDelete = !data.subcategories;

        formElement.find(".caseCanDelete").classList.toggle("hidden", isNew);
        toggleDisabled(formElement.find(`.btn.red`), !canDelete);
        formElement.find(".btn.red + i").classList.toggle("hidden", canDelete);

        lazyLoadImages();
    }

    function saveCategoryForm(remove = false) {
        var f = $("#editCategory");
        if (!remove && !validateForm(f)) {
            return;
        }
        var params = getFormData(f);
        if (remove) {
            params["remove"] = true;
        }
        xhr({
            url: STATIC_URLS["ADMIN"] + "save_product_category",
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
        $(`[name="link"]`).setValue(escapeUrl($(`[name="title"]`).value));
    }
</script>

<?php startSection("content"); ?>

<h1>Kategorie produktów</h1>

<div class="mytable"></div>

<div id="editCategory" data-modal data-expand data-form>
    <div class="modal-body">
        <div class="custom-toolbar">
            <span class="title">Edycja kategorii</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveCategoryForm();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll-panel scroll-shadow panel-padding">
            <div>
                <div class="field-title">Nazwa kategorii</div>
                <input type="text" name="title" data-validate autocomplete="off" class="field">

                <div class="field-title">Link</div>
                <div style="display:flex">
                    <input type="text" name="link" data-validate autocomplete="off" class="field">
                    <button class="btn primary" onclick="rewriteURL()" style="flex-shrink:0">Uzupełnij na podstawie tytułu</button>
                </div>

                <div class="field-title">Widoczność</div>
                <select name="published" class="field">
                    <option value="1">Publiczna</option>
                    <option value="0">Ukryta</option>
                </select>

                <div class="field-title">
                    Ikonka
                    <button class="btn primary" onclick='fileManager.open(this.next(),{asset_types:["image"], size: "sm"})'>Wybierz</button>
                    <img name="icon" data-type="src" style="max-width:100px;max-height:100px" />
                </div>

                <div class="field-title">Kategoria nadrzędna</div>
                <div class="category-picker" name="parent_id" data-source="product_categories" data-single></div>

                <div class="field-title">Wyświetlane filtry (atrybuty) <a href="<?= STATIC_URLS["ADMIN"] ?>atrybuty" target="_blank" class="btn secondary" onclick="editAttribute()"><span>Zarządzaj</span> <i class="fa fa-cog"></i></a> </div>
                <div class="atrybuty"></div>

                <div class="field-title">Opis górny <button class="btn primary" onclick='quillEditor.open($(`#editCategory .description`));'>Edytuj</button></div>
                <div class="description ql-editor preview_html" name="description" data-type="html" style="max-height: 300px;"></div>

                <div class="field-title">Zawartość (dół) <button class="btn primary" onclick="editCMS($('#editCategory .content'));">Edytuj </button></div>
                <div class="content cms preview_html" name="content" data-type="html" style="max-height: 300px;"></div>

                <div class="caseCanDelete" style="margin-left:auto;margin-top:auto;align-self: flex-end; padding-top:30px; padding-bottom: 15px">
                    <button class="btn red" onclick="if(confirm(' Czy aby na pewno chcesz usunąć tą kategorię?')) saveCategoryForm(true);">Usuń <i class="fa fa-times"></i></button>
                    <i class='fas fa-info-circle' data-tooltip='Możliwe tylko po usunięciu podkategorii'></i>
                </div>
            </div>
        </div>

        <input type="hidden" name="category_id">
    </div>
</div>

<?php include "admin/page_template.php"; ?>