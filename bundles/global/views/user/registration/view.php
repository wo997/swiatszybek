<?php //route[/rejestracja]

$register_email = "";
if (isset($_SESSION["register_email"])) {
    $register_email = $_SESSION["register_email"];
    unset($_SESSION["register_email"]);
}

?>

<?php startSection("head_content"); ?>

<title>Rejestracja</title>

<script>
    const register_email = `<?= $register_email ?>`;
</script>

<?php startSection("body_content"); ?>

<div style="margin-top: auto;padding:20px 0">
    <h1 class="h1">Rejestracja</h1>
    <div class="paddingable" id="registerForm" data-form style="min-height: 400px;">
        <div class="main-container">
            <div class="menu mobileRow" style="max-width: 800px">
                <div style="width: 50%;">
                    <div style="width:100%;margin:auto;max-width:350px">
                        <span class="label">E-mail</span>
                        <input type="text" name="email" autocomplete="email" data-validate="backend|custom:validateUserEmailExists|delay:300" class="field">

                        <div class="label">Hasło (min. 8 znaków)</div>
                        <input type="password" name="password" class="field" data-validate="password" autocomplete="new-password">

                        <div class="label">Powtórz hasło</div>
                        <input type="password" name="password_rewrite" class="field" data-validate="|match:#registerForm [name='password']" autocomplete="new-password">
                    </div>
                </div>
                <div style="width: 50%;">
                    <div style="width:100%;margin:auto;max-width:350px">
                        <span class="label">Imię</span>
                        <input type="text" name="first_name" autocomplete="first-name" data-validate class="field">

                        <span class="label">Nazwisko</span>
                        <input type="text" name="last_name" autocomplete="family-name" data-validate class="field">

                        <span class="label">Nr telefonu</span>
                        <input type="text" name="phone" autocomplete="tel" data-validate="tel" class="field">

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

<?php include "bundles/global/templates/default.php"; ?>