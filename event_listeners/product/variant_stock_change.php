<?php //event[variant_stock_change]

$variant_data = DB::fetchRow("SELECT stock, title, link, product_id, image, name FROM variant INNER JOIN products USING(product_id) WHERE variant_id = " . intval($args["variant_id"]));

if (!$variant_data) {
    return;
}

$new_stock = $variant_data["stock"] + intval($args["stock_difference"]);
if ($new_stock < 0) $new_stock = 0;

DB::execute("UPDATE variant SET stock = $new_stock WHERE variant_id = " . intval($args["variant_id"]));

$product_link = getProductLink($variant_data["product_id"], $variant_data["link"]);
$product_image = "<img style='max-width:300px' src='" . SITE_URL . "/md/" . $variant_data["image"] . "'>";

if ($new_stock > 0) // $variant_data["stock"] == 0 && 
{
    $mailTitle = "Powiadomienie o dostępności " . $variant_data["title"] . " - " . $app["company_data"]['email_sender'];

    $message = "<p>Uprzejmie informujemy, że <b>" . $variant_data["title"] . " " . $variant_data["name"] . "</b> jest dostępny w naszym sklepie!</p>";
    $message .= "<a href='$product_link' style='color:#37f;font-weight:bold;font-size:16px'>Kup teraz</a><br><br>";
    $message .= $product_image;
    $message .= getEmailFooter();

    $emails = DB::fetchCol("SELECT n.email FROM notifications n WHERE sent = 0 AND variant_id = " . intval($args["variant_id"]));
    foreach ($emails as $email) {
        //sendEmail($email, $message, $mailTitle);
        //sendEmail("wojtekwo997@gmail.com", $message . $email, $mailTitle);
    }

    DB::execute("UPDATE notifications SET sent = 1 WHERE variant_id = " . intval($args["variant_id"]));
}
if ($variant_data["stock"] > 0 && $new_stock == 0) {
    $mailTitle = "Brak " . $variant_data["title"] . " na stanie " . date("Y-m-d");

    $message = "<p>Ostatnia sztuka <b>" . $variant_data["title"] . " " . $variant_data["name"] . "</b> została sprzedana lub została usunięta z magazynu!</p>";
    $message .= "<a href='$product_link' style='color:#37f;font-weight:bold;font-size:16px'>Pokaż produkt</a><br><br>";
    $message .= $product_image;

    //sendEmail(config('main_email'), $message, $mailTitle);
    //sendEmail("wojtekwo997@gmail.com", $message, $mailTitle);
    //TODO: lista powiadomien o zmianie stanu magazynowego
}
