<?php //route[admin/zamowienia]
?>

<?php startSection("head");

$options = "";
foreach ($status_list as $status) {
  $options .= "<option value='" . $status['id'] . "'>" . $status['title'] . "</option>";
}
?>

<title>Zamówienia</title>

<style>
  td.switchControls:not(:hover)>*:last-child {
    display: none;
  }

  td.switchControls {
    position: relative;
    text-align: center;
  }

  td.switchControls>*:last-child {
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
          ${renderStatus(r.status_id)}
          <select data-value="${r.status_id}" onchange="changeZamowienieStatus('${r.link}',this.value, { can_undo: true })">
            <?= $options ?>
          </select>
        `;
      }
    }

    createDatatable({
      name: tableName,
      url: "/admin/search_zamowienia",
      lang: {
        subject: "zamówień",
      },
      bulk_edit: true,
      width: 1400,
      definition: zamowienia_table_definition,
      controlsRight: `
        <div class='float-icon'>
          <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
          <i class="fas fa-search"></i>
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
    });
  });

  function selectionChange() {
    $(".bulkOptions").style.display = $("[data-link]:checked") ? "block" : "none";
  }

  async function bulkStatusUpdate(status_id) {
    var replaceList = [];
    $$("[data-link]:checked").forEach(e => {
      replaceList.push(e.getAttribute("data-link"));
    });
    if (replaceList.length == 0) return;

    if (!confirm("Czy chcesz zmienić wszystkie statusy?")) return;

    loader.show();

    for (i = 0; i < replaceList.length; i++) {
      await changeZamowienieStatus(replaceList[i], status_id, {
        bulk: true
      });
    }

    mytable.search(() => {
      loader.hide();
    });
  }

  function changeZamowienieStatus(zamowienie_link, new_status_id, options = {}) {
    // TODO: maybe it should be a bulk request instead
    return new Promise(resolve => {
      xhr({
        url: `/admin/zmien_status/${zamowienie_link}/${new_status_id}`,
        success: (res) => {
          if (nonull(options.bulk, false)) {
            resolve('resolved');
          } else {
            mytable.search(() => {
              if (nonull(options.can_undo, false)) {
                var was_status_id = res.zamowienie_data.status_id;
                new_status_id = res.new_status_id; // just in case someone else edited
                zamowienie_link = res.zamowienie_data.link;
                var zamowienie_id = res.zamowienie_data.zamowienie_id;

                var was_status_title = nonull(status_list.find(e => e.id == was_status_id), {
                  title: ""
                }).title;
                var now_status_title = nonull(status_list.find(e => e.id == new_status_id), {
                  title: ""
                }).title;

                showNotification(`
                <div style='text-align:center'>
                  <div class='header'>Zmieniono statusu</div>
                  Zamówienie #${zamowienie_id}
                  <br>
                  ${was_status_title} <i class="fas fa-angle-double-right"></i> ${now_status_title}
                  <br>
                  <span class='timer'></span>
                  <button class='btn subtle' onclick="changeZamowienieStatus('${zamowienie_link}', ${was_status_id});dismissParentNotification(this);">Cofnij <i class="fas fa-undo-alt"></i></button>
                </div>
              `, {
                  duration: 5000,
                });
              }

              resolve('resolved');
            });
          }
        }
      });
    });
  }
</script>

<?php startSection("content"); ?>

<h1>Zamówienia</h1>

<div class="mytable"></div>

<div class="bulkOptions" style="text-align:center;margin: 40px 0;display:none">
  Zmień status dla zaznaczonych zamówień
  <select onchange="bulkStatusUpdate(this.value);this.value=''">
    <option value="">- STATUS -</option>
    <?= $options ?>
  </select>
</div>

<?php include "admin/default_page.php"; ?>