<?php //route[/moje-konto]

if (!User::getCurrent()->getId()) {
    header("Location: /");
    die;
}

$user_id = User::getCurrent()->getId();

//$user_data = DB::fetchRow("SELECT user_id, imie, nazwisko, email, telefon, firma, kraj, miejscowosc, kod_pocztowy, ulica, nr_domu, nr_lokalu, nip, authentication_token FROM `users` WHERE user_id = ".intval($user_id));
$user_data = DB::fetchRow("SELECT * FROM user WHERE user_id = " . intval($user_id));

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
            // if (User::getCurrent()->entity->getProp("type") == 'google') echo '<img src="/img/google.png" style="width: 1em;vertical-align: sub;"> ';
            // if (User::getCurrent()->entity->getProp("type") == 'facebook') echo '<i class="fab fa-facebook-square" style="font-size: 1em;color: #3b5998;"></i> ';
            // if (User::getCurrent()->entity->getProp("type") == 'regular') echo '<i class="fas fa-user" style="font-size: 1em;"></i> ';
            // echo User::getCurrent()->getDisplayName();
            ?>
        </div>

        <div class="centerwhenbig" style="padding-bottom: 40px">

        </div>
    </div>
    </div>
    <?php include "global/footer.php"; ?>
</body>

</html>