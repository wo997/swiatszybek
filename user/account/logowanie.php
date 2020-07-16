<?php //->[logowanie] 
  if ($app["user"]["id"]) {
    header("Location: /moje-konto");
    die;
  }
?>

<!DOCTYPE html>
<html lang="pl">
  <head>
    <title>Logowanie</title>
    <meta name="description" content="Zaloguj się do sklepu <?=config('main_email_sender')?>">

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
      .items > div {
        margin: 14px 0 !important;
      }
      table {
        width: 100%;
        font-size: 18px;
        text-align: left;
      }
      td, th {
        padding: 5px;
      }
      #table {
        display:inline-block;
        min-width: 90%;
      }
      #table > div {
        display: flex;
        width: 100%;
        font-size: 18px;
        padding: 5px;
        justify-content: space-between;
        text-align: left;
      }
      #table > div:nth-child(even) {
        background-color: #f8f8f8;
      }
      #table > div:nth-child(odd) {
        background-color: #f3f3f3;
      }
      @media only screen and (max-width: 750px) {
        #table > div {
          flex-direction: column;
        }
        #table > div > div:nth-child(2) {
          text-align: right;
          margin-top: 8px;
        }
      }
      .button {
        width: 100%;
      }
      .main-container {
        overflow: hidden;
        position: relative;
        display: flex;
        min-height: calc(100vh - 230px);
        flex-direction: column;
        justify-content: center;
      }
    </style>
    <script>
      
    </script>
  </head>
  <body class="default-form">
    <?php include "global/header.php"; ?>
    <div class="main-container centerVerticallyMenu">
      <form action="/login" method="post" class="paddingable" style="margin:auto;max-width:350px">
        <h1 class="h1">Logowanie</h1>
        <?php
          if (isset($_POST["message"]))
            echo $_POST["message"];
          
          if (!isset($_SESSION["redirect"]) && isset($_SERVER["HTTP_REFERER"]) && strpos($_SERVER["HTTP_REFERER"],"/login") === false && strpos($_SERVER["HTTP_REFERER"],"/logowanie") === false)
            $_SESSION["redirect"] = $_SERVER["HTTP_REFERER"];//"/moje-konto/zamowienia";
        ?>
        <label>
          <span>E-mail</span>
          <input type="text" autocomplete="username" name="email">
        </label>
        <label>
          <span>Hasło</span>
          <input type="password" autocomplete="password" name="password">
        </label>
        <button class="btn primary big" style="margin:10px 0; width: 100%">
          Zaloguj się
         <i class="fa fa-chevron-right"></i>
        </button>
        <div style="text-align:center; margin-top:30px;font-size: 15px">
          Nie masz konta?
          <a href="/rejestracja" style="border-bottom: 1px solid black;">
            Zarejestruj się
          </a>
        </div>
        <div style="text-align:center; margin-top:20px;font-size: 15px">
          Nie pamiętasz hasła?
          <a href="/resetowanie-hasla" style="border-bottom: 1px solid black;">
            Zresetuj je tutaj
          </a>
        </div>

        <div style="text-align: center;margin-top: 25px;">lub</div>
        <div class="g-signin2" data-onsuccess="onSignIn"></div>
        
        <?=$fb_login_btn?>

      </form>
    </div>
    <?php include "global/footer.php"; ?>
  </body>
</html>
