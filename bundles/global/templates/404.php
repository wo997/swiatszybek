<?php
startSection("body_content");
?>

<div style="text-align: center;margin: 30vh 0 0;">
    <h1>Nie znaleźliśmy nic pod danym adresem</h1>
    <p>Skorzystać z wyszukiwarki by sprawnie znaleźć produkt.</p>
</div>

<?php

http_response_code(404);
include "bundles/global/templates/default.php";
