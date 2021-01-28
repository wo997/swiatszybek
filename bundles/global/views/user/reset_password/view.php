<?php //route[resetowanie-hasla]
?>


<?php startSection("head_content"); ?>

<title>Resetowanie hasła</title>

<?php startSection("body_content"); ?>

<form data-form onsubmit="return validateForm(this)" action="/reset_password" method="post" class="paddingable" style="margin:auto;padding-bottom:50px;max-width:350px">
    <h1 class="h1" style="text-align:center">Resetowanie hasła</h1>

    <div class="label">Twój e-mail</div>
    <input type="text" class="field" name="email" data-validate="email">

    <button class="btn primary medium" style="margin:10px 0; width: 100%">
        Wyślij link na maila
        <i class="fa fa-envelope"></i>
    </button>

    <?php if (false) : ?>
        <div class="label">Hasło (min. 8 znaków)</div>
        <input type="password" name="password" class="field" data-validate="password">

        <div class="label">Powtórz hasło</div>
        <input type="password" name="password_rewrite" class="field" data-validate="|match:form [name='password']">

        <input type="hidden" name="user_id" value="<?= $user_id ?>">
        <input type="hidden" name="authentication_token" value="<?= $authentication_token ?>">
        <input type="hidden" name="email" value="<?= $email ?>">
        <button class="btn primary medium" style="margin:10px 0; width: 100%">
            Akceptuj zmianę hasła
            <i class="fa fa-chevron-right"></i>
        </button>
    <?php else : ?>

    <?php endif ?>
</form>

<?php include "user/page_template.php"; ?>