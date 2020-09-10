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
      <div class="navbar_admin">
        <a href="/" class="home">
          <img src="/img/logo.png?a">
        </a>
        <?php include "navbar.php" ?>
      </div>
      <div class="content">
        <?php if (isset($sections["content"])) echo $sections["content"]; ?>
      </div>
    </div>


    <!--<div class="admin-wrapper">
      <div class="navbar_wrapper">
        <div class="navbar_admin">
          <?php include "navbar.php" ?>
        </div>
      </div>
    </div>-->
  </div>

  <div class="footer">Piepsklep <?= date("Y") ?></div>

  <?php include "global/footer.php"; ?>


</body>

</html>