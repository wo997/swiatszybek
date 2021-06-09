<?php

Templates::endSection();

?>

<?php Templates::startSection("body"); ?>

<div class="admin_layout admin_root">
    <div class="navbar_admin_mobile">
        <a href="/" class="logo_wrapper">
            <img class="logo" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
        </a>
        <div class="menu_btn">
            <img class="menu_icon" src="/src/img/menu_icon.svg">
            <span class="close"></span>

        </div>
    </div>

    <div class="navbar_admin">
        <div class="scroll_panel scroll_shadow hide_scrollbar">
            <div>
                <a href="/" class="home logo_wrapper link">
                    <img class="logo" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
                    Przejdź do sklepu <i class="fas fa-chevron-right"></i>
                </a>
                <!-- <hr> -->

                <!-- <div style="padding:0 10px 10px">
                    <div class="label first">Wyszukaj w panelu admina</div>
                    <input class="field" placeholder="W planach...">
                </div> -->

                <?php include "bundles/admin/navbar.php" ?>

                <hr>
                <div class="menu_item" onclick="return logout()">
                    <a><i class="fas fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się</a>
                </div>
            </div>
        </div>
    </div>

    <div class="content">
        <div class="main_header">
            <?= def(Templates::$sections, "header", ""); ?>
        </div>
        <?php
        if (!isset(Templates::$sections["header"])) {
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
                <?= def(Templates::$sections, "admin_page_body", ""); ?>
            </div>
            <footer>Piepsklep <?= date("Y") ?></footer>
        </div>
    </div>
</div>

<?php include "bundles/global/templates/blank.php"; ?>