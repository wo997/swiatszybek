<?php //route[resetowanie-hasla]

$user_id = urlParam(1);
$authentication_token = urlParam(2);

if ($authentication_token) {
    $email = fetchValue("SELECT email FROM users WHERE user_id = ? AND authentication_token = ?", [$user_id, $authentication_token]);
    if (!$email) {
        redirect("Location: /resetowanie-hasla");
    }
}

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <title>Resetowanie hasła</title>
    <?php include "global/includes.php"; ?>
    <style>

    </style>
    <script>

    </script>
</head>

<body class="default-form">
    <?php include "global/header.php"; ?>
    <form data-form onsubmit="return validateForm(this)" action="/reset_password" method="post" class="paddingable" style="margin:auto;padding-bottom:50px;max-width:350px">
        <?php if ($authentication_token) : ?>
            <h1 class="h1" style="text-align:center">Resetowanie hasła<br><span style="font-size:16px"><i class="fa fa-user"></i> <?= $email ?></span></h1>
        <?php else : ?>
            <h1 class="h1" style="text-align:center">Resetowanie hasła</h1>
        <?php endif ?>
        <?php
        if (isset($_POST["message"]))
            echo $_POST["message"];
        ?>
        <?php if ($authenticated) : ?>
            <div class="field-title">Hasło (min. 8 znaków)</div>
            <input type="password" name="password" class="field" data-validate="password">

            <div class="field-title">Powtórz hasło</div>
            <input type="password" name="password_rewrite" class="field" data-validate="|match:form [name='password']">

            <input type="hidden" name="user_id" value="<?= $user_id ?>">
            <input type="hidden" name="authentication_token" value="<?= $authentication_token ?>">
            <input type="hidden" name="email" value="<?= $email ?>">
            <button class="btn primary medium" style="margin:10px 0; width: 100%">
                Akceptuj zmianę hasła
                <i class="fa fa-chevron-right"></i>
            </button>
        <?php else : ?>
            <div class="field-title">Twój e-mail</div>
            <input type="text" class="field" name="email" data-validate="email">

            <button class="btn primary medium" style="margin:10px 0; width: 100%">
                Wyślij link na maila
                <i class="fa fa-chevron-right"></i>
            </button>
        <?php endif ?>
    </form>
    <?php include "global/footer.php"; ?>
</body>

</html>