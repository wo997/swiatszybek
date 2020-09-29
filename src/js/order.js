/* js[global] */

function addVariantToBasket(variant_id, diff, options = {}) {
  if (diff > 0) url = "/basket/add/" + variant_id + "/" + diff;
  else url = "/basket/remove/" + variant_id + "/" + -diff;

  xhr({
    url: url,
    success: (res) => {
      window.was_basket_data = window.basket_data;
      window.basket_data = res;

      for (let item of window.basket_data.basket) {
        if (
          !window.was_basket_data.basket.find((e) => {
            return e.variant_id === item.variant_id;
          })
        ) {
          console.log(item.variant_id, "NEW");
        } else if (
          !window.was_basket_data.basket.find((e) => {
            return e.quantity === item.quantity;
          })
        ) {
          console.log(item.variant_id, "QUANTITY");
        }
      }

      for (let item of window.was_basket_data.basket) {
        if (
          !window.basket_data.basket.find((e) => {
            return e.variant_id === item.variant_id;
          })
        ) {
          console.log(item.variant_id, "REMOVED");
        }
      }

      res.variant_id = variant_id;
      res.diff = diff;
      res.options = options;
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

  if (res.options && res.options.show_modal) {
    var variant = basket_data.basket.find((v) => {
      return v.variant_id == res.variant_id;
    });
    console.log(res, variant);
    showModal("variantAdded");
  }
});

function basketReady() {
  var event = new CustomEvent("basket-change", {
    detail: {
      res: window.basket_data,
    },
  });
  window.dispatchEvent(event);
}

window.addEventListener("basket-change", (event) => {
  var res = event.detail.res;

  var bm = $("#basketMenu .scroll-panel");
  if (bm) {
    setContentAndMaintainHeight(bm, res.basket_content_html);
  } else {
    var bc = $(".nav_basket_content");
    if (bc) {
      setContentAndMaintainHeight(bc, res.basket_content_html);
    }
  }

  $$(".basket_item_count").forEach((e) => {
    e.setContent(res.item_count);
  });

  $$(".gotobuy").forEach((e) => {
    toggleDisabled(e, res.item_count === 0);
  });

  $$(".total_basket_cost").forEach((e) => {
    e.setContent(basket_data.total_basket_cost);
  });

  setTimeout(() => {
    lazyLoadImages();
    tooltipResizeCallback();
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
