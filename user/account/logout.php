<?php //route[logout]

unset($_SESSION["user"]);
unset($_SESSION["redirect_on_login"]);
unset($_SESSION["redirect"]);

setcookie("remember_me_token", "", 0);

if (isset($_SERVER["HTTP_REFERER"]) && strpos(nonull(parse_url($_SERVER["HTTP_REFERER"]), "path", ""), "/admin") === 0) {
    redirect("/");
} else {
    reload();
}
