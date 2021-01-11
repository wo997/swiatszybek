/* js[view] */

        let emailRequest = "<?= $user_data["email_request"]; ?>";
        /*var menus = ['/moje-konto/dane-uzytkownika']
          window.onpopstate = history.onpushstate = function(e) {
            e.state == "";
          }*/


        var currentMenu = <?php if ($menu == "uzytkownik") echo "2";
                            else if ($menu == "haslo") echo "3";
                            else echo "1"; ?>;
        var wait = false;

        function showMenu(i) {
            if (wait || currentMenu == i) return;

            /*if (i == 2)
            {
              window.history.pushState({urlPath:'/moje-konto/dane-uzytkownika'},"",'/moje-konto/dane-uzytkownika');
            }
            else if (i == 1)
            {
              window.history.pushState({urlPath:'/moje-konto'},"",'/moje-konto');
            }*/

            wait = true;
            var wasMenu = currentMenu;
            $("#menu" + wasMenu).classList.remove("showNow");
            $("#menu" + i).style.display = "flex";
            $("#menu" + i).style.position = "fixed";
            $("#menu" + i).style.height = "";
            $("#menuHeader" + wasMenu).classList.remove("selected");
            $("#menuHeader" + i).classList.add("selected");
            setTimeout(function() {
                $("#menu" + wasMenu).style.display = "none";
                $("#menu" + i).classList.add("showNow");
                $("#menu" + i).style.position = "";
                wait = false;
            }, 200);
            currentMenu = i;
        }

        window.addEventListener("DOMContentLoaded", function() {
            setFormData(<?= json_encode($user_data, true) ?>, "#accountForm");

            $$("#menu2 .field").forEach(e => {
                e.addEventListener("input", function() {
                    const btn = $("#allowSave:disabled");
                    if (btn) btn.removeAttribute("disabled");
                });
            });

            if (emailRequest) {
                wyslalismyLinkDoZmianyEmaila(emailRequest, true);
            }

            <?php if (isset($_SESSION["message"])) : ?>
                addMessageBox($(".message-box-container2"), `<?= $_SESSION["message"]["text"] ?>`, {
                    type: `<?= $_SESSION["message"]["type"] ?>`,
                    dismissable: true,
                });
                <?php unset($_SESSION["message"]); ?>
            <?php endif ?>
        });

        function cancelEmailChange() {
            xhr({
                url: "/cancel_email_change_request",
                success: (res) => {
                    addMessageBox($(".message-box-container"), `Anulowano zmianę adresu e-mail`, {
                        dismissable: true,
                    });
                }
            })
        }

        function wyslalismyLinkDoZmianyEmaila(emailRequest, instant = false) {
            addMessageBox($(".message-box-container"), `
        Wysłaliśmy link do zmiany adresu
        <br>email na ${emailRequest}
        <br><b class='btn' onclick='cancelEmailChange()' style="margin-bottom: -0.7em">ANULUJ ZMIANĘ</b>`, {
                instant: instant,
            });
        }

        function saveDataForm() {
            form = $("#menu2");

            if (!validateForm(form)) {
                return;
            }

            const params = getFormData(form);

            xhr({
                url: "/save_user",
                params,
                success: ({
                    message,
                    emails
                }) => {
                    if (message) {
                        showMessageModal(message);
                    }
                    window.userEmails = emails;
                }
            });
        }

        window.addEventListener("modal-hide", (event) => {
            if (event.detail.node.id != "message-modal") {
                return;
            }
            var form = $("#menu2");
            var emails = window.userEmails;
            if (emails) {
                wyslalismyLinkDoZmianyEmaila(emails.new);
                setFormData({
                    email: emails.previous
                }, form);
            }
        });


        function savePasswordForm() {
            form = $("#menu3");

            if (!validateForm(form)) {
                return;
            }

            const params = getFormData(form);

            xhr({
                url: "/save_user",
                params,
                success: ({
                    message
                }) => {
                    if (message) {
                        showMessageModal(message);
                    }
                    setFormData({
                        password: "",
                        password_rewrite: ""
                    }, form);
                }
            });
        }
    