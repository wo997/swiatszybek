/* js[global] */

const show_image_duration = 300; // TODO: this might be unnecessary, animations can be a part of page builder dude

/**
 *
 * @typedef {{
 * duration?: number
 * }} LazyLoadImageOptions
 */

/**
 *
 * @param {LazyLoadImageOptions} options
 */
function lazyLoadImages(options = {}) {
	onScrollImages(options);
	//setCustomHeights();
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

	const dimsstr = path_wo_ext.substring(last_floor_index + 1);
	if (!dimsstr.match(/^\d*x\d*$/)) {
		return;
	}

	const dimensions = dimsstr.split("x");
	const file_name = path_wo_ext.replace(/(\/)?uploads\/.{0,10}\//, ``);

	return {
		file_name: file_name,
		extension: ext,
		responsive: minify_extensions.includes(ext),
		w: parseInt(dimensions[0]),
		h: parseInt(dimensions[1]),
	};
}

/**
 * before the image is visible, makes sure that the layout is ok
 *
 * @param {PiepNode} img
 */
function setImageSize(img) {
	if (img.classList.contains("has_size_set")) {
		return;
	}
	img.classList.add("has_size_set");

	const src = img.dataset.src;
	if (!src) {
		return;
	}
	const data = getResponsiveImageData(src);

	if (!data) {
		const duration = show_image_duration;
		img.style.animation = `show ${duration}ms`;
		// @ts-ignore
		img.src = src;
		setTimeout(() => {
			img.style.animation = "";
		}, duration);
		return;
	}

	if (!img.offsetWidth && !isHidden(img)) {
		img.style.width = `${data.w}px`;
	}

	if (!img.style.height && !img.offsetHeight) {
		const suppose_height = Math.round((img.offsetWidth * data.h) / data.w);
		img.style.height = `${suppose_height}px`;
		img.classList.add("had_no_height");
	}
}

/**
 *
 * @param {LazyLoadImageOptions} options
 */
function onScrollImages(options = {}) {
	const exclude = (img) => {
		if (img._parent(".wo997_slider:not(.wo997_slider_ready)")) {
			return true;
		}
		return false;
	};

	let lazy_off = LAZY_MORE ? window.innerWidth * 0.5 : -10;

	$$(".wo997_img:not(.wo997_img_waiting):not(.wo997_img_shown)").forEach((img) => {
		if (exclude(img)) {
			return;
		}
		setImageSize(img);
		if (isNodeOnScreen(img, lazy_off, lazy_off) && img.dataset.src) {
			const src = getResponsiveImageRealUrl(img);
			if (src) {
				// @ts-ignore
				img.src = src;
				img.classList.add("wo997_img_waiting");
				if (img.classList.contains("had_no_height")) {
					img.style.height = "";
				}
			}
		}
		//  else {
		// 	setImageSize(img);
		// }
	});

	$$(".wo997_bckg_img:not(.wo997_bckg_img_shown)").forEach((node) => {
		if (isNodeOnScreen(node, lazy_off, lazy_off) && node.dataset.bckg_src) {
			// TODO: isn't it just an approx?
			const src = getResponsiveBckgImageRealUrl(node);
			if (src) {
				node.style.backgroundImage = `url(${src})`;
				node.classList.add("wo997_bckg_img_shown");
			}
		}
	});

	$$(".wo997_bckg_img_shown:not(.wo997_bckg_img)").forEach((node) => {
		node.style.backgroundImage = "";
		node.classList.remove("wo997_bckg_img_shown");
	});

	$$(".wo997_img_waiting").forEach((img) => {
		if (exclude(img)) {
			return;
		}
		if (isNodeOnScreen(img)) {
			img.classList.remove("wo997_img_waiting");
			img.classList.add("wo997_img_shown");
			const duration = def(options.duration, show_image_duration);
			img.style.animation = `show ${duration}ms`;

			quickTimeout(() => {
				img.style.animation = "";
			}, duration);
		}
	});
}

/**
 * @param {PiepNode} img
 * @param {{
 * base_url?: string
 * image_dimension?: number
 * }} options
 * @returns {string}
 */
function getResponsiveImageRealUrl(img, options = {}) {
	const base_url = def(options.base_url, img.dataset.src);
	const img_data = getResponsiveImageData(base_url);
	const fixed_resolution = img.dataset.resolution;

	if (!img_data || !img_data.responsive) {
		return base_url;
	}

	const image_dimension = def(options.image_dimension, Math.max(img.offsetWidth, img.offsetHeight));
	// @ts-ignore
	img._last_dimension = image_dimension;

	if (!image_dimension && !fixed_resolution) {
		return;
	}

	const natural_image_dimension = Math.max(img_data.w, img_data.h);
	let target_size_name = def(fixed_resolution, "df");

	if (!fixed_resolution && image_dimension < natural_image_dimension + 1) {
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

	let url = "/" + UPLOADS_PATH + target_size_name + "/" + img_data.file_name;

	if (img.hasAttribute("data-same-ext") && same_ext_image_allowed_types.indexOf(img_data.extension) !== -1) {
		url += "." + img_data.extension;
	} else if (WEBP_SUPPORT) {
		url += ".webp";
	} else {
		url += ".jpg";
	}

	return url;
}

/**
 * @param {PiepNode} img
 * @param {{
 * base_url?: string
 * image_dimension?: number
 * }} options
 * @returns {string}
 */
function getResponsiveBckgImageRealUrl(img, options = {}) {
	const base_url = def(options.base_url, img.dataset.bckg_src);
	const img_data = getResponsiveImageData(base_url);
	const fixed_resolution = img.dataset.resolution;

	if (!img_data || !img_data.responsive) {
		return base_url;
	}

	const image_dimension = def(options.image_dimension, Math.max(img.offsetWidth, img.offsetHeight));
	// @ts-ignore
	img._last_dimension = image_dimension;

	if (!image_dimension && !fixed_resolution) {
		return;
	}

	const natural_image_dimension = Math.max(img_data.w, img_data.h);
	let target_size_name = def(fixed_resolution, "df");

	if (!fixed_resolution && image_dimension < natural_image_dimension + 1) {
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

	let url = "/" + UPLOADS_PATH + target_size_name + "/" + img_data.file_name;

	if (img.hasAttribute("data-same-ext") && same_ext_image_allowed_types.indexOf(img_data.extension) !== -1) {
		url += "." + img_data.extension;
	} else if (WEBP_SUPPORT) {
		url += ".webp";
	} else {
		url += ".jpg";
	}

	return url;
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
	const url = getResponsiveImageRealUrl(img, { base_url });
	return preloadImage(url);
}

/**
 *
 * @param {PiepNode} img
 */
function setResponsiveImageUrl(img, data_src) {
	img.classList.remove("wo997_img_waiting", "wo997_img_shown");
	img.dataset.src = data_src;
	const src = getResponsiveImageRealUrl(img);
	if (src) {
		// @ts-ignore
		img.src = src;
	}
}
