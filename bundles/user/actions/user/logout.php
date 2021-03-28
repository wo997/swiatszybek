<?php //route[{USER}/logout]

User::getCurrent()->logout();

if (isset($_SERVER["HTTP_REFERER"]) && strpos(def(parse_url($_SERVER["HTTP_REFERER"]), "path", ""), "/admin") === 0) {
    Request::redirect("/");
} else {
    Request::reload();
}
