<?php
Templates::startSection("body_content");
?>

<div style="text-align: center;margin: auto 0;padding: 100px 20px;">
    <h1 class="blc">Nie znaleźliśmy nic pod danym adresem</h1>
    <p>Skorzystaj z wyszukiwarki lub znajdź konkretną kategorię w menu głównym</p>
</div>

<?php

http_response_code(404);
include "bundles/global/templates/default.php";
