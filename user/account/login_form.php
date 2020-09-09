<div id="loginForm">
    <h1 class="h1">Logowanie</h1>

    <div class="field-title">E-mail</div>
    <input class="field" type="text" autocomplete="username" name="email" data-validate="email">

    <div class="field-title">Hasło</div>
    <input class="field" type="password" autocomplete="password" name="password" data-validate="password">

    <div style="margin-top:10px;text-align:center">
        <label class="checkbox-wrapper">
            <input type="checkbox" name="remember_me" value="1">
            <div class="checkbox"></div>
            Zapamiętaj mnie
        </label>
    </div>

    <button class="btn primary big" style="margin:10px 0; width: 100%" onclick="login()">
        Zaloguj się
        <i class="fa fa-chevron-right"></i>
    </button>

    <div style="text-align: center; padding: 10px 0">
        <a href="/rejestracja" class="btn buff subtle">
            Zarejestruj się <i class="fa fa-user-plus"></i>
        </a>
        <div style="height: 10px;"></div>
        <a href="/resetowanie-hasla" class="btn buff subtle">
            Zresetuj hasło <i class="fa fa-lock-open"></i>
        </a>
    </div>

    <div style="text-align: center;">lub</div>
    <div class="g-signin2" data-onsuccess="onSignIn"></div>

    <?= $fb_login_btn ?>
</div>