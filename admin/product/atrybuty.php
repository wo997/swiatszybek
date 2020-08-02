<?php //route[admin/atrybuty] 
?>

<?php startSection("head"); ?>

<title>Atrubuty produktów</title>

<style>
    .inactive {
        pointer-events: none;
        opacity: 0.3;
    }


    .simple-list>.list {
        overflow-y: auto;
        overflow-x: hidden;
    }

    .simple-list .controls {
        display: flex;
        padding: 5px;
        background: #ccc;
        border: 1px solid #bbb;
    }

    .simple-list-row {
        margin: -1px;
        padding-right: 5px;
        display: flex;
        align-items: center;
    }

    .simple-list-row .btn.fas {
        height: 25px;
        width: 25px;
        display: inline-flex;
        justify-content: center;
        align-items: center;
    }

    .simple-list-row>.fa-times {
        color: #c22;
        border-color: #c22;
    }

    .simple-list-row>.fa-times:hover {
        background: #c22;
        color: #fff;
    }

    .sub-list {
        padding-left: 35px;
    }

    .simple-list-row-wrapper {
        background: #aaa4;
        padding-top: 3px;
        padding-bottom: 3px;
        padding-left: 5px;
    }

    .sub-list>.list>.simple-list-row-wrapper:first-child {
        padding-top: 3px;
    }

    .sub-list>.list>.simple-list-row-wrapper:last-child {
        margin-bottom: -3px;
    }

    .simple-list-row-wrapper {
        border: 1px solid #aaac;
    }

    .simple-list-row-wrapper:not(:last-child) {
        border-bottom: none;
    }

    .sub-list .simple-list-row-wrapper {
        border-right: none;
    }
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
            name: "attribute_values",
            fields: {
                value_id: {

                },
                value: {
                    unique: true,
                }

            },
            render: (data) => {
                var clean = (x) => {
                    return x.toString().replace(/"/g, "");
                };
                return `
                    <input type='hidden' data-list-param="value_id" value="${clean(data.value_id)}">
                    <input type='text' style='width:190px' data-list-param="value" value="${clean(data.value)}">
                `;
            },
            output: `#editAttribute [name="attribute_values"]`,
            default_row: {
                value_id: -1,
                value: ""
            },
            recursive: 3,
            title: "Wszystkie wartości"
        });
    });

    function createSimpleList(params = {}) {
        var list = {};
        list.name = params.name;
        list.fields = params.fields;
        list.params = params;
        list.recursive = nonull(params.recursive, 0);

        list.wrapper = $(`.${params.name}`);
        list.wrapper.classList.add("simple-list");

        var className = "";

        if (!params.title) {
            params.title = "";
        }

        if (params.title) {
            className = "field-title";
        }

        list.wrapper.insertAdjacentHTML("afterbegin", `
            <div class="${className}">
                <span>${params.title}</span>
                <div class="btn primary" onclick="${list.name}.insertRow(this,true)">Dodaj <i class="fas fa-arrow-up"></i></div>
                <div class="btn primary" onclick="${list.name}.insertRow(this,false)">Dodaj <i class="fas fa-arrow-down"></i></div>
            </div>
            <div class="list"></div>
        `);

        list.insertRow = (btn, begin = true) => {
            attribute_values.addRow(params.default_row, btn.parentNode.nextElementSibling, begin);
        }

        list.target = $(`.${params.name} .list`);
        list.target.setAttribute("data-depth", 1);

        list.rows = [];

        list.clear = () => {
            removeContent(list.target);
            list.valuesChanged();
        }

        list.setValues = (values) => {
            list.clear();

            addValues = (values, listTarget = null) => {
                if (listTarget === null) {
                    listTarget = list.target;
                }
                for (var value_data of values) {
                    var parent_value_list = attribute_values.addRow(value_data.values, listTarget);
                    addValues(value_data.children, parent_value_list);
                }
            }
            addValues(values);
        }

        list.addRow = (values, listTarget = null, begin = false) => {
            if (listTarget === null) {
                listTarget = list.target;
            }

            var canAdd = true;

            [...listTarget.children].forEach(simpleListRowWrapper => {
                simpleListRowWrapper.querySelector(".simple-list-row").querySelectorAll("[data-list-param]").forEach(e => {
                    var param = e.getAttribute("data-list-param");
                    if (list.fields[param].unique && e.value == values[param] && e.value !== "") {
                        canAdd = false;
                    }
                })
            });

            if (!canAdd) {
                return;
            }

            var depth = parseInt(listTarget.getAttribute("data-depth"));

            var addBtn = depth < list.recursive ?
                `<div style="padding: 5px 0">
                    <span>Powiązane wartości</span>
                    <div class="btn primary" onclick="${list.name}.insertRow(this,true)">Dodaj <i class="fas fa-arrow-up"></i></div>
                    <div class="btn primary" onclick="${list.name}.insertRow(this,false)">Dodaj <i class="fas fa-arrow-down"></i></div>
                </div>` :
                "";

            listTarget.insertAdjacentHTML(begin ? "afterbegin" : "beforeend", `
                <div class='simple-list-row-wrapper'>
                    <div class='simple-list-row'>
                        ${params.render(values)}
                        <div style="flex-grow:1"></div>
                        <i class="btn secondary fas fa-arrow-up" onclick="swapNodes(this.parentNode.parentNode,this.parentNode.parentNode.previousElementSibling);${list.name}.valuesChanged();"></i>
                        <i class="btn secondary fas fa-arrow-down" onclick="swapNodes(this.parentNode.parentNode,this.parentNode.parentNode.nextElementSibling);${list.name}.valuesChanged();"></i>
                        <div style="width:10px"></div>
                        <i class="btn secondary fas fa-times" onclick="removeNode(this.parentNode.parentNode);${list.name}.valuesChanged();"></i>
                    </div>
                    <div class="sub-list">
                        ${addBtn}
                        <div class="list" data-depth="${1 + depth}"></div>
                    </div>
                </div>
            `);

            list.valuesChanged();

            [...list.target.querySelectorAll("[data-list-param]:not(.param-registered)")].forEach(e => {
                e.classList.add("param-registered");

                e.addEventListener("change", () => {
                    list.valuesChanged();
                });
            })

            var n = begin ? 0 : listTarget.children.length - 1;
            return listTarget.children[n].querySelector(".list");
        }

        list.valuesChanged = () => {

            var getDirectRows = (listTarget) => {

                var rows = [];
                [...listTarget.children].forEach(simpleListRowWrapper => {
                    var row = {
                        values: {},
                        children: []
                    }
                    simpleListRowWrapper.querySelector(".simple-list-row").querySelectorAll("[data-list-param]").forEach(e => {
                        var param = e.getAttribute("data-list-param");
                        row.values[param] = e.value;
                    })
                    row.children = getDirectRows(simpleListRowWrapper.querySelector(".sub-list > .list"));

                    rows.push(row);
                });
                return rows;
            };

            list.values = getDirectRows(list.target);

            if (params.output) {
                $(params.output).value = JSON.stringify(list.values);
            }
        }

        window[list.name] = list;
    }

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
                    attribute_values.setValues(JSON.parse(res));
                    setModalInitialState(formName);
                }
            });
        } else {
            attribute_values.setValues([]);
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

        $(".attribute_values").classList.toggle("inactive", !!attribute_data_types[data_type].field);
    }
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<div id="editAttribute" data-modal data-expand>
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
                    <select name="data_type" class="form-field" onchange="toggleValues()"><select>

                            <div class="attribute_values"></div>
                            <input type="hidden" name="attribute_values">
                </div>
                <div>

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