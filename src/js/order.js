/* js[global] */

function addItemtoBasket(variant_id, diff, callback) {
  if (diff > 0) url = "/basket/add/" + variant_id + "/" + diff;
  else url = "/basket/remove/" + variant_id + "/" + -diff;

  xhr({
    url: url,
    success: (res) => {
      setContent($(".nav_basket_content"), res.basket_content_html);

      var bm = $("#basketMenu .scroll-panel");
      var sc = $("header .nav_basket_content .scrollableContent");
      if (bm && sc) {
        bm.empty();
        bm.appendChild(sc);
      }

      $$(".basket_item_count").forEach((e) => {
        e.innerHTML = res.item_count;
      });

      if (callback) {
        callback(res);
      }
    },
  });
}

// also order.php
function renderStatus(status_id) {
  var status = getRowById(status_list, status_id);
  if (!status) {
    return "";
  }
  return `<div class='rect status_rect' style='background:#${nonull(
    status.color
  )}'>${status.title}</div>`;
}
