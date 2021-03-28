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
    <div class="radio_group boxes pretty_blue hide_checks semi_bold inline_flex glue_children">
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
            <p-checkbox data-value="last_week"></p-checkbox>
            <span>Poprzedni tydzień</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="this_month"></p-checkbox>
            <span>Ten miesiąc</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="last_month"></p-checkbox>
            <span>Poprzedni miesiąc</span>
        </div>
        <div class="checkbox_area">
            <p-checkbox data-value="any_period"></p-checkbox>
            <span>Dowolny przedział</span>
        </div>
    </div>

    <div class="label case_range input_wrapper glue_children default_daterangepicker">
        <input type="text" class="field more_than inline" data-validate="" />
        <span class="field_desc">
            <b>≤ data ≤</b>
        </span>
        <input type="text" class="field less_than inline" data-orientation="right" data-validate="" />
    </div>

    <canvas id="myChart" class="space_top"></canvas>
</div>


<?php include "bundles/admin/templates/default.php"; ?>