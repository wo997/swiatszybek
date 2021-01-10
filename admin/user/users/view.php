<?php //route[{ADMIN}uzytkownicy]

?>

<?php startSection("head_content"); ?>

<title>Użytkownicy</title>

<?php startSection("body_content"); ?>

<h1>Użytkownicy</h1>

<div class="mytable" id="caseAllUsers"></div>

<div id="editUser" data-modal data-expand data-exclude-hidden data-form>
    <div class="modal-body">
        <div class="custom-toolbar">
            <span class="title">Edycja użytkownika</span>
            <button class="btn secondary" onclick="hideParentModal(this,true)">Anuluj <i class="fa fa-times"></i></button>
            <button class="btn primary" onclick="saveUser();">Zapisz <i class="fa fa-save"></i></button>
        </div>
        <div class="scroll-panel scroll-shadow panel-padding">
            <div class="desktopRow spaceColumns">
                <div>
                    <h3 class="form-header">Dane kontaktowe</h3>

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
                    <h3 class="form-header">Adres</h3>

                    <div class="field-title">Kraj</div>
                    <input type="text" class="field" name="kraj" autocomplete="country-name" data-validate>

                    <div class="miejscowosc-picker-wrapper">
                        <div class="field-title">Kod pocztowy</div>
                        <input type="text" class="field" name="kod_pocztowy" autocomplete="postal-code" onchange="kodPocztowyChange(this)" data-validate>

                        <div class="field-title">Miejscowość</div>
                        <input class="field miejscowosc-picker-target" type="text" name="miejscowosc" autocomplete="address-level2" placeholder=" " data-validate>
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
            <!--<div style="margin-top:auto; align-self: flex-end; padding-top:30px; margin-bottom:10px">
                <button class="btn red" onclick="if(confirm('Czy aby na pewno chcesz usunąć użytkownika?')) saveUser(true);">Usuń <i class="fa fa-times"></i></button>
            </div>-->
        </div>
    </div>
</div>

<?php include "admin/page_template.php"; ?>