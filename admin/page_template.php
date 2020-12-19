<?php

endSection();

?>

<!DOCTYPE html>
<html lang="pl">

<head>
    <?php include "global/includes.php"; ?>
    <?php if (isset($sections["head_content"])) echo $sections["head_content"]; ?>
</head>

<body id="admin">
    <div class="main-container">
        <div class="main-wrapper">
            <header class="navbar_admin">
                <div class="scroll-panel scroll-shadow">
                    <div>
                        <a href="/" class="home logo-wrapper">
                            <img class="logo logo-default" src="<?= LOGO_PATH_LOCAL_SM ?>" data-same-ext>
                            <br>
                            Strona główna
                        </a>

                        <div style="padding:0 10px 10px">
                            <div class="field-title first">Wyszukaj w panelu admina</div>
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
                <?= nonull($sections, "header", ""); ?>
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
                        <?= nonull($sections, "body_content", ""); ?>
                    </div>
                    <div class="footer">Piepsklep <?= date("Y") ?></div>
                </div>
            </div>
        </div>
    </div>

    <!-- hidden -->
    <?php include "global/footer.php"; ?>

</body>

</html>