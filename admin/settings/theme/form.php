<div class="field-title">SSL</div>
<input class="field" type="text" name=ssl" value="0">

<div name="admin_emails" class="slim"></div>

<div class="field-title">Domena strony</div>
<input class="field" type="text" name="domain" value="www.dev.padmate.pl">

<div class="field-title">Tryb debugowania</div>
<input class="field" type="text" name="debug_mode">

<script>
    document.addEventListener("DOMContentLoaded", () => {
        createSimpleList({
            name: "admin_emails",
            fields: {
                email: {}
            },
            render: (data) => {
                return `
            <input class="field" type="text" data-list-param="email" data-validate="email">
          `;
            },
            default_row: {
                email: ""
            },
            title: "E-maile adminów",
        });
    });
</script>