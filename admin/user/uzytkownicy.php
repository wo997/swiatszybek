<?php //route[admin/uzytkownicy]

?>

<?php startSection("head"); ?>

<title>Użytkownicy</title>

<script>
    document.addEventListener("DOMContentLoaded", function() {
        var tableName = "mytable";
        createDatatable({
            name: tableName,
            url: "/admin/search_uzytkownicy",
            lang: {
                subject: "użytkowników",
            },
            width: 1300,
            definition: [{
                    title: "Imię",
                    width: "7%",
                    field: "imie",
                    searchable: "text",
                },
                {
                    title: "Nazwisko",
                    width: "7%",
                    field: "nazwisko",
                    searchable: "text",
                },
                {
                    title: "Firma",
                    width: "7%",
                    field: "firma",
                    searchable: "text",
                },
                {
                    title: "Email",
                    width: "12%",
                    field: "email",
                    searchable: "text",
                },
                {
                    title: "Telefon",
                    width: "6%",
                    field: "telefon",
                    searchable: "text",
                },
                {
                    title: "Typ konta",
                    width: "5%",
                    render: (r) => {
                        if (r.user_type == 'google') {
                            return '<img src="/img/google.png" style="width: 15px;vertical-align: sub;">';
                        }
                        if (r.user_type == 'facebook') {
                            return '<i class="fab fa-facebook-square" style="font-size: 15px;color: #3b5998;"></i>';
                        }
                        return "";
                    }
                },
                {
                    title: "Uprawnienia",
                    width: "8%",
                    render: (r) => {
                        return privelege_list[r.privelege_id].name;
                    },
                    field: "privelege_id",
                    searchable: "select",
                    select_values: privelege_list.map((e) => {
                        return e.id;
                    }),
                    select_labels: privelege_list.map((e) => {
                        return e.name;
                    }),
                },
                // {
                //     title: "Utworzono",
                //     width: "9%",
                //     field: "stworzono",
                //     sortable: true,
                //     searchable: "date",
                // },
                {
                    title: "Zamówienia",
                    width: "6%",
                    render: (r, i, t) => {
                        var zamowienia = nonull(r.zamowienia_count);
                        return zamowienia;
                    },
                    escape: false
                },
                {
                    title: "",
                    width: "110px",
                    render: (r, i, t) => {
                        return `
                            <div class="btn secondary" onclick="editUser(this, ${t.name}.results[${i}])">Szczegóły <i class="fa fa-chevron-right"></i></div>
                        `;
                    },
                    escape: false
                },
            ],
            controlsRight: `
                <div class='float-icon'>
                    <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
                    <i class="fas fa-search"></i>
                </div>                `
        });

    });

    document.addEventListener("DOMContentLoaded", function() {
        const definition = zamowienia_table_definition.filter(elem => ["imie", "nazwisko", "firma"].indexOf(elem.field) === -1);

        var tableName = "zamowieniatable";
        createDatatable({
            name: tableName,
            url: "/admin/search_zamowienia",
            lang: {
                subject: "zamówień",
            },
            width: 1300,
            nosearch: true,
            definition,
        });
    });

    function editUser(src = null, data = null) {
        const form = $("#editUser");
        if (data === null) {
            data = {
                email: "",
                firma: "",
                imie: "",
                nazwisko: "",
                kolejnosc: 1,
                privelege_id: 0,
                telefon: "",
                user_id: -1,
                zamowienia_count: 0
            }
        }

        $("#editUser .passwordCheckbox").setValue(0);
        setFormData(data, form);

        removeFilterByField(zamowieniatable, "user_id");
        zamowieniatable.filters.push({
            field: "user_id",
            type: "=",
            value: $(`#editUser [name="user_id"]`).getValue(),
        })
        zamowieniatable.search();

        showModal(form.id, {
            source: src
        });
    }


    function saveUser() {
        const form = $("#editUser");
        if (!validateForm(form)) {
            return;
        }
        const params = getFormData(form);
        xhr({
            url: "/save_user",
            params,
            success: (res) => {
                mytable.search();
            }
        });
        hideModalTopMost();
    }

    function togglePasswordField(elem) {
        expand($("#editUser .changePassword"), $(elem).getValue());
    }
</script>

<?php startSection("content"); ?>

<h1>Użytkownicy</h1>

<div class="mytable" id="caseAllUsers"></div>

<div id="editUser" data-modal data-expand data-exclude-hidden>
    <div class="modal-body stretch-vertical">
        <div class="custom-toolbar">
            <span class="title">Edycja użytkownika</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveUser();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="modal-body stretch-vertical">
            <div class="desktopRow spaceColumns">
                <div>
                    <h3 style="text-align: center;font-size: 18px;margin: 20px 0 10px;">Dane kontaktowe</h3>

                    <div class="field-title">Imię</div>
                    <input type="text" class="field" name="imie" autocomplete="first-name" data-validate>

                    <div class="field-title">Nazwisko</div>
                    <input type="text" class="field" name="nazwisko" autocomplete="family-name" data-validate>

                    <div class="field-title">Adres e-mail</div>
                    <input type="text" class="field" name="email" autocomplete="email" data-validate="email">

                    <div class="field-title">Nr telefonu</div>
                    <input type="text" class="field" name="telefon" autocomplete="tel" data-validate="tel">

                    <div class="field-title">Nazwa firmy</div>
                    <input type="text" class="field" name="firma" autocomplete="organization">

                    <div class="field-title">NIP</div>
                    <input type="text" class="field" name="nip">
                </div>
                <div>
                    <h3 style="text-align: center;font-size: 18px;margin: 20px 0 10px;">Adres</h3>

                    <div class="field-title">Kraj</div>
                    <input type="text" class="field" name="kraj" autocomplete="country-name" data-validate>

                    <div class="miejscowosc-picker-wrapper">
                        <div class="field-title">Kod pocztowy</div>
                        <input type="text" class="field" name="kod_pocztowy" autocomplete="postal-code" onchange="kodPocztowyChange(this)" data-validate data-cookie>

                        <div class="field-title">Miejscowość</div>
                        <input class="field miejscowosc-picker-target" type="text" name="miejscowosc" autocomplete="address-level2" placeholder=" " data-validate data-cookie>
                        <div class="miejscowosc-picker-list"></div>
                    </div>

                    <div class="field-title">Ulica</div>
                    <input type="text" class="field" name="ulica" autocomplete="address-line1" data-validate>

                    <div class="desktopRow spaceColumns">
                        <div>
                            <div class="field-title">Nr domu</div>
                            <input type="text" class="field" name="nr_domu" autocomplete="address-line2" data-validate>
                        </div>
                        <div>
                            <div class="field-title">Nr lokalu</div>
                            <input type="text" class="field" name="nr_lokalu" autocomplete="address-line3">
                        </div>
                    </div>

                    <input type="hidden" name="user_id">
                </div>
            </div>

            <br>
            <br>

            <div class="desktopRow spaceColumns">
                <div>
                    <div class="field-title">Uprawnienia</div>
                    <select name="privelege_id" class="field">
                        <?php foreach ($privelege_list as $permission) : ?>
                            <option value="<?= $permission["id"] ?>"><?= $permission["name"] ?></option>
                        <?php endforeach; ?>
                    </select>

                    <label class="checkbox-wrapper field-title">
                        <input class="passwordCheckbox" type="checkbox" onchange="togglePasswordField(this);">
                        <div class="checkbox"></div>
                        Zmień hasło
                    </label>

                    <div class="expand_y changePassword">
                        <div class="field-title first">Hasło (min. 8 znaków)</div>
                        <div class="field-wrapper">
                            <input type="password" name="password" class="field" data-validate="password">
                            <i class="correct fa fa-check"></i>
                            <i class="wrong fa fa-times"></i>
                        </div>
                    </div>
                </div>
                <div>

                </div>
            </div>

            <br>
            <br>

            <div>
                <h3 class="form-header">Zamówienia</h3>
                <div class="zamowieniatable"></div>
            </div>

            <br>
            <div style="margin-top:auto; align-self: flex-end; padding-top:30px; margin-bottom:10px">
                <button class="btn red" onclick="if(confirm('Czy aby na pewno chcesz usunąć użytkownika?')) saveUser(true);">Usuń <i class="fa fa-times"></i></button>
            </div>
        </div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>