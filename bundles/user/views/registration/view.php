<?php //route[rejestracja]

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <title>Rejestracja</title>
    <?php include "global/includes.php"; ?>
</head>

<body>
    <?php include "global/header.php"; ?>

    <div class="centerVerticallyMenu">
        <h1 class="h1">Rejestracja</h1>
        <div class="paddingable" id="registerForm" data-form style="min-height: 400px;">
            <div class="main-container">
                <div class="menu mobileRow" style="max-width: 800px">
                    <div style="width: 50%;">
                        <div style="width:100%;margin:auto;max-width:350px">
                            <span class="field-title">E-mail</span>
                            <input type="text" name="email" autocomplete="email" data-validate="backend|custom:validateUserEmailExists|delay:300" class="field">

                            <div class="field-title">Hasło (min. 8 znaków)</div>
                            <input type="password" name="password" class="field" data-validate="password" autocomplete="new-password">

                            <div class="field-title">Powtórz hasło</div>
                            <input type="password" name="password_rewrite" class="field" data-validate="|match:#registerForm [name='password']" autocomplete="new-password">
                        </div>
                    </div>
                    <div style="width: 50%;">
                        <div style="width:100%;margin:auto;max-width:350px">
                            <span class="field-title">Imię</span>
                            <input type="text" name="imie" autocomplete="first-name" data-validate class="field">

                            <span class="field-title">Nazwisko</span>
                            <input type="text" name="nazwisko" autocomplete="family-name" data-validate class="field">


                            <span class="field-title">Nr telefonu</span>
                            <input type="text" name="telefon" autocomplete="tel" data-validate="tel" class="field">

                            <button data-submit onclick="register()" class="btn primary medium fullwidthmobile" style="margin:50px 0 50px auto;display:block; max-width:220px">
                                Zarejestruj się
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