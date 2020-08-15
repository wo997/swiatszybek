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
              <div>
                <span class="field-title">Imię</span>
                <input type="text" name="imie" <?= a("imie") ?> autocomplete="first-name" data-validate class="field">
              </div>
              <div>
                <span class="field-title">Nazwisko</span>
                <input type="text" name="nazwisko" <?= a("nazwisko") ?> autocomplete="family-name" data-validate class="field">
              </div>
              <div>
                <span class="field-title">Nr telefonu</span>
                <input type="text" name="telefon" <?= a("telefon") ?> autocomplete="tel" data-validate="tel" class="field">
              </div>
            </div>
          </div>
          <div style="width: 50%;">
            <div style="width:100%;margin:auto;max-width:300px">
              <div>
                <span class="field-title">E-mail</span>
                <input type="text" name="email" <?= a("email") ?> autocomplete="email" data-validate="email" class="field">
              </div>
              <div class="field-title">Hasło (min. 8 znaków)</div>
              <div class="field-wrapper">
                <input type="password" name="password" class="field" data-validate="password">
                <i class="correct fa fa-check"></i>
                <i class="wrong fa fa-times"></i>
              </div>

              <div class="field-title">Powtórz hasło</div>
              <div class="field-wrapper">
                <input type="password" name="password_rewrite" class="field" data-validate="password|match:form [name='password']">
                <i class="correct fa fa-check"></i>
                <i class="wrong fa fa-times"></i>
              </div>
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