<?php //route[admin/menu-glowne] 
?>

<?php startSection("head"); ?>

<title>Menu</title>

<style>

</style>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        createDatatable({
            name: "mytable",
            url: "/admin/search_menu",
            primary: "category_id",
            db_table: "menu",
            sortable: true,
            lang: {
                subject: "menu",
                main_category: ">"
            },
            tree_view: {
                form: "editCategory",
                loadCategoryForm: loadCategoryForm
            },
            definition: [{
                    title: "Menu",
                    width: "15%",
                    render: (r) => {
                        return `${r.title}`;
                    },
                },
                {
                    title: "Podmenu",
                    width: "20%",
                    render: (r) => {
                        return `${nonull(escapeHTML(r.subcategories),`<i class="fas fa-ban"></i> Brak`)}`;
                    },
                    escape: false
                },
                getPublishedDefinition(),
                {
                    title: "Link",
                    width: "15%",
                    render: (r) => {
                        var icon = "";
                        if (r.url) icon = `<i class="fas fa-link"></i>`;
                        if (r.cms_url) icon = `<i class="fas fa-file-alt"></i>`;
                        if (r.product_id) icon = `<i class="fas fa-cube"></i>`;
                        return `<a href="${r.actual_link.url}" target="_blank" class="link">${icon} ${r.actual_link.title}</a>`;
                    },
                    escape: false
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
            controlsRight: `
                    <div class='float-icon'>
                        <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
                        <i class="fas fa-search"></i>
                    </div>
                `
        });

        createDatatable({
            name: "strony",
            url: "/admin/search_strony",
            db_table: "cms",
            primary: "cms_id",
            lang: {
                subject: "stron",
            },
            rowCount: 10,
            primary: "cms_id",
            selectable: {
                data: null,
                output: "cms_id",
                singleselect: true,
                validate: true
            },
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
                        return r.seo_description;
                    },
                    escape: false
                },
                getPublishedDefinition(),
                {
                    title: "",
                    width: "10%",
                    render: (r) => {
                        return `<a class="btn primary" target="_blank" href="/${r.link}">Podgląd <i class="fas fa-eye"></i>`;
                    },
                    escape: false
                }
            ],
            controlsRight: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>
            `
        });

        createDatatable({
            name: "produkty",
            url: "/admin/search_products",
            lang: {
                subject: "produktów",
            },
            rowCount: 10,
            primary: "product_id",
            db_table: "products",
            selectable: {
                data: null,
                output: "product_id",
                singleselect: true,
                validate: true
            },
            definition: [{
                    title: "Nazwa produktu",
                    width: "50%",
                    render: (r) => {
                        return `<a class="btn secondary" target="_blank" href='/admin/produkt/${r.product_id}'>Pokaż <i class="fas fa-chevron-circle-right"></i></a>&nbsp;&nbsp;${escapeHTML(r.title)}`
                    },
                    escape: false
                },
                getPublishedDefinition(),
                {
                    title: "W magazynie",
                    width: "10%",
                    render: (r) => {
                        return `${nonull(r.amount,0)} szt.`;
                    }
                },
            ],
            controlsRight: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>
            `
        });
    });

    function loadCategoryForm(formId, data, isNew) {
        if (isNew) {
            data = {
                ...data,
                cms_id: "",
                product_id: "",
                published: "0",
                title: "Menu",
                url: ""
            }
        }

        var formElement = $(`#${formId}`);

        setFormData(data, formElement);

        var canDelete = !data.subcategories;

        var tab_id = 1;
        if (data.cms_id) tab_id = 2;
        if (data.product_id) tab_id = 3;
        showTab($(".tab-menu-link"), tab_id);

        formElement.find(".caseCanDelete").classList.toggle("hidden", isNew);
        toggleDisabled(formElement.find(`.btn.red`), !canDelete);
        formElement.find(".btn.red + i").classList.toggle("hidden", canDelete);
    }

    function saveCategoryForm(remove = false) {
        var f = $("#editCategory");
        if (!remove && !validateForm(f)) {
            return;
        }

        $$(".tab-menu-link .tab-content.hidden input").forEach(e => {
            e.value = "";
        })

        var params = getFormData(f);
        if (remove) {
            params["remove"] = true;
        }
        xhr({
            url: "/admin/save_menu",
            params: params,
            success: (res) => {
                mytable.postSaveCategory(params, remove);
                loadCategoryPicker("menu", {
                    skip: 0
                });
            }
        });
        hideModal(mytable.tree_view.form);
    }

    document.addEventListener("DOMContentLoaded", function() {
        loadCategoryPicker("menu", {
            skip: 0
        });
    });
</script>

<?php startSection("content"); ?>

<h1>Menu główne</h1>

<div class="mytable"></div>

<div id="editCategory" data-modal data-expand>
    <div class="modal-body">
        <div class="custom-toolbar">
            <span class="title">Edycja menu</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveCategoryForm();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll-panel scroll-shadow panel-padding">
            <div class="desktopRow spaceColumns">
                <div>
                    <div class="field-title">Nazwa menu</div>
                    <input type="text" name="title" data-validate autocomplete="off" class="field">
                </div>
                <div>
                    <div class="field-title">Widoczność</div>
                    <select name="published" class="field">
                        <option value="1">Publiczna</option>
                        <option value="0">Ukryta</option>
                    </select>
                </div>
            </div>

            <div class="field-title">Menu nadrzędne</div>
            <div class="category-picker" name="parent_id" data-source="menu" data-single></div>

            <div class="field-title">Powiązanie</div>
            <div class="tab-menu tab-menu-link">
                <div class="tab-header">
                    <div class="tab-option" data-tab_id="1">
                        Link URL
                    </div>
                    <div class="tab-option" data-tab_id="2">
                        Strona CMS
                    </div>
                    <div class="tab-option" data-tab_id="3">
                        Produkt
                    </div>
                </div>
                <div class="tab-content hidden" data-tab_id="1">
                    <div class="field-title">Wpisz link do strony - URL</div>
                    <input type="text" name="url" autocomplete="off" class="field" data-validate>
                </div>
                <div class="tab-content hidden" data-tab_id="2">
                    <div class="field-wrapper">
                        <div class="field-title">Wskaż stronę CMS</div>
                        <div class="strony"></div>
                    </div>
                </div>
                <div class="tab-content hidden" data-tab_id="3">
                    <div class="field-wrapper">
                        <div class="field-title">Wskaż produkt</div>
                        <div class="produkty"></div>
                    </div>
                </div>
            </div>

            <br>
            <div class="caseCanDelete" style="margin-top:auto;text-align:right; padding-top:30px">
                <i class='fas fa-info-circle' data-tooltip='Możliwe tylko po usunięciu wszystkich podmenu'></i>
                <button class="btn red" onclick="if(confirm('Czy aby na pewno chcesz usunąć to menu?')) saveCategoryForm(true);">Usuń <i class="fa fa-times"></i></button>
            </div>
            <input type="hidden" name="category_id">

        </div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>