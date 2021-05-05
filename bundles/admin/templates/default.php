<?php

endSection();

?>

<?php

endSection();

?>

<?php startSection("body"); ?>

<div class="admin_layout admin_root">
    <header class="mobile">
        <a href="/" class="logo_wrapper">
            <img class="logo logo_default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
        </a>
        <div class="menu_btn">
            <img class="menu_icon" src="/src/img/menu_icon.svg">
            <span class="close"></span>

        </div>
    </header>

    <header class="navbar_admin">
        <div class="scroll_panel scroll_shadow hide_scrollbar">
            <div>
                <a href="/" class="home logo_wrapper">
                    <img class="logo logo_default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
                    Strona główna
                </a>
                <hr>

                <div style="padding:0 10px 10px">
                    <div class="label first">Wyszukaj w panelu admina</div>
                    <input class="field" placeholder="W planach...">
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
                .main_admin_scroll {
                    background: #fafafa;
                }
            </style>
        <?php
        }
        ?>
        <div class="scroll_panel scroll_shadow main_admin_scroll">
            <div class="panel_padding actual_content">
                <?= def($sections, "body_content", ""); ?>
            </div>
            <footer>Piepsklep <?= date("Y") ?></footer>
        </div>
    </div>
</div>

<?php include "bundles/global/templates/blank.php"; ?>