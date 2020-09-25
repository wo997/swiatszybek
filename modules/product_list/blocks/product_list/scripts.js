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

window.addEventListener("products-swiper-created", (event) => {
  setProductListSwiperDimensions(event.detail.node);
  setCustomHeights();
  tooltipResizeCallback();
  preventProductImagesLongPress();
});

window.addEventListener("resize", (event) => {
  $$(".product_list_module.slider .swiper-container").forEach((e) => {
    setProductListSwiperDimensions(e);
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

var animateProduct = {};

window.addEventListener("mousemove", function (event) {
  currentlyFocusedProduct(event.target);
});

window.addEventListener("touchstart", function (event) {
  currentlyFocusedProduct(event.target);
});

window.addEventListener("DOMContentLoaded", function () {
  preventProductImagesLongPress();
});

function preventProductImagesLongPress() {
  if (!IS_MOBILE) return;
  $$(".product-image").forEach((e) => {
    preventLongPressMenu(e);
  });
}

/*

window.addEventListener("DOMContentLoaded", function () {
  if (!IS_MOBILE) return;
  mobileFocusProductFrame();
});

function mobileFocusProductFrame() {
  var closest = null;
  var distance = window.innerHeight * 0.3 * window.innerWidth * 0.3;
  document.querySelectorAll(".product-image").forEach((e) => {
    var p = e.getBoundingClientRect();
    var dx = p.x + p.width / 2 - window.innerWidth / 2;
    var dy = p.y + p.height / 2 - window.innerHeight / 2;
    var d = dx * dx + dy * dy;
    if (d < distance) {
      distance = d;
      closest = e;
    }
  });
  if (animateProduct.awaitTarget != closest) {
    animateProduct.delay = 3;
  }
  animateProduct.awaitTarget = closest;

  if (animateProduct.delay <= 0) {
    currentlyFocusedProduct(animateProduct.awaitTarget);
  } else {
    currentlyFocusedProduct(null);
    animateProduct.delay--;
  }

  setTimeout(mobileFocusProductFrame, 300);
}*/

function currentlyFocusedProduct(node) {
  var x = node.classList.contains("product-image") ? node : null;
  if (animateProduct.target != x) {
    if (animateProduct.target) {
      animateProduct.image.src = animateProduct.defaultImage;
      animateProduct.image.removeAttribute("data-src");
      animateProduct.image.style.transition = "";
      animateProduct.image.style.opacity = "1";
      animateProduct.target = null;

      window.clearTimeout(animateProduct.timeout);
    }
    if (x) {
      var g = x.getAttribute("data-gallery");
      if (!g) {
        return;
      }
      animateProduct.target = x;
      animateProduct.image = x;
      animateProduct.frames = JSON.parse(g).map((e) => e.values.src);

      animateProduct.defaultImage = animateProduct.image.src;
      animateProduct.frameId = 0;
      if (animateProduct.frames.length > 1) {
        nextProductImageSlide(x);
      }
    }
  }
}

function nextProductImageSlide(x) {
  if (animateProduct.target != x) return;

  animateProduct.frameId++;
  if (animateProduct.frameId >= animateProduct.frames.length)
    animateProduct.frameId = 0;
  animateProduct.image.style.transition = "opacity 0.2s";
  animateProduct.image.style.opacity = "0";
  var img_src = animateProduct.frames[animateProduct.frameId];
  animateProduct.image.setAttribute("data-src", img_src);
  animateProduct.image.awaitImageReplace = true;
  lazyLoadImages(false);

  setTimeout(() => {
    if (animateProduct.target != x) return;

    var awaiting_src = animateProduct.image.getAttribute("awaiting-src");
    if (awaiting_src) {
      animateProduct.image.setAttribute("src", awaiting_src);
    }
    setTimeout(() => {
      animateProduct.image.style.opacity = "1";
    }, 100);
  }, 200);

  animateProduct.timeout = setTimeout(() => {
    setTimeout(() => {
      nextProductImageSlide(x);
    }, waitingForImageLoad * 1000);
  }, 2000);
}
