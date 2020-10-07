<?php

endSection();

?>

<!DOCTYPE html>
<html lang="pl">

<head>
  <?php include "global/includes.php"; ?>
  <?php if (isset($sections["head"])) echo $sections["head"]; ?>
</head>

<body id="admin">
  <div class="main-container">
    <div class="main-wrapper">
      <header class="navbar_admin">
        <a href="/" class="home logo-wrapper">
          <img data-src="<?= LOGO_PATH_LOCAL ?>">
          <br>
          Strona główna
        </a>

        <?php include "navbar.php" ?>

        <hr>
        <div class="menu_item" onclick="return logout()">
          <a><i class="fas fa-sign-out-alt" style="vertical-align: middle;"></i> Wyloguj się</a>
        </div>
      </header>
      <div class="content">
        <?php if (isset($sections["header"])) echo $sections["header"]; ?>
        <div class="scroll-panel scroll-shadow">
          <div class="panel-padding">
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