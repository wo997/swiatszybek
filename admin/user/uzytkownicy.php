<?php //route[admin/uzytkownicy]

if (isset($url_params[2]) && strlen($url_params[2]) > 0) {
    $user_id = $url_params[2];
} else
    $user_id = null;
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
                    width: "7.5%",
                    render: (r) => {
                        // if (r.user_type == 'g') client = '<img src="/img/google.png" style="width: 15px;vertical-align: sub;"> ' + client;
                        // if (r.user_type == 'f') client = '<i class="fab fa-facebook-square" style="font-size: 15px;color: #3b5998;"></i> ' + client;
                        // return `<a class="btn secondary" href='/moje-konto/dane-uzytkownika/${r.user_id}'><i class="fas fa-cog"></i></a> ${client}`;
                        return r.imie;
                    }
                },
                {
                    title: "Nazwisko",
                    width: "7.5%",
                    render: (r) => {
                        return r.nazwisko;
                    }
                },
                {
                    title: "Firma",
                    width: "10%",
                    render: (r) => {
                        return r.firma;
                    }
                },
                {
                    title: "Email",
                    width: "10%",
                    field: "email",
                    sortable: true,
                    searchable: "",
                },
                {
                    title: "Telefon",
                    width: "9%",
                    field: "telefon",
                    sortable: true,
                    searchable: "text",
                },
                {
                    title: "Uprawnienia",
                    width: "8%",
                    render: (r) => {
                        return permission_list[r.permissions].name;
                    },
                    field: "permissions",
                    searchable: "select",
                    select_values: Object.keys(permission_list),
                    select_labels: permission_list.map(e => {
                        return e.name
                    }),
                },
                {
                    title: "Data utworzenia",
                    width: "10%",
                    field: "stworzono",
                    sortable: true,
                    searchable: "text",
                },
                {
                    title: "Zamówienia",
                    width: "10%",
                    render: (r, i, t) => {
                        var zamowienia = nonull(r.zamowienia_count);
                        if (r.zamowienia_count > 0) zamowienia += `<button class="btn secondary" style="margin-left:7px" onclick="showUser(${i}, '${t.name}')"> Pokaż <i class="fas fa-chevron-circle-right"></i></a>`;
                        return zamowienia;
                    },
                    escape: false
                },
                {
                    title: "",
                    width: "95px",
                    render: (r, i, t) => {
                        return `
                            <div class="btn secondary" onclick="editUser(this, ${t.name}.results[${i}])">Edytuj <i class="fa fa-cog"></i></div>
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

        <?php if ($user_id) echo "showUser($user_id);"; ?>
    });

    document.addEventListener("DOMContentLoaded", function() {

        var tableName = "zamowieniatable";
        createDatatable({
            name: tableName,
            url: "/admin/search_zamowienia",
            lang: {
                subject: "zamówień",
            },
            width: 1300,
            nosearch: true,
            params: () => {
                return {
                    user_id: USER_ID
                }
            },
            definition: zamowienia_table_definition,
            controls: `
                    <h3><button class="btn primary" style="margin-right:10px" onclick="back()"><i class="fas fa-chevron-circle-left"></i>&nbsp;Cofnij</button> Zamówienia użytkownika <span id="username"></span></h3>
                `
        });
    });

    var USER_ID = null;

    function showUser(row_id, table_name) {

        const r = window[table_name].results[row_id];
        USER_ID = r.user_id;
        const client = escapeHTML(`${r.imie} ${r.nazwisko} ${r.firma}`);
        zamowieniatable.search(() => {
            $('#caseSingleUser').style.display = 'block';
            $('#caseAllUsers').style.display = 'none';

            $('#username').innerHTML = `<td><a class='link' href='/moje-konto/dane-uzytkownika/${USER_ID}'>${client}</a></td>`;
        });
    }

    function back() {
        mytable.search(() => {
            $('#caseSingleUser').style.display = 'none';
            $('#caseAllUsers').style.display = 'block';
        });
    }

    function editUser(src = null, data = null) {
        const form = $("#editUser");
        if (data === null) {
            data = {
                email: "",
                firma: "",
                imie: "",
                nazwisko: "",
                kolejnosc: 1,
                permissions: 0,
                telefon: "",
                user_id: -1,
                zamowienia_count: 0
            }
        }

        $("#editUser .passwordCheckbox").setValue(0);
        setFormData(data, form);

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
            url: "/admin/save_user",
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

<div class="mytable" id="caseAllUsers"></div>
<div id="caseSingleUser" style="display:none">
    <div class="zamowieniatable"></div>
</div>

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
                    <select name="permissions" class="field">
                        <?php foreach ($permission_list as $permission_id => $permission) : ?>
                            <option value="<?= $permission_id ?>"><?= $permission["name"] ?></option>
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
            <div style="margin-top:auto; align-self: flex-end; padding-top:30px; margin-bottom:10px">
                <button class="btn red" onclick="if(confirm('Czy aby na pewno chcesz usunąć użytkownika?')) saveUser(true);">Usuń <i class="fa fa-times"></i></button>
            </div>
        </div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>