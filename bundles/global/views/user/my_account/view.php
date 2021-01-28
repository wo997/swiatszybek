<?php //route[moje-konto]

if (!User::getCurrent()->getId()) {
    header("Location: /");
    die;
}

$user_id = User::getCurrent()->getId();

//$user_data = DB::fetchRow("SELECT user_id, imie, nazwisko, email, telefon, firma, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu, nip, authentication_token FROM `users` WHERE user_id = ".intval($user_id));
$user_data = DB::fetchRow("SELECT * FROM users WHERE user_id = " . intval($user_id));

$menu = "zamowienia";
if (strpos(Request::$url, "dane-uzytkownika") !== false)
    $menu = "uzytkownik";
if (strpos(Request::$url, "resetowanie-hasla") !== false)
    $menu = "haslo";

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <title>Moje konto</title>
    <?php include "global/includes.php"; ?>
    <link href="/src/zamowienia.css" rel="stylesheet">
</head>

<body>
    <?php include "global/header.php"; ?>
    <div id="accountForm" class="main-container">
        <div style="margin-top:30px"></div>

        <div style=" text-align:center;padding: 25px;font-size: 17px">
            <?php
            if (User::getCurrent()->data["type"] == 'google') echo '<img src="/img/google.png" style="width: 1em;vertical-align: sub;"> ';
            if (User::getCurrent()->data["type"] == 'facebook') echo '<i class="fab fa-facebook-square" style="font-size: 1em;color: #3b5998;"></i> ';
            if (User::getCurrent()->data["type"] == 'regular') echo '<i class="fas fa-user" style="font-size: 1em;"></i> ';
            echo User::getCurrent()->getDisplayName();
            ?>
        </div>

        <div class="centerwhenbig" style="padding-bottom: 40px">
            <div class="nav">
                <div id="menuHeader1" onclick="showMenu(1)" <?php if ($menu == "zamowienia") echo 'class="selected"'; ?>>
                    <i class="fas fa-box"></i>
                    <span>Zamówienia</span>
                </div>
                <div id="menuHeader2" onclick="showMenu(2)" <?php if ($menu == "uzytkownik") echo 'class="selected"'; ?>>
                    <i class="fas fa-address-book"></i>
                    <span>Dane użytkownika</span>
                </div>
                <?php if (User::getCurrent()->data["type"] == 'regular') : ?>
                    <div id="menuHeader3" onclick="showMenu(3)" <?php if ($menu == "haslo") echo 'class="selected"'; ?>>
                        <i class="fas fa-unlock-alt"></i>
                        <span>Zmiana hasła</span>
                    </div>
                <?php endif ?>
                <a href="/logout" onclick="return logout()">
                    <i class="fa fa-sign-out-alt"></i>
                    <span>Wyloguj się</span>
                </a>
            </div>

            <div style="padding: 15px 5px">
                <div id="menu1" data-form class="menu mobileRow <?php if ($menu == "zamowienia") echo "showNow"; ?>" style="<?php if ($menu != "zamowienia") echo 'display:none;'; ?>">
                    <div style="text-align:center;margin:30px auto">
                        <?php
                        $table = "";
                        $tableMobile = "<div class='mobileTable' style='text-align:left'>";
                        $stmt = $con->prepare("SELECT zamowienie_id, link, koszt, status_id, DATE_FORMAT(zlozono, '%d-%m-%Y %H:%i'), oplacono FROM zamowienia WHERE user_id = ? ORDER BY zlozono DESC");
                        $stmt->bind_param("s", $user_id);
                        $stmt->execute();
                        $stmt->bind_result($zamowienie_id, $link, $koszt, $status_id, $zlozono, $oplacono);
                        $rowCount = 0;
                        while (mysqli_stmt_fetch($stmt)) {
                            $status_html = renderStatus($status_id);

                            $rowCount++;

                            if ($rowCount == 1) {
                                $table .= "<h3 class='form-header'>Twoje zamówienia</h3><table class='zamowienia_table hideMobile'><tr style='background: var(--primary-clr);color: white;'><td>Nr zamówienia</td><td>Koszt</td><td>Status</td><td>Data utworzenia</td><td></td></tr>";
                            }
                            $table .= "<tr><td>#$zamowienie_id</td><td>$koszt zł</td><td>$status_html</td><td>$zlozono</td><td><a class='btn primary fill' href='/zamowienie/$link'>Szczegóły <i class='fa fa-chevron-right'></i></a></td></tr>";
                            $tableMobile .= "<div>
                                    <div style='text-align:center'><span style='font-weight: bold;font-size: 18px;'>Zamówienie: #$zamowienie_id</span></div>
                                    <div>Koszt: $koszt zł</div>
                                    <div>Status: $status_html</div>
                                    <div>Data utworzenia: $zlozono</div>
                                    <a class='btn primary fill' href='/zamowienie/$link'>Szczegóły <i class='fa fa-chevron-right'></i></a>
                                    </div>";
                        }
                        $stmt->close();

                        if ($rowCount == 0) {
                            $table = '<h3 style="margin: 40px 0 50px; font-size: 26px;">Brak zamówień</h3>
                            <a class="btn primary medium" href="/">
                              Rozpocznij zakupy
                              <i class="fa fa-chevron-right"></i>
                            </a>';
                        } else {
                            $table .= "</table>";
                        }
                        $tableMobile .= "</div>";

                        echo $table;
                        echo $tableMobile;
                        ?>
                    </div>
                </div>

                <div id="menu2" data-form class="menu mobileRow <?php if ($menu == "uzytkownik") echo "showNow"; ?>" style="<?php if ($menu != "uzytkownik") echo 'display:none;'; ?>">
                    <div style="width:100%;">
                        <div class="messagebox-container"></div>
                        <div class="messagebox-container2"></div>
                        <div class="mobileRow" style="max-width: 820px;margin: 0 auto;">
                            <div style="width: 50%; padding:10px">
                                <div style="width:100%;margin:auto;max-width:350px">
                                    <h3 class="form-header">Dane kontaktowe</h3>

                                    <div class="label">Imię</div>
                                    <input type="text" class="field" name="imie" autocomplete="first-name" data-validate>

                                    <div class="label">Nazwisko</div>
                                    <input type="text" class="field" name="nazwisko" autocomplete="family-name" data-validate>

                                    <div class="label">Adres e-mail</div>
                                    <input type="text" class="field" name="email" autocomplete="email" data-validate="email">

                                    <div class="label">Nr telefonu</div>
                                    <input type="text" class="field" name="telefon" autocomplete="tel" data-validate>

                                    <div class="label">Nazwa firmy</div>
                                    <input type="text" class="field" name="firma" autocomplete="organization">

                                    <div class="label">NIP</div>
                                    <input type="text" class="field" name="nip">
                                </div>
                            </div>
                            <div style="width: 50%; padding:10px;">
                                <div style="width:100%;margin:auto;max-width:350px">
                                    <h3 class="form-header">Adres</h3>
                                    <div class="label">Kraj</div>
                                    <input type="text" class="field" name="kraj" autocomplete="country-name" data-validate>

                                    <div class="label">Kod pocztowy</div>
                                    <input type="text" class="field" name="kod_pocztowy" autocomplete="postal-code" data-validate data-store>

                                    <div class="label">Miejscowość</div>
                                    <input class="field" type="text" name="miejscowosc" autocomplete="address-level2" placeholder=" " data-validate data-store>

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
                                    <div style="margin-top: 70px;text-align: right;">
                                        <button class="btn primary medium" id="allowSave" onclick="saveDataForm()" disabled>
                                            Zapisz zmiany
                                            <i class="fa fa-cog"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="menu3" data-form class="menu mobileRow <?php if ($menu == "haslo") echo "showNow"; ?>" style="<?php if ($menu != "haslo") echo 'display:none;'; ?>">
                    <div style="width:100%;margin:40px auto;max-width:350px">
                        <h3 class="form-header">Zmiana hasła</h3>

                        <div class="label">Hasło (min. 8 znaków)</div>
                        <input type="password" name="password" class="field" data-validate="password" autocomplete="new-password">

                        <div class="label">Powtórz hasło</div>
                        <input type="password" name="password_rewrite" class="field" data-validate="|match:#menu3 .field[name='password']" autocomplete="new-password">

                        <input type="hidden" name="user_id">
                        <input type="hidden" name="authentication_token">
                        <input type="hidden" name="moje-konto" value="1">

                        <input type="hidden" name="email">
                        <button data-submit class="btn primary medium" style="margin:10px 0; width: 100%" onclick="savePasswordForm()">
                            Akceptuj zmianę hasła
                            <i class="fa fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

        </div>
    </div>
    </div>
    <?php include "global/footer.php"; ?>
</body>

</html>