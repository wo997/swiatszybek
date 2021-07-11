<?php //route[{ADMIN}/czat]

?>

<?php Templates::startSection("head"); ?>

<script>
    const company_info = <?= json_encode(getSetting(["general", "company"])); ?>
</script>

<title>Czat z klientem</title>

<?php Templates::startSection("header"); ?>

<div class="custom_toolbar">
    <span class="title breadcrumbs">
        <div class="crumb">
            Czat z klientem
        </div>
    </span>
</div>

<?php Templates::startSection("admin_page_body"); ?>

<div class="admin_chat_container">
    <div class="chat_clients">
        <div class="scroll_panel scroll_shadow">
            <div class="clients_wrapper"></div>
        </div>

    </div>
    <div class="chat_chat">

    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>