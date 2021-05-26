<?php //hook[register]

PiepCMSManager::registerModule([
    "name" => "contact_form",
    "render" => function ($params) {
        ob_start();
?>
    <form id="contactForm" class="mtfn">
        <div class="label">Imię i nazwisko</div>
        <input class="field pretty_errors" autocomplete="name" data-name="name" data-validate="">

        <div class="label">Adres e-mail</div>
        <input class="field pretty_errors" autocomplete="email" data-name="email" data-validate="string|email">

        <div class="label">Tytuł</div>
        <input class="field pretty_errors" data-name="subject" data-validate="">

        <div class="label">Wiadomość</div>
        <textarea class="field" style="height:100px" data-name="message" data-validate=""></textarea>

        <button class="btn primary submit_btn fill mt2" type="submit">Wyślij <i class="fas fa-paper-plane"></i></button>
    </form>
<?php

        return ob_get_clean();
    },
    "js_path" => BUILDS_PATH . "modules/contact_form.js",
    "css_path" => BUILDS_PATH . "modules/contact_form.css",
]);
