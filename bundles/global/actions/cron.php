<?php //route[/cron]

if ($_GET["token"] !== secret('security_token')) {
    die("wrong token");
}

foreach (def($build_info, ["hooks", "cron"], []) as $path) {
    @include $path;
}
