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
	} else if (w > 850) {
		slidesPerView = 3;
	} else if (w > 500) {
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
	window.tooltip.resizeCallback();
	preventProductImagesLongPress();
});

window.addEventListener("resize", (event) => {
	$$(".product_list_module.slider .swiper-container").forEach((e) => {
		if (e.swiper) {
			setProductListSwiperDimensions(e);
		}
	});
	$$(".product_list_module.grid").forEach((e) => {
		setProductListGridDimensions(e);
	});
	setCustomHeights();
});

function productListLoaded() {
	if (window.innerWidth < 1000) {
		return;
	}
	$$(".product_list_module .product-row").forEach((e) => {
		// onclick='addVariantToBasket(${basket_item.variant_id},-1,{show_modal:true})'

		if (!e.find(".product-actions")) {
			e.insertAdjacentHTML(
				"beforeend",
				`<div class='product-actions'>
          <div class='btn-wrapper'>
            <img class='heart-icon below' src='/src/img/heart_icon.svg'>
            <img class='heart-icon over' src='/src/img/heart_icon_fill.svg'>
          </div>
          <div class='btn-wrapper' onclick='showOffersOntopBabbyohohohohohoh'>
            <img class='basket-icon below' src='/src/img/basket_icon.svg'>
            <img class='basket-icon over' src='/src/img/basket_icon_fill.svg'>
          </div>
        </div>
        `
			);
		}
	});
}

window.addEventListener("DOMContentLoaded", () => {
	$$(".product_list_module.grid").forEach((e) => {
		setProductListGridDimensions(e);
	});
	productListLoaded();
});

let animated_product_img = null;

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
	let product_img = null;

	if (node && node.classList && node.classList.contains("product-image")) {
		product_img = node;
	}

	if (animated_product_img != product_img) {
		const prev_img = animated_product_img;
		animated_product_img = product_img;

		if (prev_img) {
			const default_src = prev_img.getAttribute("data-default_src");
			if (prev_img.getAttribute("data-src") != default_src) {
				const duration = 150;

				prev_img.style.transition = `opacity ${duration}ms`;
				prev_img.style.opacity = "0";

				setTimeout(() => {
					prev_img.setAttribute("data-src", default_src);
					prev_img.classList.remove("wo997_img_loaded");
					prev_img.style.opacity = "1";
					lazyLoadImages();
				}, duration);
			} else {
				prev_img.style.opacity = "1";
			}

			if (prev_img.animation_timeout) {
				clearTimeout(prev_img.animation_timeout);
				prev_img.animation_timeout = null;
			}
			if (prev_img.sub_animation_timeout) {
				clearTimeout(prev_img.sub_animation_timeout);
				prev_img.sub_animation_timeout = null;
			}

			prev_img.style.pointerEvents = "none";
			setTimeout(() => {
				prev_img.style.pointerEvents = "";
			}, 1500);
		}
		if (product_img) {
			var g = product_img.getAttribute("data-gallery");
			if (!g) {
				return;
			}
			product_img.animation_frames = JSON.parse(g).map((e) => e.src);

			if (!product_img.hasAttribute("data-default_src")) {
				product_img.setAttribute(
					"data-default_src",
					product_img.getAttribute("data-src")
				);
			}
			if (product_img.animation_frames.length > 1) {
				product_img.animation_frame_id = 0;
				nextProductImageSlide(product_img, true);
			}
		}
	}
}

function nextProductImageSlide(img, first = false) {
	const nextImg = () => {
		if (animated_product_img != img) {
			return;
		}

		img.animation_frame_id++;
		if (img.animation_frame_id >= img.animation_frames.length) {
			img.animation_frame_id = 0;
		}
		const img_src = img.animation_frames[img.animation_frame_id];

		if (!img_src) {
			// sorry bro it's fucked up
			return;
		}

		img.classList.remove("wo997_img_loaded");
		img.setAttribute("data-src", img_src);
		img.await_img_replace = true;
		lazyLoadImages(false);
	};

	if (first) {
		nextImg();
	}

	const duration = 150;

	img.style.transition = `opacity ${duration}ms`;
	img.style.opacity = "0";

	setTimeout(() => {
		if (animated_product_img != img) {
			return;
		}

		const next_src = img.getAttribute("data-next-src");
		if (next_src) {
			img.setAttribute("src", next_src);
		}

		img.style.opacity = "1";
	}, duration);

	img.sub_animation_timeout = setTimeout(() => {
		nextImg();
	}, 1300);

	img.animation_timeout = setTimeout(() => {
		if (animated_product_img != img) {
			return;
		}
		nextProductImageSlide(img);
	}, 2000);
}
