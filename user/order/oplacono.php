<?php //route[oplacono]

if (isset($_SESSION["p24_back_url"])) {
    $p24_back_url = $_SESSION["p24_back_url"];
    unset($_SESSION["p24_back_url"]);
} else {
    header("Location: /");
    die;
}
?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <title>Dziękujemy za zamówienie</title>
    <?php include "global/includes.php"; ?>
    <style>

    </style>
    <script>

    </script>
</head>

<body>
    <?php include "global/header.php"; ?>

    <div class="main-container" style="padding:50px 10px;max-width: 850px;margin:0 auto;min-height: 50vh;display: flex;align-items: center;">
        <div style="padding: 20px;border: 1px solid #ddd;background: #fcfcfc;">
            <h1>Zamówienie zostało złożone<i class="fas fa-check-circle" style="margin-left: 5px;color: var(--primary-clr);"></i></h1>
            <p style="font-size: 16px;padding: 6px;">Dziękujemy za zakupy w naszym sklepie.<br>Potwierdzenie wysłaliśmy na Twoją skrzynkę pocztową.<br>Zapraszamy do dalszych zakupów w przyszłości.</p>
            <div class="mobileRow">
                <?php if ($app["user"]["id"]) : ?>
                    <a href="/moje-konto" class="btn primary big" style="margin: 5px;flex-grow: 1">Moje zamówienia</a>
                <?php else : ?>
                    <a href="<?= $p24_back_url ?>" class="btn primary big" style="margin: 5px;flex-grow: 1;">Przejdź do zamówienia</a>
                <?php endif ?>
                <a href="/" class="btn secondary big" style="margin: 5px;flex-grow: 1">Strona główna</a>
            </div>
        </div>
    </div>

    <?php include "global/footer.php"; ?>
</body>

</html>