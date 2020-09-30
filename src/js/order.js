/* js[global] */

function _setBasketData(res, options = {}) {
  window.was_basket_data = nonull(window.basket_data, {
    basket: [],
  });
  if (res.basket) {
    window.basket_data = res;
  } else {
    return;
  }

  res.options = options;
  res.changes = {
    added: [],
    removed: [],
    quantity: [],
  };

  for (let item of window.basket_data.basket) {
    if (
      !window.was_basket_data.basket.find((e) => {
        return e.variant_id === item.variant_id;
      })
    ) {
      res.changes.added.push(item.variant_id);
    } else if (
      !window.was_basket_data.basket.find((e) => {
        return e.quantity === item.quantity;
      })
    ) {
      res.changes.quantity.push(item.variant_id);
    }
  }

  for (let item of window.was_basket_data.basket) {
    if (
      !window.basket_data.basket.find((e) => {
        return e.variant_id === item.variant_id;
      })
    ) {
      res.changes.removed.push(item.variant_id);
    }
  }

  var event = new CustomEvent("basket-change", {
    detail: {
      res: res,
    },
  });
  window.dispatchEvent(event);
}

function addVariantToBasket(variant_id, diff, options = {}) {
  if (typeof variant_id === "object") {
    variant_id = $(variant_id)
      .findParentByAttribute("data-variant_id")
      .getAttribute("data-variant_id");

    if (!variant_id) {
      return;
    }
  }

  if (diff > 0) url = "/basket/add/" + variant_id + "/" + diff;
  else url = "/basket/remove/" + variant_id + "/" + -diff;

  xhr({
    url: url,
    success: (res) => {
      _setBasketData(res, options);
    },
  });
}

window.addEventListener("basket-change", (event) => {
  var res = event.detail.res;

  if (res.options && res.options.show_modal) {
    var variant = basket_data.basket.find((v) => {
      return v.variant_id == res.variant_id;
    });

    var modal_name = "variantAdded";

    $(`#${modal_name} .variant_image`).setValue(variant.zdjecie);
    $(`#${modal_name} .variant_name`).setContent(
      variant.title + " " + variant.name
    );
    $(`#${modal_name} .variant_qty`).setContent(variant.quantity + " szt.");
    $(`#${modal_name} .variant_price`).setContent(variant.real_price + " zł");

    showModal(modal_name);
  }
});

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
