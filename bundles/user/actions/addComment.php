<?php //route[addComment]

if (!$app["user"]["id"]) {
    die;
}

include "helpers/safe_post.php";

$posts = ["pseudonim", "tresc", "product_id", "rating"];

foreach ($posts as $p) {
    if (!isset($_POST[$p]))
        die;
    $$p = $_POST[$p];
}

$tresc = htmlspecialchars($tresc);

if ($pseudonim != "") {
    DB::execute("UPDATE users SET pseudonim = ? WHERE user_id = ?", [$pseudonim, $app["user"]["id"]]);
} else $pseudonim = "Anonim";

DB::execute(
    "INSERT INTO comments (pseudonim,dodano,tresc,product_id,user_id,rating) VALUES (?,NOW(),?,?,?,?)",
    [$pseudonim, $tresc, $product_id, $app["user"]["id"], $rating]
);

triggerEvent("product_rating_change", ["product_id" => $product_id]);

$can_user_get_comment_rebate = canUserGetCommentRebate($product_id);

if ($can_user_get_comment_rebate) {
    $kod_rabatowy_example = randomString(6);
    $top = 0;
    while ($top < 3) {
        $top++;
        if (!DB::fetchVal("SELECT 1 FROM kody_rabatowe WHERE kod = ? LIMIT 1", [$kod_rabatowy_example])) break;
        $kod_rabatowy_example .= randomString(2);
    }
    $kwota = 25;
    $ilosc = 1;
    $ogranicz = 50;
    DB::execute(
        "INSERT INTO kody_rabatowe(kod, kwota, ilosc, ogranicz, date_from, date_to) VALUES (?,?,?,?,?,?)",
        [$kod_rabatowy_example, $kwota, $ilosc, $ogranicz, NULL, NULL]
    );

    DB::execute("UPDATE zamowienia SET rebate_generated = 1 WHERE zamowienie_id = ?", [$can_user_get_comment_rebate["zamowienie_id"]]);

    $message = getEmailHeader($can_user_get_comment_rebate);
    $message .= "Dziękujemy Ci za komentarz! Oto Twój kod rabatowy o wartości $kwota zł:";
    $message .= "<span style='font-size: 24px;margin: 10px 0;display:block;font-weight: bold;color: #37f;'>$kod_rabatowy_example</span>";
    $message .= "Możesz go wykorzystać w <a style='font-weight: bold;color: #37f;' href='" . SITE_URL . "'>naszym sklepie</a> lub przekazać znajomemu.";
    $message .= getEMailFooter();

    $mailTitle = "Kod rabatowy za zamówienie #" . $can_user_get_comment_rebate["zamowienie_id"] . " - " . $app["company_data"]['email_sender'];

    sendEmail("wojtekwo997@gmail.com", $message, $mailTitle);
    sendEmail($app["user"]["email"], $message, $mailTitle);

    echo "{\"kod_rabatowy\":\"$kod_rabatowy_example\"}";
}
