<?php //route[admin/atrybuty] 
?>

<?php startSection("head"); ?>

<title>Atrybuty produktów</title>

<style>
</style>

<script>
    useTool("cms");

    document.addEventListener("DOMContentLoaded", function() {

        var output = "";
        Object.entries(attribute_data_types).forEach(([value, attribute]) => {
            output += `<option value='${value}'>${attribute.description}</option>`;
        });
        $(`[name="data_type"]`).insertAdjacentHTML("afterbegin", output);

        createTable({
            name: "mytable",
            url: "/admin/search_product_attributes",
            lang: {
                subject: "atrybutów",
            },
            primary: "attribute_id",
            db_table: "product_attributes",
            sortable: true,
            definition: [{
                    title: "Nazwa atrybutu",
                    width: "20%",
                    render: (r) => {
                        return `${r.name}`;
                    },
                },
                {
                    title: "Typ danych",
                    width: "20%",
                    render: (r) => {
                        var type_def = attribute_data_types[r.data_type]
                        if (type_def) {
                            return `${type_def.description}`;
                        }
                        return "";
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
                    title: "",
                    width: "95px",
                    render: (r, i, t) => {
                        return `
                            <div class="btn secondary" onclick="editAttribute(this,${i},${t.name})">Edytuj <i class="fa fa-cog"></i></div>
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
                    <div class="btn primary" onclick="editAttribute(this)"><span>Dodaj atrybut</span> <i class="fa fa-plus"></i></div>
                `
        });

        createSimpleList({
            name: "attribute_values_textlist",
            fields: {
                value_id: {},
                value: {
                    unique: true,
                    allow_empty: true
                }
            },
            render: (data) => {
                var clean = (x) => {
                    return x.toString().replace(/"/g, "");
                };
                return `
                    <input type='hidden' data-list-param="value_id" value="${clean(data.value_id)}">
                    <input type='text' class='field' style='flex-grow:1' data-list-param="value" value="${clean(data.value)}">
                `;
            },
            default_row: {
                value_id: -1,
                value: ""
            },
            recursive: 3,
            title: "Wszystkie wartości"
        });

        createSimpleList({
            name: "attribute_values_colorlist",
            fields: {
                value_id: {},
                value: {
                    unique: true,
                    allow_empty: true
                },
                color: {}
            },
            render: (data) => {
                var clean = (x) => {
                    return x.toString().replace(/"/g, "");
                };
                return `
                    <input type='hidden' data-list-param="value_id" value="${clean(data.value_id)}">
                    <input type='text' class='field inline jscolor' data-list-param="color" value="${clean(data.color)}">
                    <input type='text' class='field' style='flex-grow:1' data-list-param="value" value="${clean(data.value)}">
                `;
            },
            default_row: {
                value_id: -1,
                value: "",
                color: "",
            },
            onChange: () => {
                jscolor.installByClassName();
            },
            recursive: 3,
            title: "Wszystkie kolory"
        });

        createTable({
            name: "kategorie",
            url: "/admin/search_product_categories",
            lang: {
                subject: "kategorii",
            },
            primary: "category_id",
            db_table: "product_categories",
            selectable: {
                data: [],
                output: "categories"
            },
            definition: [{
                    title: "Kategoria",
                    render: (r) => {
                        return `${r.title}`;
                    },
                },
                {
                    title: "Główny filtr",
                    width: "20%",
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
                        <input type="text" placeholder="Filtruj..." data-param="search">
                        <i class="fas fa-search"></i>
                    </div>
                    <a href="/admin/atrybuty" target="_blank" class="btn primary" onclick="editAttribute()"><span>Zarządzaj</span> <i class="fa fa-cog"></i></a>
                `
        });
    });

    function editAttribute(btn = null, row_id = null, table = null) {
        var formName = "editAttribute";
        var form = $(`#${formName}`);

        var data = {
            attribute_id: -1,
            name: "",
            data_type: Object.keys(attribute_data_types)[0],
            attr_ids: "",
            attr_values: ""
        };

        if (row_id !== null) {
            data = table.results[row_id];

            xhr({
                url: "/admin/get_attribute_values",
                params: {
                    attribute_id: data.attribute_id
                },
                success: (res) => {
                    var list = window[`attribute_values_${data.data_type}`];

                    if (list) {
                        list.setValues(res)
                    };
                    setModalInitialState(formName);
                }
            });
        } else {
            var list = window[`attribute_values_${data.data_type}`];

            if (list) {
                list.setValues([]);
            };
        }

        setFormData(data, form);
        showModal(formName, {
            source: btn
        });
    }

    function saveAttribute(remove = false) {
        var f = $("#editAttribute");
        if (!remove && !validateForm({
                form: f
            })) return;
        var params = getFormData(f);
        if (remove) {
            params["remove"] = true;
        }
        xhr({
            url: "/admin/save_product_attribute",
            params: params,
            success: (res) => {
                mytable.search();
            }
        });
        hideModalTopMost();
    }

    function toggleValues() {
        var data_type = $(`[name="data_type"]`).value;
        Object.entries(attribute_data_types).forEach(([type, params]) => {
            if (params.field) {
                return;
            }
            var node = $(`[name="attribute_values_${type}"]`);
            if (node) {
                node.classList.toggle("hidden", data_type != type)
            };
        });
    }
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<div id="editAttribute" data-modal data-expand data-exclude-hidden>
    <div class="stretch-vertical">
        <div class="custom-toolbar">
            <span class="title">Edycja atrybutu</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveAttribute();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="stretch-vertical">
            <div class="desktopRow spaceColumns">
                <div>
                    <div class="field-title">Nazwa atrybutu</div>
                    <input type="text" name="name" data-validate autocomplete="off" class="field">

                    <div class="field-title">Typ danych</div>
                    <select name="data_type" class="field" onchange="toggleValues()"></select>

                    <div name="attribute_values_textlist" class="slim"></div>
                    <div name="attribute_values_colorlist" class="slim"></div>

                </div>
                <div>
                    <div class="field-title">Powiąż z kategoriami</div>
                    <div class="kategorie"></div>
                </div>
            </div>

            <br>
            <div style="margin-top:auto; align-self: flex-end; padding-top:30px; margin-bottom:10px">
                <button class="btn red" onclick="if(confirm('Czy aby na pewno chcesz usunąć ten atrybut?')) saveAttribute(true);">Usuń <i class="fa fa-times"></i></button>
            </div>

            <input type="hidden" name="attribute_id">

        </div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>