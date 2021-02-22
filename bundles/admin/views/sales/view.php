<?php //route[{ADMIN}statystyki] 
?>

<?php startSection("head_content"); ?>

<title>Statystyki</title>
<script src="/src/chart.min.js?v=1"></script>

<?php startSection("body_content"); ?>

<h1>Statystyki</h1>

<div>
    <div style="text-align:center;padding: 5px;display: flex;justify-content: center;align-items: center;">
        <button onclick="changeDate(-1)" class="timeBtn"><i class="fa fa-chevron-left"></i></button>
        <div class="datarangepicker_inputs">
            <input class="field inline daterangepicker_start" data-orientation="right bottom" type="text" data-type="date" data-format="dmy" data-param="dateFrom" value="<?= date("d-m-Y", time() - 60 * 60 * 24 * 6) ?>">
            <span> - </span>
            <input class="field inline daterangepicker_end" type="text" data-type="date" data-format="dmy" data-param="dateTo" value="<?= date("d-m-Y", time()) ?>">
        </div>
        <button onclick="changeDate(1)" class="timeBtn"><i class="fa fa-chevron-right"></i></button>
    </div>

    <div style="position:relative">
        <div id="summary" style="text-align:center;top:20px;position:absolute;z-index:19;width:100%;font-size:17px"></div>
        <div id="chart" style="width: 100%; height: 500px;"></div>
    </div>
    <table class="variants datatable" style="margin: 0 auto;max-width:1300px"></table>
</div>

<?php include "bundles/admin/templates/default.php"; ?>