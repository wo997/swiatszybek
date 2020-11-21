<?php //route[rejestracja]

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <title>Rejestracja</title>
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
        function validateUserEmailExists(input) {
            const registerForm = $(`#registerForm`);

            xhr({
                url: "/validate-email",
                params: getFormData(registerForm),
                success: (res) => {
                    var errors = [];
                    if (res == "exists") {
                        var m = "<span style='color: black'>To konto jest aktywne";
                        if (!IS_LOGGED) {
                            m += ` <button class='btn primary' onclick='showModal("loginForm",{source:this})'>ZALOGUJ SIĘ</button></span>`;
                        }
                        errors.push(m);
                    } else if (res == "unauthenticated") {
                        errors.push("<span style='color: black'>Konto istnieje <b style='color:var(--success-clr);display: inline-block;' class='link' onclick='register(false)'>WYŚLIJ LINK AKTYWACYJNY</b></span>");
                    } else if (res == "invalid") {
                        errors.push("Wpisz poprawny adres email");
                    }

                    toggleDisabled("#registerForm [data-submit]", errors.length);

                    showFieldErrors(input, errors);
                },
            });
        }

        function register(validate = true) {
            const registerForm = $(`#registerForm`);

            if (validate && !validateForm(registerForm, {
                    except_backend: true
                })) {
                return;
            }

            xhr({
                url: "/register",
                params: getFormData(registerForm),
                success: (res) => {
                    if (res.message && res.error_field_name) {
                        markFieldWrong(registerForm.find(`[name="${res.error_field_name}"]`), [
                            res.message,
                        ]);
                    } else if (res.message) {
                        showMessageModal(res.message);
                    }
                },
            });
        }
    </script>
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