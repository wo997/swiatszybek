<?php //route[{ADMIN}zamowienia]
?>

<?php startSection("head_content");

$options = "";
foreach ($status_list as $status) {
    $options .= "<option value='" . $status['id'] . "'>" . $status['title'] . "</option>";
}
?>

<title>Zamówienia</title>


<?php startSection("body_content"); ?>

<h1>Zamówienia</h1>

<div class="mytable"></div>

<?php include "admin/page_template.php"; ?>