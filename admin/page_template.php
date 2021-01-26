<?php

endSection();

?>

<?php

endSection();

?>

<?php startSection("body"); ?>

<header class="navbar_admin">
    <div class="scroll-panel scroll-shadow hide_scrollbar">
        <div>
            <a href="/" class="home logo-wrapper">
                <img class="logo logo-default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
                <br>
                Strona główna
            </a>

            <div style="padding:0 10px 10px">
                <div class="label first">Wyszukaj w panelu admina</div>
                <input type="text" class="field" placeholder="W planach...">
            </div>

            <?php include "navbar.php" ?>

            <hr>
            <div class="menu_item" onclick="return logout()">
                <a><i class="fas fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się</a>
            </div>
        </div>
    </div>
</header>
<div class="content">
    <?= def($sections, "header", ""); ?>
    <?php
    if (!isset($sections["header"])) {
    ?>
        <style>
            .content>.scroll-panel {
                background: #fafafa;
            }
        </style>
    <?php
    }
    ?>
    <div class="scroll-panel scroll-shadow">
        <div class="panel-padding actual-content">
            <?= def($sections, "body_content", ""); ?>
        </div>
        <div class="footer">Piepsklep <?= date("Y") ?></div>
    </div>
</div>


<?php include "global/blank_page_template.php"; ?>