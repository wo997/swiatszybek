<?php //route[{ADMIN}/pulpit] 
?>

<?php startSection("head_content"); ?>

<title>Pulpit</title>

<script>
    <?= preloadOrderStatuses() ?>
</script>

<?php startSection("body_content"); ?>

<canvas id="myChart"></canvas>


<?php include "bundles/admin/templates/default.php"; ?>