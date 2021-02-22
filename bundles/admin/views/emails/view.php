<?php //route[{ADMIN}maile]
?>

<?php startSection("head_content"); ?>

<script>
    const company_data = <?= json_encode($app["company_data"]) ?>;
    const maile = <?= json_encode(getSetting("general", "emails", [])); ?>
</script>

<title>Maile</title>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Maile
    </div>
    <div>
        <button onclick="saveMaile()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("body_content"); ?>

<div id="maileForm" class="desktopRow spaceColumns" data-form>
    <div>
        <div class="form-header">Zamówienia</div>

        <!--<div class="label">E-maile dla nowych / zmiany statusów zamówień</div>
        <input type="text" class="field" name="orders_email" data-validate="email|optional" placeholder="<?= $main_email ?>">-->

        <span class='label'>
            E-mail(e) do zamówień
            <span class='add_buttons'></span>
        </span>
        <div name="order_emails" class="slim no-order" data-validate="|count:3-"></div>

        <div class="form-space"></div>

        <button class='add_main_to_orders btn secondary fill' onclick='simple_lists[order_emails_list_id].insertRow({email:"<?= $app["company_data"]["main_email"] ?>"})'>
            Dodaj <?= $app["company_data"]["main_email"] ?>
        </button>

        <span class='label'>
            E-mail(e) do raportów dziennych (sprzedaży)
            <span class='add_buttons'></span>
        </span>
        <div name="daily_report_emails" class="slim no-order" data-validate="|count:3-"></div>

        <div class="form-space"></div>

        <button class='add_main_to_daily_report btn secondary fill' onclick='simple_lists[daily_report_emails_list_id].insertRow({email:"<?= $app["company_data"]["main_email"] ?>"})'>
            Dodaj <?= $app["company_data"]["main_email"] ?>
        </button>

    </div>

    <div>
    </div>
</div>

<?php include "bundles/admin/templates/default.php"; ?>