<?php //route[{ADMIN}/pulpit] 
?>

<?php Templates::startSection("head"); ?>

<title>Pulpit</title>

<?php Templates::startSection("admin_page_body"); ?>

<div style="max-width: 1000px;margin: auto">
    <div class="label big">Statystyki sprzedaży</div>
    <div class="pretty_radio glue_children semi_bold choose_period">
        <div class="checkbox_area">
            <p-checkbox data-value="today"></p-checkbox>
            <span>Dzisiaj</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="yesterday"></p-checkbox>
            <span>Wczoraj</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="this_week"></p-checkbox>
            <span>Ten tydzień</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="last_7_days"></p-checkbox>
            <span>Ostatnie 7 dni</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="last_30_days"></p-checkbox>
            <span>Ostatnie 30 dni</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="any_period"></p-checkbox>
            <span>Dowolny okres</span>
        </div>
    </div>

    <div class="case_any_period expand_y hidden animate_hidden">
        <div>
            <div class="label">Wybierz okres</div>
            <div class="input_wrapper glue_children default_daterangepicker">
                <input type="text" class="field from inline date" data-validate="" />
                <span class="field_desc">do</span>
                <input type="text" class="field to inline date" data-validate="" />
            </div>
        </div>
    </div>

    <canvas id="myChart" class="mtf"></canvas>

    <div class="global_root">
        <div class="chat_container">
            <div class="chat_header">
                <div class="chatter">
                    <?= getShopName() ?>
                </div>
                <button class="btn transparent close_btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="scroll_panel scroll_shadow chat_messages">
                <div class="messages_wrapper">
                    <?php
                    $user = User::getCurrent();
                    $user_id = $user->getId();
                    $messages = DB::fetchArr("SELECT chat_message_id, sender_id, receiver_id, message, sent_at FROM chat_message WHERE client_id = ?", [$user_id]);
                    var_dump($messages);
                    ?>
                    <div class="message ours">
                        <div class="message_content">nasze - asasfasfd asd</div>
                        <img data-src="/uploads/-/2021-06-23-21-45_860x900.png" class="wo997_img chatter_img">
                    </div>

                    <div class="message others">
                        <img src="<?= FAVICON_PATH_LOCAL_TN ?>" class="wo997_img chatter_img">
                        <div class="message_content">ktoś - asfasfd asf asf asfdafsdafasf asfasfd asd</div>
                    </div>
                    <div class="message others">
                        <img data-src="/uploads/-/2021-06-23-21-45_860x900.png" class="wo997_img chatter_img">
                        <div class="message_content">ktoś - asfasfd asf asf asfdafsdafasf asfasfd asd</div>
                    </div>
                    <div class="message others">
                        <img data-src="/uploads/-/2021-06-23-21-45_860x900.png" class="wo997_img chatter_img">
                        <div class="message_content">ktoś - asfasfd asf asf asfdafsdafasf asfasfd asd</div>
                    </div>
                    <div class="message others">
                        <img data-src="/uploads/-/2021-06-23-21-45_860x900.png" class="wo997_img chatter_img">
                        <div class="message_content">ktoś - asfasfd asf asf asfdafsdafasf asfasfd asd</div>
                    </div>
                    <div class="message others">
                        <img data-src="/uploads/-/2021-06-23-21-45_860x900.png" class="wo997_img chatter_img">
                        <div class="message_content">ktoś - asfasfd asf asf asfdafsdafasf asfasfd asd</div>
                    </div>
                    <div class="message others">
                        <img data-src="/uploads/-/2021-06-23-21-45_860x900.png" class="wo997_img chatter_img">
                        <div class="message_content">ktoś - asfasfd asf asf asfdafsdafasf asfasfd asd</div>
                    </div>
                </div>
            </div>
            <div class="chat_footer">
                <textarea class="field message_input focus_inside spiky" placeholder="Napisz wiadomość..."></textarea>
                <button class="btn primary spiky send_message_btn">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>

        <div class="open_chat_btn" data-tooltip="Otwórz czat" data-tooltip_position="left">
            <i class="fas fa-envelope"></i>
        </div>
    </div>
</div>


<?php include "bundles/admin/templates/default.php"; ?>