<?php //route[admin/zamowienia] 
?>

<?php startSection("head");

$options = "";
foreach ($statusList as $k => $status) {
  $options .= "<option value='$k'>{$status['title']}</option>";
}
?>

<title>Zamówienia</title>

<style>
  .switchControls:not(:hover)>*:last-child {
    display: none;
  }

  .switchControls {
    position: relative;
    text-align: center;
  }

  .switchControls>*:last-child {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    padding: 0.2em 0.5em;
    width: calc(100% - 30px);
  }
</style>

<script>
  document.addEventListener("DOMContentLoaded", function() {
    useTool("loader");

    var tableName = "mytable";

    var statusDefinition = zamowienia_table_definition.find(e => e.title == "Status");

    if (statusDefinition) {
      statusDefinition.className = "switchControls";
      statusDefinition.render = (r) => {
        return `
          ${renderStatus(r.status)}
          <select data-value="${r.status}" onchange="changeStatus('${r.link}',this.value)">
            <?= $options ?>
          </select>
        `;
      }
    }

    zamowienia_table_definition = [{
        title: "",
        width: "36px",
        render: (r) => {
          return `<label>
            <input type="checkbox" data-link="${r.link}" onchange="selectionChange()">
            <div class="checkbox"></div>
          </label>`;
        },
        escape: false
      },
      ...zamowienia_table_definition
    ];



    createDatatable({
      name: tableName,
      url: "/admin/search_zamowienia",
      lang: {
        subject: "zamówień",
      },
      width: 1300,
      definition: zamowienia_table_definition,
      controls: `
        <div class='float-icon'>
          <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
          <i class="fas fa-search"></i>
        </div>

        <select data-param="status" class="field inline">
          <option value=''>Wszystkie</option>
          <option value='otwarte'>Otwarte</option>
          <?= $options ?>
        </select>
        <label style="margin:6px 8px;user-select:none">
          <input type="checkbox" onchange="setFilter()" class="hasFilter">
          <div class="checkbox"></div>
          Filtruj wg daty
        </label>
        <div class="flexbar caseFilter hidden">
          <button onclick="changeDate(-1)" class="timeBtn"><i class="fa fa-chevron-left"></i></button>
          <div class="datarangepicker_inputs">
            <input class="field inline daterangepicker_start" type="text" data-type="date" data-format="dmy" data-param="dateFrom" value="<?= date("d-m-Y", time() - 60 * 60 * 24 * 6) ?>">
            <span> - </span>
            <input class="field inline daterangepicker_end" type="text" data-type="date" data-format="dmy" data-param="dateTo" value="<?= date("d-m-Y", time()) ?>">
          </div> 
          <button onclick="changeDate(1)" class="timeBtn"><i class="fa fa-chevron-right"></i></button>
        </div>
      `,
      onSearch: () => {
        selectionChange();
        setTimeout(() => {
          $$("select[data-value]").forEach(e => {
            e.value = e.getAttribute("data-value");
          })
        }, 0);
      },
      onCreate: () => {
        window[tableName].dateRangePicker = new DateRangePicker($('.mytable .datarangepicker_inputs'), {
          todayHighlight: true,
          todayBtn: true,
          clearBtn: true,
          maxView: 2,
          language: "pl",
          autohide: true,
        });
      }
    });
  });

  function selectionChange() {
    $(".bulkOptions").style.display = $("[data-link]:checked") ? "block" : "none";
  }

  async function bulkStatusUpdate(value) {
    var replaceList = [];
    $$("[data-link]:checked").forEach(e => {
      replaceList.push(e.getAttribute("data-link"));
    });
    if (replaceList.length == 0) return;

    if (!confirm("Czy chcesz zmienić wszystkie statusy?")) return;

    loader.show();

    for (i = 0; i < replaceList.length; i++) {
      await changeStatus(replaceList[i], value, false);
    }

    mytable.search(() => {
      loader.hide();
    });
  }

  function changeStatus(zamowienie_link, value, search = true) {
    return new Promise(resolve => {
      xhr({
        url: `/admin/zmien_status/${zamowienie_link}/${value}`,
        success: () => {
          if (search) {
            mytable.search(() => {
              resolve('resolved');
            });
          } else resolve('resolved');
        }
      });
    });
  }

  function setFilter() {
    // TODO: fix ugly animation when toggling filtering
    $(".mytable .caseFilter").classList.toggle("hidden", !$(".mytable .hasFilter").checked);
    mytable.search(() => {});
  }

  function changeDate(direction) {
    var dateFrom = $(`.mytable .daterangepicker_start`);
    var dateTo = $(`.mytable .daterangepicker_end`);

    var date1 = new Date(dateFrom.getValue());
    var date2 = new Date(dateTo.getValue());

    var diff = date2.getTime() + 1000 * 3600 * 24 - date1.getTime();

    date1.setTime(date1.getTime() + diff * direction);
    date2.setTime(date2.getTime() + diff * direction);

    var date1string = dateToString(date1, "dmy")
    var date2string = dateToString(date2, "dmy")

    var datePickers = mytable.dateRangePicker.datepickers;
    if (direction === -1) {
      datePickers[0].setDate(date1string)
      datePickers[1].setDate(date2string)
    } else {
      datePickers[1].setDate(date2string)
      datePickers[0].setDate(date1string)
    }

    mytable.search();
  }
</script>

<?php startSection("content"); ?>

<div class="mytable"></div>

<div class="bulkOptions" style="text-align:center;margin: 40px 0;display:none">
  Zmień status dla zaznaczonych zamówień
  <select onchange="bulkStatusUpdate(this.value);this.value=''">
    <option value="">- STATUS -</option>
    <?= $options ?>
  </select>
</div>

<?php include "admin/default_page.php"; ?>