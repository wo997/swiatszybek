<?php //->[resetowanie-hasla]

$parts = explode("/",$url);

$authenticated = count($parts) > 2;
if ($authenticated)
{
  $user_id = $parts[1];
  $authentication_token = $parts[2];

  $email = fetchValue("SELECT email FROM users WHERE user_id = ? AND authentication_token = ?", [$user_id, $authentication_token]);
  if (!$email)
  {
    header("Location: /resetowanie-hasla");
    die;
  }
}

?>

<!DOCTYPE html>
<html lang="pl">
  <head>
    <title>Logowanie</title>
    <?php include "includes.php"; ?>
    <style>

    </style>
    <script>

    </script>
  </head>
  <body class="default-form">
    <?php include "global/header.php"; ?>
    <div class="main-container">

      <form onsubmit="return validateForm({form:this})" action="/reset_password" method="post" class="centerVerticallyMenu paddingable" style="margin:auto;padding-bottom:50px;max-width:350px">
        <?php if ($authenticated) : ?>
          <h1 class="h1" style="text-align:center">Resetowanie hasła<br><span style="font-size:18px"><i class="fa fa-user"></i> <?=$email?></span></h1>
        <?php else: ?>
          <h1 class="h1" style="text-align:center">Resetowanie hasła</h1>
        <?php endif ?>
        <?php
          if (isset($_POST["message"]))
            echo $_POST["message"];
        ?>
        <?php if ($authenticated) : ?>
          <div class="field-title">Hasło (min. 8 znaów)</div>
          <div class="field-wrapper">
            <input type="password" name="password" class="field" data-validate="password">
            <i class="correct fa fa-check"></i>
            <i class="wrong fa fa-times"></i>
          </div>

          <div class="field-title">Powtórz hasło</div>
          <div class="field-wrapper">
            <input type="password" name="password_rewrite" class="field" data-validate="match:form .field[name='password']">
            <i class="correct fa fa-check"></i>
            <i class="wrong fa fa-times"></i>
          </div>

          <input type="hidden" name="user_id" value="<?=$user_id?>">
          <input type="hidden" name="authentication_token" value="<?=$authentication_token?>">
          <input type="hidden" name="email" value="<?=$email?>">
          <button class="btn primary big" style="margin:10px 0; width: 100%">
            Akceptuj zmianę hasła
           <i class="fa fa-chevron-right"></i>
          </button>
        <?php else: ?>
          <div class="field-title">Twój e-mail</div>
          <input type="text" class="field" name="email" data-validate="email">

          <button class="btn primary big" style="margin:10px 0; width: 100%">
            Wyślij link na maila
           <i class="fa fa-chevron-right"></i>
          </button>
        <?php endif ?>
      </form>
    </div>
    <?php include "global/footer.php"; ?>
  </body>
</html>
