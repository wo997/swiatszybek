/* js[global] */

domload(productBlocksLoaded);
function productBlocksLoaded() {
	starsLoaded();
}

function resizeProductsCallback() {
	$$(".product_list").forEach((list) => {
		const target_width = evalCss(def(list.dataset.product_width, "2vw + 280px"), list);

		const list_width = list.offsetWidth;

		const product_width = Math.floor(10000 / Math.round(list_width / target_width)) / 100;

		list.style.setProperty("--product_width", `${product_width}%`);
	});
}

window.addEventListener("resize", () => {
	resizeProductsCallback();
});

/**
 * @typedef {{
 * _images
 * } & PiepNode} ProductImgWrapper
 */

/** @type {PiepNode} */
let curr_focused_product_img_wrapper;
let product_focus_unique_id = 0;

domload(() => {
	resizeProductsCallback();

	const duration = 200; // hardcoded, also in css

	const tacz = (ev) => {
		const target = $(ev.target);
		if (!target) {
			return;
		}
		const product_img_wrapper = target._parent(".product_img_wrapper");
		const was_focused_product_img_wrapper = curr_focused_product_img_wrapper;
		if (product_img_wrapper && product_img_wrapper.offsetWidth > 100) {
			if (curr_focused_product_img_wrapper !== product_img_wrapper && !product_img_wrapper._child(".overlay")) {
				curr_focused_product_img_wrapper = product_img_wrapper;

				const images_json = product_img_wrapper.dataset.images;
				if (images_json) {
					const images = JSON.parse(images_json);
					if (images.length < 2) {
						return;
					}
					product_img_wrapper.insertAdjacentHTML("beforeend", html`<img class="wo997_img product_img overlay" />`);
					const base_img = product_img_wrapper._first();
					const overlay = product_img_wrapper._last();

					product_focus_unique_id++;
					let curr_product_focus_unique_id = product_focus_unique_id;
					let image_id = 0;

					const animateImages = () => {
						if (curr_product_focus_unique_id !== product_focus_unique_id) {
							return;
						}

						image_id = (image_id + 1) % images.length;

						setTimeout(() => {
							overlay.style.opacity = "1";
						});
						setResponsiveImageUrl(overlay, images[image_id]);
						lazyLoadImages({ duration: 0 });
						setTimeout(() => {
							setResponsiveImageUrl(base_img, images[image_id]);
							lazyLoadImages({ duration: 0 });
							overlay.style.opacity = "0";

							preloadWo997Image(images[(image_id + 1) % images.length], base_img);
						}, duration);
						setTimeout(animateImages, 1500);
					};
					animateImages();
				}
			}
		} else {
			curr_focused_product_img_wrapper = undefined;
			product_focus_unique_id++;
		}

		if (was_focused_product_img_wrapper && was_focused_product_img_wrapper !== curr_focused_product_img_wrapper) {
			const images_json = was_focused_product_img_wrapper.dataset.images;
			const images = JSON.parse(images_json);

			const base_img = was_focused_product_img_wrapper._first();
			const overlay = was_focused_product_img_wrapper._last();

			if (overlay && images.length > 1) {
				overlay.style.opacity = "1";
				setResponsiveImageUrl(overlay, images[0]);
				lazyLoadImages({ duration: 0 });
				setTimeout(() => {
					setResponsiveImageUrl(base_img, images[0]);
					lazyLoadImages({ duration: 0 });
					overlay.style.opacity = "0";

					setTimeout(() => {
						overlay.remove();
					}, duration);
				}, duration);
			}
		}
	};

	window.addEventListener("mousemove", tacz);
	window.addEventListener("touchstart", tacz);

	setInterval(() => {
		tacz({ target: mouse.target });
	}, 1000);
});

// /**
//  *
//  * @param {number[]} unit_factors
//  * @param {number} double_value
//  * @returns
//  */
// function getSafeUnitValue(unit_factors, double_value) {
// 	const accuracy = 100000;
// 	const unit_factor = def(getLast(unit_factors.filter((e) => e < double_value + 0.000001)), unit_factors[0]);
// 	const value = Math.round((accuracy * double_value) / unit_factor) / accuracy;
// 	return { unit_factor, value };
// }
