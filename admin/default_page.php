<?php

endSection();

?>

<!DOCTYPE html>
<html lang="pl">

<head>
  <?php include "global/includes.php"; ?>
  <?php if (isset($sections["head"])) echo $sections["head"]; ?>
</head>

<body>
  <?php include "global/header.php"; ?>
  <div class="main-container">
    <div class="admin-wrapper">
      <div class="navbar_wrapper">
        <div class="navbar_admin">
          <?php include "navbar.php" ?>
        </div>
      </div>
      <?php if (isset($sections["content"])) echo $sections["content"]; ?>
    </div>
  </div>

  <?php include "global/footer.php"; ?>
</body>

</html>