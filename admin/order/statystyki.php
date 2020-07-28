<?php //->[admin/statystyki] 
?>

<?php startSection("head"); ?>

<title>Statystyki</title>
<script src="/src/chart.min.js?v=1"></script>

<script>
    google.charts.load('current', {
        'packages': ['line', 'corechart'],
        'language': 'pl'
    });

    var chart;
    google.charts.setOnLoadCallback(() => {
        chart = new google.visualization.LineChart(document.getElementById('chart'));
        search();
    });

    function formatDateTime(d) {
        var month = '' + (d.getMonth() + 1);
        var day = '' + d.getDate();
        var year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('-');
    }

    function drawChart(a) {
        var data = new google.visualization.DataTable();
        data.addColumn('date', 'Dzień');
        data.addColumn('number', "Nowe zamówienia");
        data.addColumn('number', "Wpłacono");

        var dateFrom = new Date(document.getElementById("dateFrom").value);
        var dateTo = new Date(document.getElementById("dateTo").value);

        var chartData = [];

        var zamowieniaDate = a.zamowienia.map(e => {
            return e.zlozono;
        });
        var oplaconoDate = a.oplacono.map(e => {
            return e.oplacono;
        });

        var offset = 0;
        if (offset < 10) offset = "0" + offset;

        var zamowien = 0;
        var suma = 0;
        var ticks = [];
        while (dateFrom <= dateTo) {

            dateString = formatDateTime(dateFrom);

            var date = new Date(dateString);

            var row_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
            ticks.push(date);

            var zI = zamowieniaDate.indexOf(dateString);
            var oI = oplaconoDate.indexOf(dateString);

            var kwota = oI != -1 ? +a.oplacono[oI].kwota : 0;
            var ile = zI != -1 ? +a.zamowienia[zI].zamowienia : 0;
            suma += kwota;
            zamowien += ile;


            chartData.push([
                row_date,
                ile,
                kwota
            ]);

            dateFrom.setDate(dateFrom.getDate() + 1);
        }

        document.getElementById("summary").innerHTML = "Nowe zamówienia: " + zamowien + ", Wpłacono: " + suma + " zł";

        data.addRows(chartData);

        var options = {
            legend: {
                position: 'bottom'
            },
            series: {
                0: {
                    targetAxisIndex: 0
                },
                1: {
                    targetAxisIndex: 1
                }
            },
            hAxis: {
                ticks: ticks,
                format: 'dd MMM'
            },
            vAxis: {
                viewWindow: {
                    min: 0
                }
            }

        };

        chart.draw(data, options);
    }

    var awaitId;

    function awaitSearch() {
        clearTimeout(awaitId);
        awaitId = setTimeout(function() {
            currPage = 0;
            search()
        }, 400);
    }

    var currPage = 0;

    function page(i) {
        currPage = i;
        search();
    }

    function keyPress(obj, e) {
        if (obj, e.keyCode == 13) {
            var p = parseInt(obj.value);
            if (p >= 1 && p <= pages)
                page(p - 1);
        }
    }

    var currPage = 0;
    var pages = 1;
    var requestOn = false;

    function search(data = {}) {
        if (requestOn) return;
        requestOn = true;

        orderRequest = new XMLHttpRequest();
        orderRequest.open("POST", "/admin/search_statystyki", true);
        orderRequest.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        orderRequest.onreadystatechange = function() {
            if (orderRequest.readyState == 4) {

                var wrong = false;
                if (orderRequest.status == 200) {
                    var res = JSON.parse(orderRequest.responseText);
                    drawChart(res);

                    var table_html = `<tr>
                                <th style="width:50%">Nazwa</th>
                                <th>Ilość</th>
                                <th>Wartość</th>
                                <th>Nabyto za</th>
                                <th>Zysk</th>
                            </tr>`;
                    for (const variant of res.variants) {
                        table_html += `<tr>
                                <td>${variant.title}</td>
                                <td>${variant.all_quantity} szt.</td>
                                <td>${variant.all_total_price} zł</td>
                                <td>${variant.all_purchase_price} zł</td>
                                <td>${variant.all_total_price - variant.all_purchase_price} zł</td>
                            </tr>`;
                    }
                    setContent($(".variants"), table_html);
                } else wrong = true;
                if (wrong) {

                }
                requestOn = false;
            }
        }

        var dateFilterQuery = "";
        var dateFrom = document.getElementById("dateFrom");
        var dateTo = document.getElementById("dateTo");

        if (data.source) {
            var date1 = new Date(dateFrom.value);
            var date2 = new Date(dateTo.value);

            var diff = date2.getTime() + 1000 * 3600 * 24 - date1.getTime();

            var maxDiff = 1000 * 3600 * 24 * 60;
            if (diff > maxDiff) {
                if (data.source && data.source == dateFrom) {
                    date2.setTime(date1.getTime() + maxDiff);
                    dateTo.value = dateToString(date2);
                } else {
                    date1.setTime(date2.getTime() - maxDiff);
                    dateFrom.value = dateToString(date1);
                }
            }
        }


        if (dateFrom.value.length == 10)
            dateFilterQuery += "&dateFrom=" + dateFrom.value;
        if (dateTo.value.length == 10)
            dateFilterQuery += "&dateTo=" + dateTo.value;

        orderRequest.send("chart=1" + dateFilterQuery);
    }

    function changeDate(direction) {
        var dateFrom = document.getElementById("dateFrom");
        var dateTo = document.getElementById("dateTo");

        var date1 = new Date(dateFrom.value);
        var date2 = new Date(dateTo.value);

        var diff = date2.getTime() + 86400000 - date1.getTime();

        date1.setTime(date1.getTime() + diff * direction);
        date2.setTime(date2.getTime() + diff * direction);

        requestOn = true;
        dateFrom.value = date1.toISOString().substring(0, 10);
        dateTo.value = date2.toISOString().substring(0, 10);
        requestOn = false;
        search();
    }
</script>

<?php startSection("content"); ?>

<div>
    <div style="text-align:center;padding: 5px;display: flex;justify-content: center;align-items: center;">
        <button onclick="changeDate(-1)" class="timeBtn"><i class="fa fa-chevron-left"></i></button>
        <input type="text" class="datepicker center" id="dateFrom" onchange="search({source:this})" value="<?= date("Y-m-d", strtotime("-6 days")) ?>">
        <span style='margin:5px'> - </span><input type="text" class="datepicker center" id="dateTo" onchange="search({source:this})" value="<?= date("Y-m-d") ?>">
        <button onclick="changeDate(1)" class="timeBtn"><i class="fa fa-chevron-right"></i></button>
    </div>
    <div style="position:relative">
        <div id="summary" style="text-align:center;top:20px;position:absolute;z-index:19;width:100%;font-size:17px"></div>
        <div id="chart" style="width: 100%; height: 500px;"></div>
    </div>
    <table class="variants datatable" style="margin: 0 auto;max-width:1300px"></table>
</div>

<?php include "admin/default_page.php"; ?>