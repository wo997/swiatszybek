<?php //route[{ADMIN}/czat]

?>

<?php Templates::startSection("head"); ?>

<script>
    const admin_img = <?= json_encode(FAVICON_PATH_LOCAL) ?>;
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
    <div class="chat_messages flex_stretch">
        <div class="scroll_panel scroll_shadow">
            <hr />
            <div class="messages_wrapper"></div>
        </div>
        <div class="chatter_is_typing"></div>
        <button class="btn success small new_messages_btn">
            Nowe wiadomości (<span class="new_messages_count"></span>) <i class="fas fa-angle-double-down"></i>
        </button>
    </div>
    <div class="chat_footer">
        <textarea class="field message_input focus_inside spiky" placeholder="Napisz wiadomość..."></textarea>
        <button class="btn primary spiky send_message_btn spinner_wrapper">
            <i class="fas fa-paper-plane"></i>
            <div class="spinner overlay white"></div>
        </button>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>