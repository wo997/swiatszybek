/* js[global] */

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

domload(() => {
	resizeProductsCallback();

	const tacz = (ev) => {
		const target = $(ev.target);
		const product_img_wrapper = target._parent(".product_img_wrapper", { skip: 0 });
		const was_focused_product_img_wrapper = curr_focused_product_img_wrapper;
		if (product_img_wrapper) {
			if (curr_focused_product_img_wrapper !== product_img_wrapper) {
				curr_focused_product_img_wrapper = product_img_wrapper;

				//const product_img = product_img_wrapper._child(".product_img");
				const images_json = product_img_wrapper.dataset.images;
				if (images_json) {
					const images = JSON.parse(images_json);
					product_img_wrapper.insertAdjacentHTML(
						"beforeend",
						html`<img data-src="${images[1].img_url}" class="wo997_img product_img overlay" />`
					);
					const base_img = product_img_wrapper._first();
					const overlay = product_img_wrapper._last();
					lazyLoadImages({ animate: false });

					const duration = 200;
					overlay.style.animation = `show ${duration}ms`;
					setTimeout(() => {
						base_img.src = images[2].img_url;
						overlay.style.display = "none";
					}, duration);
				}
			}
		} else {
			curr_focused_product_img_wrapper = undefined;
		}

		if (was_focused_product_img_wrapper && was_focused_product_img_wrapper !== curr_focused_product_img_wrapper) {
			const overlay = was_focused_product_img_wrapper._child(".overlay");
			if (overlay) {
				overlay.remove();
			}
		}
	};

	window.addEventListener("mousemove", tacz);
	window.addEventListener("touchstart", tacz);
});
