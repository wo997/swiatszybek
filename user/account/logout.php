<?php //route[logout]

unset($_SESSION["user"]);
setcookie("remember_me_token", "", time() - 3600);

/*if (isset($_SERVER["HTTP_REFERER"]) && strpos(nonull(parse_url($_SERVER["HTTP_REFERER"]), "path", ""), SITE_URL . "/admin")) {
    redirect("/");
} else {
    reload();
}*/
// cmon, we are redirected anyways
reload();
