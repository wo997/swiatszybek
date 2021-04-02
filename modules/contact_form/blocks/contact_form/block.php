<?php //module_block[contact_form]

// TODO: pages should minify everything literally
// useJS("/$module_block_dir/scripts.js");
// useCSS("/$module_block_dir/styles.css");

// $company_data = $app["company_data"];

?>

<?php if (!$company_data) : ?>
    <!-- <?php if (User::getCurrent()->priveleges["backend_access"]) : ?>
        <div class="missing-module-block-label">
            Blok formularza kontaktowego niedostepny!
            <br>
            Uzupełnij dane firmy w panelu administratora.
        </div>
    <?php endif; ?>
<?php else : ?>
    <div class='lazy'>
        <div class='contact-info'>
            <div>
                <b><?= $company_data['company_name'] ?></b><br><br>
                <?= $company_data['street_name'] ?> <?= $company_data['street_number'] ?><br>
                <?= $company_data['post_code'] ?> <?= $company_data['city'] ?><br><br>
                Biuro czynne:<br>
                <?= $company_data['opening_hours'] ?><br><br>
                <a href='mailto:<?= $company_data['main_email'] ?>'><i class='fa fa-envelope' style='margin-right:5px;'></i><?= $company_data['main_email'] ?></a><br>
                <a href='tel:<?= $company_data['main_phone'] ?>'><i class='fa fa-phone' style='margin-right:5px;'></i><?= $company_data['main_phone'] ?></a>
            </div>
            <div>
    </div>
    </div>

    <p style='color: white; background: #1b1; border-radius: 3px; padding: 3px 10px;text-align:center;max-width:300px;margin:20px auto -60px'>Wiadomość została wysłana <i class='fa fa-check'></i></p>

    <form class='contact-form' onsubmit='sendContact(this); return false;'>
        <div style='text-align:center; margin-top: 20px'>
            <div style='font-weight:bold; font-size: 28px; margin: 15px 0 30px;'>Napisz do nas</div>
        </div>
        <div class='uzupelnij' style='color:red;display:none;margin: 0 8px;'>Uzupełnij wszystkie pola</div>
        <div class='desktop_row'>
            <label>
                <span class='label'>Imię i nazwisko</span>
                <input class='field' type='text' name='name' placeholder=' '>
            </label>
            <label>
                <span class='label'>Adres e-mail</span>
                <input class='field' type='text' name='email' placeholder=' ' value='<?= User::getCurrent()->getId() ? User::getCurrent()->data["email"] : ""; ?>'>
            </label>
        </div>
        <label>
            <span class='label'>Temat</span>
            <input class='field' type='text' name='subject' placeholder=' '>
        </label>
        <label style='margin-top: 16px'>
            <span class='label'>Treść wiadomości</span>
            <textarea class='field' name='message' placeholder=' '></textarea>
        </label>
        <div style='margin: 8px'>
            <button type='submit' class='btn primary medium fill'>Wyślij <i class='fas fa-paper-plane'></i></button>
        </div>
    </form>
    </div> -->
<?php endif; ?>