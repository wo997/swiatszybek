<?php //route[{ADMIN}/pulpit] 
?>

<?php startSection("head_content"); ?>

<title>Pulpit</title>

<script>
    <?= preloadOrderStatuses() ?>
</script>

<?php startSection("body_content"); ?>

<div style="max-width: 1000px;margin: auto">
    <div class="label big">Statysyki sprzedaży</div>
    <div class="radio_group boxes pretty_blue hide_checks semi_bold inline_flex glue_children choose_period">
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
                <input type="text" class="field from inline" data-validate="" />
                <span class="field_desc">
                    <b>do</b>
                </span>
                <input type="text" class="field to inline" data-orientation="right" data-validate="" />
            </div>
        </div>
    </div>

    <canvas id="myChart" class="space_top"></canvas>
</div>


<?php include "bundles/admin/templates/default.php"; ?>