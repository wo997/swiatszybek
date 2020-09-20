/* js[global] */

function addItemtoBasket(variant_id, diff) {
  if (diff > 0) url = "/basket/add/" + variant_id + "/" + diff;
  else url = "/basket/remove/" + variant_id + "/" + -diff;

  xhr({
    url: url,
    success: (res) => {
      res.variant_id = variant_id;
      res.diff = diff;
      var event = new CustomEvent("basket-change", {
        detail: {
          res: res,
        },
      });
      window.dispatchEvent(event);
    },
  });
}

window.addEventListener("basket-change", (event) => {
  var res = event.detail.res;

  window.basket_data = res;

  var bm = $("#basketMenu .scroll-panel");
  if (bm) {
    bm.setContent(res.basket_content_html);
  } else {
    var bc = $(".nav_basket_content");
    if (bc) {
      setContent(bc, res.basket_content_html);
    }
  }

  $$(".basket_item_count").forEach((e) => {
    e.innerHTML = res.item_count;
  });

  $$(".gotobuy").forEach((e) => {
    toggleDisabled(e, res.item_count === 0);
  });

  $$(".total_basket_cost").forEach((e) => {
    e.innerHTML = basket_data.total_basket_cost;
  });

  setTimeout(() => {
    lazyLoadImages();
  });
});

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
