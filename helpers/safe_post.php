<?php
foreach ($_POST as &$var) {
  $var = htmlspecialchars($var);
}
unset($var);