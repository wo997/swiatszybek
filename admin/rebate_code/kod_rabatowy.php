<?php //->[admin/kod_rabatowy]

$parts = explode("/", $url);
if (isset($parts[2])) {
    $kod_id = intval($parts[2]);

    $kod_data = fetchRow("SELECT kod_id, kwota, kod, user_id_list, product_id_list, product_list_metadata, date_from, date_to, ilosc, type FROM kody_rabatowe WHERE kod_id = $kod_id");
} else {
    $kod_data = [
        "kod_id" => -1,
        "kwota" => 0,
        "kod" => "",
        "user_id_list" => "",
        "product_id_list" => "",
        "product_list_metadata" => "{}",
        "user" => "",
        "od" => "",
        "do" => "",
        "ilosc" => 1,
        "type" => "static",
    ];
}

if (!json_decode($kod_data["product_list_metadata"])) {
    $kod_data["product_list_metadata"] = "{}";
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
        setFormData(<?= json_encode($kod_data) ?>);

        var tableName = "users";
        createTable({
            name: tableName,
            url: "/admin/search_uzytkownicy",
            lang: {
                subject: "użytkowników",
            },
            rowCount: 10,
            primary: "user_id",
            selectable: {
                data: [<?= trim($kod_data["user_id_list"], ",") ?>],
                output: "user_id_list",
            },
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
            controls: `
                <div class='float-icon'>
                    <input type="text" placeholder="Filtruj..." data-param="search">
                    <i class="fas fa-search"></i>
                </div>
            `
        });

        var tableName = "products";
        createTable({
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
                data: [<?= trim($kod_data["product_id_list"], ",") ?>],
                output: "product_id_list",

            },
            metadata: {
                data: <?= $kod_data["product_list_metadata"] ?>,
                output: "product_list_metadata"
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
                {
                    title: "Wymagana ilość",
                    width: "10%",
                    render: (r) => {
                        return `<input type='number' data-metadata='qty' value='1'>`;
                    },
                    escape: false
                },
            ],
            controls: `
                <div class='float-icon'>
                    <input type="text" placeholder="Filtruj..." data-param="search">
                    <i class="fas fa-search"></i>
                </div>
            `
        });
    });
</script>

<title>Kod rabatowy</title>


<?php startSection("content"); ?>

<div>
    <form style="max-width:1200px;margin:20px auto" method="post" action="/admin/save_kod_rabatowy" autocomplete="off">
        <h2 style="text-align:center">Kod rabatowy</h2>
        <div class="desktopRow spaceColumns">
            <div>
                <div class="field-title">Kod</div>
                <input class="field" type="text" name="kod">
                <div class="field-title">Kwota</div>
                <div style="display:flex;">
                    <input type="text" name="kwota" class="field" style="flex-grow:1">
                    <select name="type">
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
                        <input class="field datepicker" type="text" name="date_from">
                    </div>
                    <div>
                        <div class="field-title">Dostępny do</div>
                        <input class="field datepicker" type="text" name="date_to">
                    </div>
                </div>
            </div>
        </div>

        <div class="field-title">Ogranicz do konkretnych użytkowników</div>
        <div class="users"></div>

        <div class="field-title">Ogranicz do konkretnych produktów</div>
        <div class="products"></div>

        <input type="hidden" name="kod_id" value="<?= $kod_id ?>">
        <div style="margin-top:10px;text-align:right">
            <a href="/admin/kody-rabatowe" class="btn secondary"><i class="fas fa-chevron-circle-left"></i> Wróć</a>
            <?php if ($kod_id != -1) : ?>
                <button type="submit" name="submit" value="delete" class="btn secondary red" onclick="return confirm('Czy aby na pewno chcesz usunąć kod rabatowy?')">Usuń <i class="fa fa-times"></i></button>
            <?php endif ?>
            <button type="submit" name="submit" value="save" class="btn primary">Zapisz <i class="fa fa-save"></i></button>
        </div>
    </form>
</div>

<?php include "admin/default_page.php"; ?>