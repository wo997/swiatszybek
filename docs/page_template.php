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
                        <!-- pasek boczny <- co to za debil pisał XD -->
                    </div>
                </div>
            </header>
            <div class="content">
                <div class="scroll-panel scroll-shadow">
                    <div class="panel-padding actual-content">
                        <?php if (isset($sections["content"])) echo $sections["content"]; ?>
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