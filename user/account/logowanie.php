<?php //deprecated route[logowanie] 
if ($app["user"]["id"]) {
  header("Location: /moje-konto");
  die;
}
?>

<!DOCTYPE html>
<html lang="pl">

<head>
  <title>Logowanie</title>
  <meta name="description" content="Zaloguj się do sklepu <?= $app["company_data"]['email_sender'] ?>">

  <?php include "global/includes.php"; ?>
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

    #table {
      display: inline-block;
      min-width: 90%;
    }

    #table>div {
      display: flex;
      width: 100%;
      font-size: 18px;
      padding: 5px;
      justify-content: space-between;
      text-align: left;
    }

    #table>div:nth-child(even) {
      background-color: #f8f8f8;
    }

    #table>div:nth-child(odd) {
      background-color: #f3f3f3;
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

<body>
  <?php include "global/header.php"; ?>
  <div class="main-container centerVerticallyMenu">
    <div class="paddingable" style="margin:auto;max-width:350px">
      <?php
      // if (!isset($_SESSION["redirect"]) && isset($_SERVER["HTTP_REFERER"]) && strpos($_SERVER["HTTP_REFERER"], "/login") === false && strpos($_SERVER["HTTP_REFERER"], "/logowanie") === false)
      //   $_SESSION["redirect"] = $_SERVER["HTTP_REFERER"]; //"/moje-konto/zamowienia";
      ?>
      <?php include "user/account/login_form.php"; ?>

    </div>
  </div>
  <?php include "global/footer.php"; ?>
</body>

</html>