function setProductListSwiperDimensions(node) {
  var rect = node.getBoundingClientRect();

  var w = rect.width;
  var slidesPerView = 2;
  if (w > 1500) {
    slidesPerView = 5;
  } else if (w > 1200) {
    slidesPerView = 4;
  } else if (w > 800) {
    slidesPerView = 3;
  }

  var swiper = node.swiper;
  swiper.params.slidesPerView = slidesPerView;
  swiper.update();
}

window.addEventListener("swiper-created", (event) => {
  setProductListSwiperDimensions(event.detail.node);
  setCustomHeights();
});

window.addEventListener("resize", (event) => {
  $$(".product_list_module.slider").forEach((e) => {
    setProductListSwiperDimensions(e.find(".swiper-container"));
  });
  setCustomHeights();
});
