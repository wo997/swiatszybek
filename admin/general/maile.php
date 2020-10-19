<?php //route[{ADMIN}maile]
?>

<?php startSection("head"); ?>

<title>Maile</title>

<style>

</style>

<script>
    const company_data = <?= json_encode($app["company_data"]) ?>;
    const main_email = nonull(company_data["main_email"], "").trim();

    domload(() => {
        createSimpleList({
            name: "order_emails",
            fields: {
                email: {}
            },
            render: (data) => {
                return `
                    <input type='text' class='field warn-outline' style='flex-grow:1' data-list-param="email" data-validate="email">
                `;
            },
            default_row: {
                email: ""
            },
            title: `E-mail(e) do zamówień`,
            onChange: (values, list) => {
                var add_main_email_btn = $(".add_main_to_orders");
                if (add_main_email_btn) {
                    var has_main_email = !!values.find(e => e.values.email.trim() == main_email);
                    add_main_email_btn.classList.toggle("hidden", has_main_email || !main_email);
                }

                setTimeout(() => {
                    registerForm($(`#maileForm`));
                });
            }
        });

        createSimpleList({
            name: "daily_report_emails",
            fields: {
                email: {}
            },
            render: (data) => {
                return `
                    <input type='text' class='field warn-outline' style='flex-grow:1' data-list-param="email" data-validate="email">
                `;
            },
            default_row: {
                email: ""
            },
            title: `E-mail(e) do raportów dziennych (sprzedaży)`,
            onChange: (values, list) => {
                var add_main_email_btn = $(".add_main_to_daily_report");
                if (add_main_email_btn) {
                    var has_main_email = !!values.find(e => e.values.email.trim() == main_email);
                    add_main_email_btn.classList.toggle("hidden", has_main_email || !main_email);
                }

                setTimeout(() => {
                    registerForm($(`#maileForm`));
                });
            }

        });

        setFormData(
            <?= json_encode(
                getSetting("general", "emails", [])
            ); ?>, `#maileForm`);
    });

    function saveMaile() {
        var form = $(`#maileForm`);

        if (!validateForm(form)) {
            return;
        }

        var params = {
            emails: getFormData(form),
        };

        xhr({
            url: STATIC_URLS["ADMIN"] + "save_emails",
            params: params,
            success: () => {
                setFormInitialState(form);
            }
        });
    }
</script>

<?php startSection("header"); ?>

<div class="custom-toolbar">
    <div class="title">
        Maile
    </div>
    <div>
        <button onclick="saveMaile()" class="btn primary">Zapisz <i class="fas fa-save"></i></button>
    </div>
</div>

<?php startSection("content"); ?>

<div id="maileForm" class="desktopRow spaceColumns" data-form>
    <div>
        <div class="form-header">Zamówienia</div>

        <!--<div class="field-title">E-maile dla nowych / zmiany statusów zamówień</div>
        <input type="text" class="field" name="orders_email" data-validate="email|optional" placeholder="<?= $main_email ?>">-->

        <div name="order_emails" class="slim no-order" data-validate="|count:3-"></div>

        <div class="form-space"></div>

        <button class='add_main_to_orders btn secondary fill' onclick='order_emails.insertRow({email:"<?= $app["company_data"]["main_email"] ?>"})'>
            Dodaj <?= $app["company_data"]["main_email"] ?>
        </button>

        <div name="daily_report_emails" class="slim no-order" data-validate="|count:3-"></div>

        <div class="form-space"></div>

        <button class='add_main_to_daily_report btn secondary fill' onclick='daily_report_emails.insertRow({email:"<?= $app["company_data"]["main_email"] ?>"})'>
            Dodaj <?= $app["company_data"]["main_email"] ?>
        </button>

    </div>

    <div>
    </div>
</div>

<?php include "admin/default_page.php"; ?>