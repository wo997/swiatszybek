<?php //route[{ADMIN}uzytkownicy]

?>

<?php startSection("head_content"); ?>

<title>Użytkownicy</title>

<?php startSection("body_content"); ?>

<datatable-comp class="users"></datatable-comp>

<!-- 
<div class="mytable" id="caseAllUsers"></div>

<div id="editUser" data-modal data-expand data-exclude-hidden data-form>
    <div class="modal-body">
        <div class="custom-toolbar">
            <span class="title">Edycja użytkownika</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fas fa-times"></i></button>
            <button class="btn primary" onclick="saveUser();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll_panel scroll_shadow panel_padding">
            <div class="desktopRow spaceColumns">
                <div>
                    <h3 class="form-header">Dane kontaktowe</h3>

                    <div class="label">Imię</div>
                    <input type="text" class="field" name="imie" autocomplete="first-name" data-validate>

                    <div class="label">Nazwisko</div>
                    <input type="text" class="field" name="nazwisko" autocomplete="family-name" data-validate>

                    <div class="label">Adres e-mail</div>
                    <input type="text" class="field" name="email" autocomplete="email" data-validate="email">

                    <div class="label">Nr telefonu</div>
                    <input type="text" class="field" name="telefon" autocomplete="tel" data-validate="tel">

                    <div class="label">Nazwa firmy</div>
                    <input type="text" class="field" name="firma" autocomplete="organization">

                    <div class="label">NIP</div>
                    <input type="text" class="field" name="nip">
                </div>
                <div>
                    <h3 class="form-header">Adres</h3>

                    <div class="label">Kraj</div>
                    <input type="text" class="field" name="kraj" autocomplete="country-name" data-validate>

                    <div class="label">Kod pocztowy</div>
                    <input type="text" class="field" name="kod_pocztowy" autocomplete="postal-code" data-validate>

                    <div class="label">Miejscowość</div>
                    <input class="field" type="text" name="miejscowosc" autocomplete="address-level2" placeholder=" " data-validate>

                    <div class="label">Ulica</div>
                    <input type="text" class="field" name="ulica" autocomplete="address-line1" data-validate>

                    <div class="desktopRow spaceColumns">
                        <div>
                            <div class="label">Nr domu</div>
                            <input type="text" class="field" name="nr_domu" autocomplete="address-line2" data-validate>
                        </div>
                        <div>
                            <div class="label">Nr lokalu</div>
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
                    <div class="label">Uprawnienia</div>
                    <select name="privelege_id" class="field">
                        <?php foreach ($privelege_list as $permission) : ?>
                            <option value="<?= $permission["id"] ?>"><?= $permission["name"] ?></option>
                        <?php endforeach; ?>
                    </select>

                    <label class="checkbox-wrapper label">
                        <input class="passwordCheckbox" type="checkbox" onchange="togglePasswordField(this);">
                        <div class="checkbox"></div>
                        Zmień hasło
                    </label>

                    <div class="expand_y changePassword">
                        <div class="label first">Hasło (min. 8 znaków)</div>
                        <input type="password" name="password" class="field" data-validate="password">
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
        </div>
    </div>
</div> -->

<?php include "bundles/admin/templates/default.php"; ?>