<?php //route[admin/save-konfiguracja]



$posts = ["prop_val"];

foreach ($posts as $p) {
  if (!isset($_POST[$p]))
    die($p);

  $$p = $_POST[$p];
}

foreach ($prop_val as $k => $v) {
  $stmt = $con->prepare("UPDATE konfiguracja SET prop_value = ? WHERE prop_id = ?");
  $stmt->bind_param("si", $v, $k);
  $stmt->execute();
  $stmt->close();
}

$stmt = $con->prepare("SELECT prop_id, prop_name, prop_value FROM konfiguracja");
$stmt->execute();
$props = $stmt->get_result()->fetch_all(1);
$stmt->close();

$out = "<?php \$config=[";
foreach ($props as $p) {
  $k = addslashes($p["prop_name"]);
  $v = addslashes($p["prop_value"]);
  $out .= PHP_EOL . "\"$k\"=>\"$v\",";
}
$out .= PHP_EOL . "];";

file_put_contents("builds/config.php", $out);

if (strpos($_SERVER['HTTP_REFERER'], "/admin/konfiguracja") !== false) {
  header("Location: " . $_SERVER['HTTP_REFERER']);
} else {
  header("Location: /admin/konfiguracja/");
}
die;
