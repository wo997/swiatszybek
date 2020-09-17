<?php //route[admin/kod_rabatowy]

$parts = explode("/", $url);
if (isset($parts[2])) {
    $kod_id = intval($parts[2]);

    $kod_data = fetchRow("SELECT * FROM kody_rabatowe WHERE kod_id = $kod_id");
} else {
    $kod_data = [
        "kod_id" => -1,
        "kwota" => 0,
        "kod" => "",
        "user_id_list" => "",
        "product_list" => "",
        "user" => "",
        "date_from" => "",
        "date_to" => "",
        "ilosc" => 1,
        "type" => "static",
    ];
}

if (!json_decode($kod_data["user_id_list"])) {
    $kod_data["user_id_list"] = "[]";
}
if (!json_decode($kod_data["product_list"])) {
    $kod_data["product_list"] = "[]";
}

?>

<?php startSection("head"); ?>

<style>
    table {
        width: 100%;
    }
</style>
<script>
    window.addEventListener("DOMContentLoaded", function() {
        var tableName = "users";
        createDatatable({
            name: tableName,
            url: "/admin/search_uzytkownicy",
            lang: {
                subject: "użytkowników",
            },
            rowCount: 10,
            primary: "user_id",
            selectable: {
                output: "user_id_list",
            },
            nosearch: true,
            definition: [{
                    title: "Imię, Nazwisko",
                    width: "15%",
                    render: (r) => {
                        return r.imie + " " + r.nazwisko;
                    },
                    escape: false
                },
                {
                    title: "Email",
                    width: "10%",
                    render: (r) => {
                        return r.email;
                    }
                },
                {
                    title: "Firma",
                    width: "10%",
                    render: (r) => {
                        return r.firma;
                    }
                },
            ],
            controlsRight: `
                <div class='float-icon'>
                    <input type="text" placeholder="Filtruj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>
            `
        });

        var tableName = "product_list";
        createDatatable({
            name: tableName,
            url: "/admin/search_products",
            db_table: "products",
            primary: "product_id",
            lang: {
                subject: "produktów",
            },
            rowCount: 10,
            primary: "product_id",
            selectable: {
                output: "product_list",
                has_metadata: true,
            },
            nosearch: true,
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
                        return `${nonull(r.stock,0)} szt.`;
                    },
                    field: "stock",
                    sortable: true,
                    searchable: "text"
                },
                {
                    title: "Wymagana ilość",
                    width: "10%",
                    className: "metadata-column",
                    render: (r) => {
                        return `<input type='number' data-metadata='qty' value='1'>`;
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

        setFormData(<?= json_encode($kod_data) ?>, "#kodForm");
    });

    function save(remove = false) {
        var form = $("#kodForm");

        setFormInitialState(form);
        if (!remove && !validateForm(form)) {
            return;
        }
        var params = getFormData(form);

        if (remove) {
            params["remove"] = true;
        }

        xhr({
            url: "/admin/save_kod_rabatowy",
            params,
            success: (res) => {
                window.location = "/admin/kody-rabatowe";
            }
        });
    }
</script>

<title>Kod rabatowy</title>


<?php startSection("content"); ?>

<div id="kodForm" data-form data-warn-before-leave>
    <div style="max-width:1200px;margin:20px auto">
        <h2 style="text-align:center">Kod rabatowy</h2>
        <div class="desktopRow spaceColumns">
            <div>
                <div class="field-title">Kod</div>
                <input class="field" type="text" name="kod">
                <div class="field-title">Kwota</div>
                <div class="glue-children">
                    <input type="text" name="kwota" class="field" style="flex-grow:1">
                    <select name="type" class="field inline">
                        <option value='static'>zł</option>
                        <option value='percent'>%</option>
                    </select>
                </div>
            </div>
            <div>
                <div class="field-title">Ilość</div>
                <input class="field" type="number" name="ilosc">
                <div class="desktopRow spaceColumns">
                    <div>
                        <div class="field-title">Dostępny od</div>
                        <input class="field default_datepicker" type="text" name="date_from">
                    </div>
                    <div>
                        <div class="field-title">Dostępny do</div>
                        <input class="field default_datepicker" type="text" name="date_to">
                    </div>
                </div>
            </div>
        </div>

        <div class="field-title">Ogranicz do konkretnych użytkowników</div>
        <div class="users"></div>

        <div class="field-title">Ogranicz do konkretnych produktów</div>
        <div class="product_list"></div>

        <input type="hidden" name="kod_id" value="<?= $kod_data["kod_id"] ?>">
        <div style="margin-top:10px;text-align:right">
            <a href="/admin/kody-rabatowe" class="btn secondary"><i class="fas fa-chevron-circle-left"></i> Wróć</a>
            <?php if ($kod_data["kod_id"] != -1) : ?>
                <button class="btn secondary red" onclick='if (confirm("Czy aby na pewno chcesz usunąć kod rabatowy?")) {save(true)};'>Usuń <i class="fa fa-times"></i></button>
            <?php endif ?>
            <button class="btn primary" onclick="save()">Zapisz <i class="fa fa-save"></i></button>
        </div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>