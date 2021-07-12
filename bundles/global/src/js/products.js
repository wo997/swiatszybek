/* js[global] */

domload(productBlocksLoaded);
function productBlocksLoaded() {
	starsLoaded();

	// images yay
	$$(".product_img_wrapper:not(.cntrrgstrd)").forEach((e) => {
		e.classList.add("cntrrgstrd");
		try {
			const cnt = JSON.parse(e.dataset.images).length;
			if (cnt < 2) {
				return;
			}
			e.insertAdjacentHTML("beforeend", html`<div class="img_cnt">${cnt} <i class="far fa-image"></i></div>`);
		} catch (e) {}
	});

	let num = 0;

	/**
	 *
	 * @param {PiepNode} lazy_products
	 * @param {*} params
	 */
	const lazyLoadProducts = (lazy_products, params) => {
		xhr({
			url: `/modules/product_list/lazy/?v=${++num}`,
			params: { params },
			type: "string",
			success: (res) => {
				/**
				 *
				 * @param {PiepNode} node
				 */
				const put = (node) => {
					node.insertAdjacentHTML("beforeend", res);
				};
				if (lazy_products.classList.contains("product_list")) {
					put(lazy_products);
				} else {
					put(lazy_products._child(".wo997_slides_wrapper"));
					window.dispatchEvent(new Event("resize"));
				}
			},
		});
	};

	$$(".lazy_products").forEach((lazy_products) => {
		const params = JSON.parse(lazy_products.dataset.params);
		const empty = params[3] == "0";
		const wait_till_seen = empty || lazy_products.classList.contains("product_list");

		if (wait_till_seen) {
			const wait = () => {
				setTimeout(() => {
					let lazy_off = LAZY_MORE ? window.innerWidth * 0.5 : -10;

					if (lazy_products.getBoundingClientRect().top < window.innerHeight + lazy_off) {
						return lazyLoadProducts(lazy_products, params);
					}

					wait();
				}, 200);
			};

			wait();
		} else {
			// slider is simply hidden, so ignore it untill some action is performed
			lazy_products.addEventListener(
				"mouseenter",
				() => {
					lazyLoadProducts(lazy_products, params);
				},
				{ once: true }
			);
			lazy_products.addEventListener(
				"touchstart",
				() => {
					lazyLoadProducts(lazy_products, params);
				},
				{ once: true }
			);
		}
	});
}

/**
 * @typedef {{
 * _images
 * } & PiepNode} ProductImgWrapper
 */

/** @type {PiepNode} */
let curr_focused_product_img_wrapper;
let product_focus_unique_id = 0;

domload(() => {
	const duration = 200; // hardcoded, also in css

	const tacz = (ev) => {
		const target = $(ev.target);
		if (!target) {
			return;
		}
		const product_img_wrapper = target._parent(".product_img_wrapper");
		const was_focused_product_img_wrapper = curr_focused_product_img_wrapper;
		if (product_img_wrapper && product_img_wrapper.offsetWidth > 100) {
			if (curr_focused_product_img_wrapper !== product_img_wrapper && !product_img_wrapper.classList.contains("active")) {
				if (curr_focused_product_img_wrapper) {
					curr_focused_product_img_wrapper.classList.remove("active");
				}
				curr_focused_product_img_wrapper = product_img_wrapper;
				product_img_wrapper.classList.add("active");

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
			if (curr_focused_product_img_wrapper) {
				curr_focused_product_img_wrapper.classList.remove("active");
			}
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

// domload(() => {
// 	const resize = () => {
// 		$$(".product_list").forEach((e) => {
// 			/** @type {number} */
// 			let top;
// 			e._direct_children()
// 				.reverse()
// 				.forEach((c) => {
// 					//c.classList.toggle("first_row", c.offsetTop < 50);
// 					if (top === undefined) {
// 						top = c.offsetTop;
// 					}
// 					c.classList.toggle("last_row", c.offsetTop > top - 50);
// 				});
// 		});
// 	};
// 	window.addEventListener("resize", resize);
// 	resize();
// });
