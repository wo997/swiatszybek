/* js[global] */

function addItemtoBasket(variant_id, diff, callback) {
  if (diff > 0) url = "/basket/add/" + variant_id + "/" + diff;
  else url = "/basket/remove/" + variant_id + "/" + -diff;

  xhr({
    url: url,
    success: (res) => {
      setContent($("#basketContent"), res.basket_content_html);

      $("#amount").innerHTML = res.item_count; // header basket

      if (callback) {
        callback(res);
      }
    },
  });
}

// also order.php
function renderStatus(status_id) {
  var status = getRowById(status_list, status_id);
  return `<div class='rect status_rect' style='background:#${status["color"]}'>${status["title"]}</div>`;
}
