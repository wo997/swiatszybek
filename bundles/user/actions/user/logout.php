<?php //route[{USER}/logout]

User::getCurrent()->logout();

Request::redirect("/");
// nobody cares
// if (isset($_SERVER["HTTP_REFERER"]) && strpos(def(parse_url($_SERVER["HTTP_REFERER"]), "path", ""), "/admin") === 0) {
// } else {
//     Request::reload();
// }
