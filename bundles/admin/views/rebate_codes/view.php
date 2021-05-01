<?php //route[{ADMIN}/kody-rabatowe] 
?>

<?php startSection("head_content"); ?>

<title>Kody rabatowe</title>

<script>
    <?php if (isset($_GET["dodaj"])) { ?>
        // domload(() => {
        //     setTimeout(() => {
        //         $(".edit_rebate_code").click();
        //     })
        // })
    <?php } ?>
</script>

<?php startSection("body_content"); ?>

<datatable-comp class="rebate_codes"></datatable-comp>

<?php include "bundles/admin/templates/default.php"; ?>