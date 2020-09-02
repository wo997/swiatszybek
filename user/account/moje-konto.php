<?php //route[moje-konto]

if (!$app["user"]["id"]) {
  header("Location: /");
  die;
}

$parts = explode("/", $url);

$user_id = $app["user"]["id"];

//$user_data = fetchRow("SELECT user_id, imie, nazwisko, email, telefon, firma, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu, nip, authentication_token FROM `users` WHERE user_id = ".intval($user_id));
$user_data = fetchRow("SELECT * FROM users WHERE user_id = " . intval($user_id));

$menu = "zamowienia";
if (strpos($url, "dane-uzytkownika") !== false)
  $menu = "uzytkownik";
if (strpos($url, "resetowanie-hasla") !== false)
  $menu = "haslo";

?>

<!DOCTYPE html>
<html lang="pl">

<head>
  <title>Moje konto</title>
  <?php include "global/includes.php"; ?>
  <link href="/src/zamowienia.css" rel="stylesheet">
  <style>
    .nav {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      padding: 0 10px;
    }

    .nav>* {
      padding: 10px 16px;
      border: 1px solid #ccc;
      margin: 5px;
      border-radius: 4px;
      text-align: center;
      cursor: pointer;
      transition: 0.2s;
    }

    @media only screen and (max-width: 600px) {
      .nav>* {
        width: calc(100% - 10px) !important;
      }
    }

    .selected {
      color: white;
      background: #60c216;
      border-color: #60c216;
    }

    .menu {
      -webkit-transition: opacity 0.2s;
      transition: opacity 0.2s;
      width: 100%;
      margin: auto;
    }

    .showNow {
      opacity: 1;
    }

    .menu:not(.showNow) {
      opacity: 0;
    }
  </style>
  <script>
    /*var menus = ['/moje-konto/dane-uzytkownika']
      window.onpopstate = history.onpushstate = function(e) {
        e.state == "";
      }*/


    var currentMenu = <?php if ($menu == "uzytkownik") echo "2";
                      else if ($menu == "haslo") echo "3";
                      else echo "1"; ?>;
    var wait = false;

    function showMenu(i) {
      if (wait || currentMenu == i) return;

      /*if (i == 2)
      {
        window.history.pushState({urlPath:'/moje-konto/dane-uzytkownika'},"",'/moje-konto/dane-uzytkownika');
      }
      else if (i == 1)
      {
        window.history.pushState({urlPath:'/moje-konto'},"",'/moje-konto');
      }*/

      wait = true;
      var wasMenu = currentMenu;
      $("#menu" + wasMenu).classList.remove("showNow");
      $("#menu" + i).style.display = "flex";
      $("#menu" + i).style.position = "fixed";
      $("#menu" + i).style.height = "";
      $("#menuHeader" + wasMenu).classList.remove("selected");
      $("#menuHeader" + i).classList.add("selected");
      setTimeout(function() {
        $("#menu" + wasMenu).style.display = "none";
        $("#menu" + i).classList.add("showNow");
        $("#menu" + i).style.position = "";
        wait = false;
      }, 200);
      currentMenu = i;
    }

    window.addEventListener("DOMContentLoaded", function() {
      setFormData(<?= json_encode($user_data, true) ?>, "#accountForm");

      $$("#dataForm .field").forEach(e => {
        e.addEventListener("input", function() {
          const btn = $("#allowSave:disabled");
          if (btn) btn.removeAttribute("disabled");
        });
      });
    });

    function saveDataForm() {
      form = $("#dataForm");

      if (!validateForm(form)) {
        return;
      }

      const params = getFormData(form);

      xhr({
        url: "/save_user",
        params,
        success: (res) => {
          console.log(res);
          if (res.message) {
            $("#message .message").innerHTML = res.message;
            showModal("message");
          }

          if (res.redirect) {
            $("#message button").addEventListener("click", () => {
              window.location = res.redirect;
            })
          }

          if (res.data) {
            setFormData(res.data, form);
          }
        }
      });
    }

    function savePasswordForm() {
      form = $("#passwordForm");

      if (!validateForm(form)) {
        return;
      }

      const params = getFormData(form);

      xhr({
        url: "/save_user",
        params,
        success: (res) => {
          console.log(res);
          if (res.message) {
            $("#message .message").innerHTML = res.message;
            showModal("message");
          }

          if (res.redirect) {
            $("#message button").addEventListener("click", () => {
              window.location = res.redirect;
            })
          }

          if (res.data) {
            setFormData(res.data, form);
          }
        }
      });
    }
  </script>
</head>

<body class="default-form">
  <?php include "global/header.php"; ?>
  <div id="accountForm" class="main-container">
    <div style="margin-top:30px"></div>
    <div id="message" data-modal data-expand>
      <div style="display: flex;
                  width: 300px;
                  height: auto;
                  background: #fff;
                  padding: 10px;
                  border-radius: 5px;
                  flex-direction: column;
                  justify-content: space-between;">
        <div class="message" style="margin-bottom: 20px; text-align: center;"></div>
        <button style="margin:auto;" class="btn primary" onclick="hideParentModal(this)">Okej <i class='fas fa-check'></i></button>
      </div>
    </div>

    <div style="margin-top:20px"></div>

    <div style="text-align:center;padding: 25px;font-size: 20px">
      <?php
      if ($app["user"]["type"] == 'g') echo '<img src="/img/google.png" style="width: 1em;vertical-align: sub;"> ';
      if ($app["user"]["type"] == 'f') echo '<i class="fab fa-facebook-square" style="font-size: 1em;color: #3b5998;"></i> ';
      if ($app["user"]["type"] == 's') echo '<i class="fas fa-user" style="font-size: 1em;"></i> ';
      echo $app["user"]["name"];
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
        <?php if ($app["user"]["type"] == 's') : ?>
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
        <div id="menu1" class="menu mobileRow <?php if ($menu == "zamowienia") echo "showNow"; ?>" style="<?php if ($menu != "zamowienia") echo 'display:none;'; ?>">
          <div style="text-align:center;margin:30px auto">
            <?php
            $table = "";
            $tableMobile = "<div class='mobileTable' style='text-align:left'>";
            $stmt = $con->prepare("SELECT zamowienie_id, link, koszt, status, DATE_FORMAT(zlozono, '%d-%m-%Y %H:%i'), oplacono FROM zamowienia WHERE user_id = ? ORDER BY zlozono DESC");
            $stmt->bind_param("s", $user_id);
            $stmt->execute();
            $stmt->bind_result($zamowienie_id, $link, $koszt, $status, $zlozono, $oplacono);
            $rowCount = 0;
            while (mysqli_stmt_fetch($stmt)) {
              $status = renderStatus($status);

              $rowCount++;

              if ($rowCount == 1) {
                $table .= "<h3 style='margin: 0 auto; font-size: 26px;text-align:center'>Twoje zamówienia</h3><table class='zamowienia_table hideMobile'><tr style='background: #60d010;color: white;'><td>Nr zamówienia</td><td>Koszt</td><td>Status</td><td>Data utworzenia</td><td></td></tr>";
              }
              $table .= "<tr><td>#$zamowienie_id</td><td>$koszt zł</td><td>$status</td><td>$zlozono</td><td><a class='btn primary fill' href='/zamowienie/$link'>Szczegóły <i class='fa fa-chevron-right'></i></a></td></tr>";
              $tableMobile .= "<div>
                                    <div style='text-align:center'><span style='font-weight: bold;font-size: 18px;'>Zamówienie: #$zamowienie_id</span></div>
                                    <div>Koszt: $koszt zł</div>
                                    <div>Status: $status</div>
                                    <div>Data utworzenia: $zlozono</div>
                                    <a class='btn primary fill' href='/zamowienie/$link'>Szczegóły <i class='fa fa-chevron-right'></i></a>
                                    </div>";
            }
            $stmt->close();

            if ($rowCount == 0) {
              $table = '<h3 style="margin: 40px 0 50px; font-size: 26px;">Brak zamówień</h3>
                            <a class="btn primary big" href="/">
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

        <div id="dataForm" class="menu mobileRow <?php if ($menu == "uzytkownik") echo "showNow"; ?>" style="<?php if ($menu != "uzytkownik") echo 'display:none;'; ?>">
          <div style="width:100%;">
            <div class="mobileRow" style="max-width: 820px;margin: 0 auto;">
              <div style="width: 50%; padding:10px">
                <div style="width:100%;margin:auto;max-width:350px">
                  <h3 style="text-align: center;font-size: 26px;margin: 45px 0 35px;">Dane kontaktowe</h3>

                  <div class="field-title">Imię</div>
                  <input type="text" class="field" name="imie" autocomplete="first-name" data-validate>

                  <div class="field-title">Nazwisko</div>
                  <input type="text" class="field" name="nazwisko" autocomplete="family-name" data-validate>

                  <div class="field-title">Adres e-mail</div>
                  <input type="text" class="field" name="email" autocomplete="email" data-validate="email">

                  <div class="field-title">Nr telefonu</div>
                  <input type="text" class="field" name="telefon" autocomplete="tel" data-validate>

                  <div class="field-title">Nazwa firmy</div>
                  <input type="text" class="field" name="firma" autocomplete="organization">

                  <div class="field-title">NIP</div>
                  <input type="text" class="field" name="nip">
                </div>
              </div>
              <div style="width: 50%; padding:10px;">
                <div style="width:100%;margin:auto;max-width:350px">
                  <h3 style="text-align: center;font-size: 26px;margin: 45px 0 35px;">Adres</h3>
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
                  <div style="margin-top: 70px;text-align: right;">
                    <button class="btn primary big" id="allowSave" onclick="saveDataForm()" disabled>
                      Zapisz zmiany
                      <i class="fa fa-cog"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="passwordForm" class="menu mobileRow <?php if ($menu == "haslo") echo "showNow"; ?>" style="<?php if ($menu != "haslo") echo 'display:none;'; ?>">
          <div style="width:100%;margin:40px auto;max-width:350px">
            <h3 style="text-align: center;font-size: 26px;margin: 15px 0 35px;">Zmiana hasła</h3>

            <div class="field-title">Hasło (min. 8 znaków)</div>
            <div class="field-wrapper">
              <input type="password" name="password" class="field" data-validate="password">
              <i class="correct fa fa-check"></i>
              <i class="wrong fa fa-times"></i>
            </div>

            <div class="field-title">Powtórz hasło</div>
            <div class="field-wrapper">
              <input type="password" name="password_rewrite" class="field" data-validate="|match:#passwordForm .field[name='password']">
              <i class="correct fa fa-check"></i>
              <i class="wrong fa fa-times"></i>
            </div>
            <input type="hidden" name="user_id">
            <input type="hidden" name="authentication_token">
            <input type="hidden" name="moje-konto" value="1">

            <input type="hidden" name="email">
            <button class="btn primary big" style="margin:10px 0; width: 100%" onclick="savePasswordForm()">
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