/* js[global] */

const lazyLoadOffset = 700;
const show_image_duration = 300;

/**
 *
 * @param {{
 * animate?: boolean
 * }} options
 */
function lazyLoadImages(options = {}) {
	options.animate = def(options.animate, true);

	onScrollImages();
	setCustomHeights();

	// @ts-ignore
	// $$(".wo997_img:not(.wo997_img_waiting):not(.wo997_img_shown)").forEach((img) => {
	// 	// probably more components wanna join in the future, should be a single class tho, like hidden?
	// 	if (img._parent(".wo997_slider:not(.wo997_slider_ready)")) {
	// 		return;
	// 	}

	// 	const rect = img.getBoundingClientRect();

	// 	if (rect.top < window.innerHeight + lazyLoadOffset) {
	// 		// @ts-ignore
	// 		img.src = getResponsiveImageRealUrl(img);
	// 		img.classList.add("wo997_img_shown");
	// 		console.log(img);
	// 		if (options.animate) {
	// 			const duration = show_image_duration;
	// 			img.style.animation = `show ${duration}ms`;
	// 			setTimeout(() => {
	// 				img.style.animation = "";
	// 			}, duration);
	// 		}
	// 	}
	// });

	setCustomHeights();
}

/**
 * also files.php
 *
 * @param {string} src
 * @returns
 */
function getResponsiveImageData(src) {
	// TODO: if the src is foreign we should not optimize the image
	// isUrlOurs(src)
	if (!src) {
		return;
	}
	const last_dot_index = src.lastIndexOf(".");
	const ext = src.substring(last_dot_index + 1);
	const path_wo_ext = src.substring(0, last_dot_index);

	const last_floor_index = path_wo_ext.lastIndexOf("_");
	if (last_floor_index === -1) {
		return;
	}

	const dimensions = path_wo_ext.substring(last_floor_index + 1).split("x");
	const file_name = path_wo_ext.replace(/(\/)?uploads\/.{0,10}\//, ``);

	return {
		file_name: file_name,
		extension: ext,
		w: parseInt(dimensions[0]),
		h: parseInt(dimensions[1]),
	};
}

/**
 * @param {HTMLImageElement} img
 */
function setImageDimensions(img) {
	const src = img.dataset.src;
	const data = getResponsiveImageData(src);
	let rect = img.getBoundingClientRect();

	if (!data) {
		const duration = show_image_duration;
		img.style.animation = `show ${duration}ms`;
		img.src = src;
		setTimeout(() => {
			img.style.animation = "";
		}, duration);
		return;
	}

	if (!rect.width && !isHidden(img)) {
		img.style.width = `${data.w}px`;
	}

	if (!img.style.height) {
		const suppose_height = Math.round((rect.width * data.h) / data.w);
		img.style.height = `${suppose_height}px`;
		img.classList.add("had_no_height");
	}
}

function onScrollImages() {
	const exclude = (img) => {
		if (img._parent(".wo997_slider:not(.wo997_slider_ready)")) {
			return true;
		}
		return false;
	};

	$$(".wo997_img:not(.wo997_img_waiting):not(.wo997_img_shown)").forEach((img) => {
		if (exclude(img)) {
			return;
		}
		if (isNodeOnScreen(img, lazyLoadOffset) && img.dataset.src) {
			// @ts-ignore
			img.src = getResponsiveImageRealUrl(img);
			img.classList.add("wo997_img_waiting");
		}
	});

	$$(".wo997_img_waiting").forEach((img) => {
		if (exclude(img)) {
			return;
		}
		if (isNodeOnScreen(img)) {
			img.classList.remove("wo997_img_waiting");
			img.classList.add("wo997_img_shown");
			const duration = show_image_duration;
			//animate(img, ANIMATIONS.show, duration);
			img.style.animation = `show ${duration}ms`;

			setTimeout(() => {
				img.style.animation = "";
			}, duration);
		}
	});
}

/**
 * @param {HTMLImageElement} img
 * @param {string} base_url
 */
function getResponsiveImageRealUrl(img, base_url = undefined) {
	base_url = def(base_url, img.dataset.src);
	const data = getResponsiveImageData(base_url);

	if (!data) {
		return;
	}

	const rect = img.getBoundingClientRect();
	const image_dimension = Math.max(rect.width, rect.height);
	// @ts-ignore
	img._last_dimension = image_dimension;

	if (!image_dimension) {
		return;
	}

	const natural_image_dimension = Math.max(data.w, data.h);
	let target_size_name = "df";

	if (image_dimension < natural_image_dimension + 1) {
		const pixelDensityFactor = window.devicePixelRatio * 0.3 + 0.7; // compromise quality and performance
		Object.entries(image_fixed_dimensions).forEach(([size_name, size_dimension]) => {
			if (size_name == "df") {
				return;
			}
			if (image_dimension < size_dimension / pixelDensityFactor + 1 && size_dimension < natural_image_dimension) {
				target_size_name = size_name;
			}
		});
	}

	let url = "/" + UPLOADS_PATH + target_size_name + "/" + data.file_name;

	if (img.hasAttribute("data-same-ext") && same_ext_image_allowed_types.indexOf(data.extension) !== -1) {
		url += "." + data.extension;
	} else if (WEBP_SUPPORT) {
		url += ".webp";
	} else {
		url += ".jpg";
	}

	return url;

	// dude, why do this when the height is set anyway?
	// 	window.dispatchEvent(
	// 		new CustomEvent("wo997_img_loaded", {
	// 			detail: {
	// 				img,
	// 			},
	// 		})
	// 	);
	// });
}

setInterval(() => {
	onScrollImages();

	// some images might be small at the beginning and wanna grow later
	$$(".wo997_img_shown").forEach((img) => {
		const rect = img.getBoundingClientRect();
		const image_dimension = Math.max(rect.width, rect.height);
		// it's ok to show an image that's tiny with high res
		// @ts-ignore
		if (image_dimension > img._last_dimension + 25) {
			// @ts-ignore
			img._last_dimension = image_dimension;
			// @ts-ignore
			img.src = getResponsiveImageRealUrl(img);
		}
	});
}, 150);

function preloadImage(url) {
	const img = new Image();
	img.src = url;

	return new Promise((resolve) => {
		img.addEventListener("load", () => {
			resolve("success");
		});

		// expect to load in less than 5s
		setTimeout(() => {
			resolve("error");
		}, 5 * 1000);
	});
}

/**
 *
 * @param {string} base_url
 * @param {PiepNode} img
 * @returns
 */
function preloadWo997Image(base_url, img) {
	// @ts-ignore
	const url = getResponsiveImageRealUrl(img, base_url);
	return preloadImage(url);
}

/**
 *
 * @param {PiepNode} img
 */
function setResponsiveImageUrl(img, url) {
	img.classList.remove("wo997_img_waiting");
	img.classList.remove("wo997_img_shown");
	img.dataset.src = url;
	delay("lazyLoadImages", 0);
}
