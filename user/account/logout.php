<?php //->[logout]
session_start();
unset($_SESSION["user"]);
if (isset($_SERVER["HTTP_REFERER"]) && strpos($_SERVER["HTTP_REFERER"],$SITE_URL) !== 0) {
    header("Location: ".$_SERVER["HTTP_REFERER"]);
}
else {
    header("Location: /");
}
die;
