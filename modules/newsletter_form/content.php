<?php

include_once __DIR__ . "/helpers.php";

useJS($moduleDir . "/main.js");

$contact_email = User::getCurrent()->getId() ? User::getCurrent()->data["email"] : "";

$has_already = "";
if ($hasNewsletter) {
    if ($hasNewsletter["accepted"] == "1")
        $has_already = "<p style='text-align:center'>" . User::getCurrent()->data["email"] . " został już dodany do Newslettera</p>";
    else
        $has_already = "<p style='text-align:center;color:#c22'>Newsletter nie został aktywowany dla " . User::getCurrent()->data["email"] . "!<br>Sprawdź swoją skrzynkę pocztową</p>";
    $contact_email = "";
}

$module_content .= "
<div style='padding:0 10px'>
    $has_already
    <p style='color: white; background: #1b1; border-radius: 3px; padding: 3px 10px;text-align:center;max-width:450px;margin:50px auto -60px'>Wysłaliśmy zaproszenie na Twoją skrzynkę pocztową <i class='fa fa-check'></i></p>
    <form onsubmit='sendNews(this); return false;' style='padding:10px;box-sizing:border-box;transition: 0.5s;max-height:800px;overflow: hidden;width: 100%;max-width: 630px;background: white;margin:0 auto 25px;border: 1px solid #ddd;background: #fcfcfc;'>
        <div style='text-align:center; margin-top: 20px'>
            <h3 style='font-weight:normal;font-size: 28px; margin: 15px 0 0;'>Zapisz się do <b style='color:var(--primary-clr)'>Newslettera</b></h3>
        </div>
        <div class='mobileRow form-spacing'>
            <div style='width:100%'>
                <article style='padding: 22px 10px;'>
                Czy chcesz dostawać na bieżąco informacje na temat <b>promocji</b> i nowych modeli słuchawek?<div style='height:5px'></div>Zapisz się do <b>newslettera</b> już teraz!
                </article>
            </div>
            <div style='width:100%'>
                <div class='uzupelnij' style='color:red;display:none;margin: 0 0 -5px;font-size:13px'>Uzupełnij e-mail</div>
                <label>
                    <span class='label'>Adres e-mail</span>
                    <input type='text' name='email' class='field' placeholder=' ' value='$contact_email'>
                </label>
                <div style='margin: 8px 0'>
                    <button type='submit' class='btn primary fill' style='width: 100%;padding: 7px;'>Wyślij zaproszenie <i class='fa fa-paper-plane'></i></button>
                </div>
            </div>
        </div>
    </form>
</div>";
