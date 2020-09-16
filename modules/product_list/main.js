/* js[global] */

function setProductListSwiperDimensions(node) {
  var rect = node.getBoundingClientRect();

  var w = rect.width;
  var slidesPerView = 2.3;
  if (w > 1600) {
    slidesPerView = 5;
  } else if (w > 1200) {
    slidesPerView = 4;
  } else if (w > 800) {
    slidesPerView = 3.2;
  }

  var swiper = node.swiper;
  swiper.params.slidesPerView = slidesPerView;
  swiper.update();
}

var productListCounter = 0;
function setProductListGridDimensions(node) {
  if (!node) {
    return;
  }
  var product_list_id = "";

  if (node.hasAttribute("data-product-list-id")) {
    product_list_id = node.getAttribute("data-product-list-id");
  } else {
    productListCounter++;
    product_list_id = `product_list_${productListCounter}`;
    node.setAttribute("data-product-list-id", product_list_id);
    node.classList.add(product_list_id);
    document.body.insertAdjacentHTML(
      "beforeend",
      `<style class='${product_list_id}'></style>`
    );
  }

  var rect = node.getBoundingClientRect();

  var w = rect.width;
  var slidesPerView = 1;
  if (w > 1200) {
    slidesPerView = 4;
  } else if (w > 950) {
    slidesPerView = 3;
  } else if (w > 600) {
    slidesPerView = 2;
  }

  var styleNode = $(`style.${product_list_id}`);
  styleNode.innerHTML = `
    .${product_list_id} .product-block-wapper {
      width: ${Math.floor((100 / slidesPerView) * 1000) / 1000}%;
    }
  `;
}

window.addEventListener("swiper-created", (event) => {
  setProductListSwiperDimensions(event.detail.node);
  setCustomHeights();
});

window.addEventListener("resize", (event) => {
  $$(".product_list_module.slider").forEach((e) => {
    setProductListSwiperDimensions(e.find(".swiper-container"));
  });
  $$(".product_list_module.grid").forEach((e) => {
    setProductListGridDimensions(e);
  });
  setCustomHeights();
});

window.addEventListener("DOMContentLoaded", () => {
  $$(".product_list_module.grid").forEach((e) => {
    setProductListGridDimensions(e);
  });
});
