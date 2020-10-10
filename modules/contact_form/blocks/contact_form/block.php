<?php //module_block[contact_form]

// TODO: main page should minify everything literally
useJS("/$module_block_dir/scripts.js");
useCSS("/$module_block_dir/styles.css");

$company_data = getSetting("general", "company", [], "");

?>
<div class='lazy'>
    <div class='contact-info'>
        <div>
            <b><?= $company_data['company_name'] ?></b><br><br>
            <?= $company_data['street_name'] ?> <?= $company_data['street_number'] ?><br>
            <?= $company_data['postal_code'] ?> <?= $company_data['city'] ?><br><br>
            Biuro czynne:<br>
            <?= $company_data['opening_hours'] ?><br><br>
            <a href='mailto:<?= $company_data['main_email'] ?>'><i class='fa fa-envelope' style='margin-right:5px;'></i><?= $company_data['main_email'] ?></a><br>
            <a href='tel:<?= $company_data['main_phone'] ?>'><i class='fa fa-phone' style='margin-right:5px;'></i><?= $company_data['main_phone'] ?></a>
        </div>
        <div>
            <iframe src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.2636336885503!2d20.905582677315724!3d52.23998412001319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x471ecb16c2ce5633%3A0x4cf6063af810a380!2sSolectric%20GmbH%20Polska!5e0!3m2!1spl!2spl!4v1581018622179!5m2!1spl!2spl' width='500' height='250' frameborder='0' style='border:0;width:100%;height:250px' allowfullscreen=''></iframe>
        </div>
    </div>

    <p style='color: white; background: #1b1; border-radius: 3px; padding: 3px 10px;text-align:center;max-width:300px;margin:20px auto -60px'>Wiadomość została wysłana <i class='fa fa-check'></i></p>

    <form class='contact-form' onsubmit='sendContact(this); return false;'>
        <div style='text-align:center; margin-top: 20px'>
            <div style='font-weight:bold; font-size: 28px; margin: 15px 0 30px;'>Napisz do nas</div>
        </div>
        <div class='uzupelnij' style='color:red;display:none;margin: 0 8px;'>Uzupełnij wszystkie pola</div>
        <div class='mobileRow'>
            <label>
                <span class='field-title'>Imię i nazwisko</span>
                <input class='field' type='text' name='name' placeholder=' '>
            </label>
            <label>
                <span class='field-title'>Adres e-mail</span>
                <input class='field' type='text' name='email' placeholder=' ' value='<?= $app["user"]["id"] ? $app["user"]["email"] : ""; ?>'>
            </label>
        </div>
        <label>
            <span class='field-title'>Temat</span>
            <input class='field' type='text' name='subject' placeholder=' '>
        </label>
        <label style='margin-top: 16px'>
            <span class='field-title'>Treść wiadomości</span>
            <textarea class='field' name='message' placeholder=' '></textarea>
        </label>
        <div style='margin: 8px'>
            <button type='submit' class='btn primary medium fill'>Wyślij <i class='fas fa-paper-plane'></i></button>
        </div>
    </form>
</div>