<?php //route[rejestracja]

function a($name)
{
  if (isset($_POST[$name]))
    return "value='{$_POST[$name]}'";
}
?>

<!DOCTYPE html>
<html lang="pl">

<head>
  <title>Rejestracja</title>
  <?php include "includes.php"; ?>
  <style>
    #total {
      display: inline-block;
      padding: 10px;
    }

    .usun {
      margin: auto;
      display: block;
      max-width: 70px;
      font-size: 16px;
      padding: 3px 0;
    }

    .items>div {
      margin: 14px 0 !important;
    }

    table {
      width: 100%;
      font-size: 18px;
      text-align: left;
    }

    td,
    th {
      padding: 5px;
    }

    @media only screen and (max-width: 750px) {
      #table>div {
        flex-direction: column;
      }

      #table>div>div:nth-child(2) {
        text-align: right;
        margin-top: 8px;
      }
    }

    .button {
      width: 100%;
    }

    .menu {
      overflow: hidden;
      -webkit-transition: opacity 0.2s;
      transition: opacity 0.2s;
      width: 100%;
      margin: auto;
    }

    @media only screen and (max-width: 750px) {
      .fullwidthmobile {
        max-width: none !important;
      }
    }
  </style>
  <script>
    function lockInput(input, limit) {
      input.style.borderColor = "red";
      input.oninput = function() {
        if (input.value.length >= limit) {
          this.style.borderColor = "";
          if (input.id == "password") {
            $("#password_ok").style.display = "block";
            $("#password_wrong").style.display = "none";
          }
        }
      }
    }

    function validateForm(form) {
      var req = document.getElementsByClassName("required");
      for (i = 0; i < req.length; i++) {
        var input = req[i];
        if (input.value == "") {
          lockInput(input, 0);
          return false;
        }
      }

      if (form.password.value.length < 8) {
        $("#password_wrong").style.display = "block";
        lockInput(form.password, 8);
        return false;
      }

      if (form.password2.value != form.password.value) {
        $("#password2_wrong").style.display = "block";
        form.password2.style.borderColor = "red";
        return false;
      }

      return true;
    }

    function samePassword(password2) {
      var p = $("#password");
      var good = password2.value == p.value;
      if (password2.style.borderColor != "")
        password2.style.borderColor = good ? "" : "red";
      $("#password2_ok").style.display = good ? "block" : "none";
      $("#password2_wrong").style.display = !good ? "block" : "none";
    }
  </script>
</head>

<body>
  <?php include "global/header.php"; ?>

  <div class="centerVerticallyMenu">
    <h1 class="h1">Rejestracja</h1>
    <?php
    if (isset($_POST["message"]))
      echo $_POST["message"];
    ?>
    <form onsubmit="return validateForm({form:this})" class="paddingable" action="/register" method="post">
      <div class="main-container">
        <div class="menu mobileRow" style="max-width: 700px">
          <div style="width: 50%;">
            <div style="width:100%;margin:auto;max-width:300px">
              <label>
                <span class="field-title">Imię</span>
                <input type="text" name="imie" <?= a("imie") ?> autocomplete="first-name" data-validate class="field">
              </label>
              <label>
                <span class="field-title">Nazwisko</span>
                <input type="text" name="nazwisko" <?= a("nazwisko") ?> autocomplete="family-name" data-validate class="field">
              </label>
              <label>
                <span class="field-title">Nr telefonu</span>
                <input type="text" name="telefon" <?= a("telefon") ?> autocomplete="tel" data-validate class="field">
              </label>
            </div>
          </div>
          <div style="width: 50%;">
            <div style="width:100%;margin:auto;max-width:300px">
              <label>
                <span class="field-title">E-mail</span>
                <input type="text" name="email" <?= a("email") ?> autocomplete="email" data-validate class="field">
              </label>
              <label style="position:relative">
                <span class="field-title">Hasło (min. 8 znaków)</span>
                <input type="password" name="password" id="password" autocomplete="new-password" class="field">
                <i id="password_ok" class="fa fa-check" style="position: absolute;right: 5px;bottom: 6px;color: #0d0b;display:none"></i>
                <i id="password_wrong" class="fa fa-times" style="position: absolute;right: 5px;bottom: 6px;color: #d00b;display:none"></i>
              </label>
              <label style="position:relative">
                <span class="field-title">Powtórz hasło</span>
                <input type="password" name="password2" oninput="samePassword(this)" autocomplete="new-password" class="field">
                <i id="password2_ok" class="fa fa-check" style="position: absolute;right: 5px;bottom: 6px;color: #0d0b;display:none"></i>
                <i id="password2_wrong" class="fa fa-times" style="position: absolute;right: 5px;bottom: 6px;color: #d00b;display:none"></i>
              </label>
              <button type="submit" class="btn primary big fullwidthmobile" style="margin:50px 0 50px auto;display:block; max-width:220px">
                Zarejestruj się
                <i class="fa fa-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
  <?php include "global/footer.php"; ?>
</body>

</html>