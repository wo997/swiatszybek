/* js[view] */

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
    