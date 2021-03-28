<?php //route[{ADMIN}/pulpit] 
?>

<?php startSection("head_content"); ?>

<title>Pulpit</title>

<script>
    <?= preloadOrderStatuses() ?>
</script>

<?php startSection("body_content"); ?>

<div style="max-width: 1000px">
    <canvas id="myChart"></canvas>
</div>


<?php include "bundles/admin/templates/default.php"; ?>