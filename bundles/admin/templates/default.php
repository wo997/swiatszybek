<?php

endSection();

?>

<?php

endSection();

?>

<?php startSection("body"); ?>

<header class="navbar_admin">
    <div class="scroll_panel scroll_shadow hide_scrollbar">
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

            <?php include "bundles/admin/navbar.php" ?>

            <hr>
            <div class="menu_item" onclick="return logout()">
                <a><i class="fas fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się</a>
            </div>
        </div>
    </div>
</header>
<div class="content">
    <div class="main_header">
        <?= def($sections, "header", ""); ?>
    </div>
    <?php
    if (!isset($sections["header"])) {
    ?>
        <style>
            .content>.scroll_panel {
                background: #fafafa;
            }
        </style>
    <?php
    }
    ?>
    <div class="scroll_panel scroll_shadow">
        <div class="panel_padding actual-content">
            <?= def($sections, "body_content", ""); ?>
        </div>
        <div class="footer">Piepsklep <?= date("Y") ?></div>
    </div>
</div>


<?php include "global/blank_page_template.php"; ?>