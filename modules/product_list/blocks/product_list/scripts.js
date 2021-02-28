/* js[global] */

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
		document.body.insertAdjacentHTML("beforeend", `<style class='${product_list_id}'></style>`);
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

window.addEventListener("resize", (event) => {
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

		if (!e._child(".product-actions")) {
			e.insertAdjacentHTML(
				"beforeend",
				html`<div class="product-actions">
					<div class="btn-wrapper">
						<img class="heart_icon below" src="/src/img/heart_icon.svg" />
						<img class="heart_icon over" src="/src/img/heart_icon_fill.svg" />
					</div>
					<div class="btn-wrapper" onclick="showOffersOntopBabbyohohohohohoh">
						<img class="basket_icon below" src="/src/img/basket_icon.svg" />
						<img class="basket_icon over" src="/src/img/basket_icon_fill.svg" />
					</div>
				</div> `
			);
		}
	});
}

domload(() => {
	$$(".product_list_module.grid").forEach((e) => {
		setProductListGridDimensions(e);
	});
	productListLoaded();
});

let animated_product_img = null;

domload(() => {
	preventProductImagesLongPress();

	window.addEventListener("touchmove", (event) => {
		currentlyFocusedProduct($(event.target));
	});
	window.addEventListener("mousemove", (event) => {
		currentlyFocusedProduct($(event.target));
	});
});

function preventProductImagesLongPress() {
	$$(".product_image").forEach((e) => {
		preventLongPressMenu(e);
	});
}

/**
 *
 * @param {PiepNode} node
 */
function currentlyFocusedProduct(node) {
	let product_img = null;

	if (node && node.classList && node.classList.contains("product_image") && node._parent(".product-block")) {
		product_img = node;
	}

	if (animated_product_img != product_img) {
		const prev_img = animated_product_img;
		animated_product_img = product_img;

		if (prev_img) {
			const default_src = prev_img.getAttribute("data-default_src");
			if (prev_img.getAttribute("data-src") != default_src) {
				const duration = 150;

				prev_img._animate(`0%{opacity:1}100%{opacity:0}`, duration);

				setTimeout(() => {
					switchImage(prev_img, default_src);
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
				product_img.setAttribute("data-default_src", product_img.getAttribute("data-src"));
			}
			if (product_img.animation_frames.length > 1) {
				product_img.animation_frame_id = 0;
				nextProductImageSlide(product_img, true);
			}
		}
	}
}

/**
 *
 * @param {{
 * animation_frame_id: number
 * animation_frames: Array
 * sub_animation_timeout: number
 * animation_timeout: number
 * } & ResponsiveImage} img
 * @param {*} first
 */
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

		if (img_src) {
			img.await_img_replace = true;
			switchImage(img, img_src);
		}
	};

	if (first) {
		nextImg();
	}

	const duration = 150;

	img._animate(`0%{opacity:1}100%{opacity:0}`, duration);

	setTimeout(() => {
		if (animated_product_img != img) {
			return;
		}

		const next_src = img.getAttribute("data-next_src");
		if (next_src) {
			switchImage(img, next_src);
		}
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
