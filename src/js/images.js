/* js[global] */

/**
 * @typedef {{
 * calculated_width: number
 * calculated_height: number
 * last_dimension: number
 * file_name: string
 * extension: string
 * await_img_replace?: boolean
 * } & PiepNode} ResponsiveImage
 */

const lazyLoadOffset = 700;

// also files.php
function loadLazyNode(node, animate = true) {
	if (!node.classList.contains("lazy")) {
		return;
	}

	if (isNodeOnScreen(node, lazyLoadOffset)) {
		node.classList.remove("lazy");
		animateVisibility(node);
	}
}

/**
 *
 * @param {ResponsiveImage} img
 */
function getImageDimenstions(img, rect = null) {
	if (!rect) {
		rect = img.getBoundingClientRect();
	}

	if (!rect.width) {
		return null;
	}

	return Math.max(rect.width, rect.height);
}

/**
 *
 * @param {ResponsiveImage} img
 * @param {boolean} animate
 */
function loadImage(img, animate = true) {
	if (!img.file_name) {
		return;
	}

	if (isNodeOnScreen(img, lazyLoadOffset)) {
		const w = img.calculated_width;
		const h = img.calculated_height;

		const image_dimension = getImageDimenstions(img);
		img.last_dimension = image_dimension;

		if (!image_dimension) {
			return;
		}

		const natural_image_dimension = Math.max(w, h);
		let target_size_name = "df";

		if (image_dimension < natural_image_dimension + 1) {
			const pixelDensityFactor = window.devicePixelRatio * 0.5 + 0.5; // compromise quality and speed
			Object.entries(image_default_dimensions).forEach(
				([size_name, size_dimension]) => {
					if (size_name == "df") {
						return;
					}
					if (
						image_dimension < size_dimension / pixelDensityFactor + 1 &&
						size_dimension < natural_image_dimension
					) {
						target_size_name = size_name;
					}
				}
			);
		}

		let src = "/" + UPLOADS_PATH + target_size_name + "/" + img.file_name;

		if (
			img.hasAttribute("data-same-ext") &&
			same_ext_image_allowed_types.indexOf(img.extension) !== -1
		) {
			src += "." + img.extension;
		} else if (WEBP_SUPPORT) {
			src += ".webp";
		} else {
			src += ".jpg";
		}

		if (img.await_img_replace) {
			preloadImage(src);
			img.setAttribute("data-next_src", src);
			delete img.await_img_replace;
		} else {
			img.addEventListener("load", () => {
				if (!img.hasAttribute("data-height")) {
					img.style.height = "";
				}
			});

			img.setAttribute("src", src);
			img.classList.add("wo997_img_waiting");

			showWaitingImage(img, animate ? 400 : 0);
		}
	}
}

function showWaitingImage(img, duration) {
	if (img.classList.contains("wo997_img_waiting") && isNodeOnScreen(img)) {
		animateVisibility(
			img,
			img.classList.contains("wo997_img_freeze") ? 0 : duration
		);
	}
}

function animateVisibility(img, duration) {
	img.style.animation = `show ${duration}ms`;
	img.classList.remove("wo997_img_waiting");
	img.classList.add("wo997_img_shown");
	setTimeout(() => {
		img.style.opacity = "";
		img.style.animation = "";
	}, duration);
}

// also files.php
function getUploadedFileName(file_path) {
	// it doesn't work, file extension needs to be removed, look for getResponsiveImageData instead
	return file_path.substr(UPLOADS_PLAIN_PATH.length);
}

// also files.php
function getResponsiveImageData(src) {
	// TODO: if the src is foreign we should not optimize the image
	// isUrlOurs(src)
	if (!src) {
		return null;
	}
	const last_dot_index = src.lastIndexOf(".");
	const ext = src.substring(last_dot_index + 1);
	const path_wo_ext = src.substring(0, last_dot_index);

	const last_floor_index = path_wo_ext.lastIndexOf("_");
	if (last_floor_index === -1) {
		return null;
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
 * @param {ResponsiveImage} img
 */
function switchImage(img, src, animate = true) {
	img.setAttribute("data-src", src);
	setImageDimensions(img);
	loadImage(img, animate);
}

/**
 * @param {ResponsiveImage} img
 */
function setImageDimensions(img) {
	const src = img.getAttribute("data-src");
	const data = getResponsiveImageData(src);
	let rect = img.getBoundingClientRect();

	if (!data) {
		img.style.animation = "show 0.45s";
		img.setAttribute("src", src);
		img.removeAttribute("data-src");
		return rect;
	}
	if (!rect.width && !isHidden(img)) {
		img.style.width = `${data.w}px`;
		rect = img.getBoundingClientRect();
	}

	img.calculated_width = data.w;
	img.calculated_height = data.h;
	img.file_name = data.file_name;
	img.extension = data.extension;

	const real_height = Math.round((rect.width * data.h) / data.w);
	if (!img.style.height) {
		img.style.height = `${real_height}px`;
	}

	return rect;
}

// TODO: hey! this is temporary so the current content won't fail, pls consider removing it once the new page builder is done
domload(() => {
	$$("[data-src]").forEach((e) => {
		e.classList.add("wo997_img");
	});
});

domload(() => {
	// to help with flexbox etc.
	setTimeout(() => {
		lazyLoadImages();
	});
});
window.addEventListener("load", () => {
	lazyLoadImages();
});

function lazyLoadImages(animate = true) {
	scrollCallbackLazy();
	setCustomHeights();

	$$(".lazy").forEach((img) => {
		const rect = img.getBoundingClientRect();

		if (rect.top < window.innerHeight + lazyLoadOffset) {
			loadLazyNode(img, animate);
		}
	});

	// @ts-ignore
	$$(".wo997_img:not(.wo997_img_waiting):not(.wo997_img_shown)").forEach((
		/** @type {ResponsiveImage} */ img
	) => {
		const rect = setImageDimensions(img);

		if (rect.top < window.innerHeight + lazyLoadOffset) {
			loadImage(img, animate);
		}
	});

	setTimeout(() => {
		setCustomHeights();
	});
}

document.addEventListener("scroll", scrollCallbackLazy);
/*document.addEventListener("scroll", scrollCallbackLazy);
document.addEventListener("click", scrollCallbackLazy);
document.addEventListener("touchmove", scrollCallbackLazy);
document.addEventListener("drag", scrollCallbackLazy);
document.addEventListener("mouseover", () => {
	delay("scrollCallbackLazy", 100);
});*/

// some images might be small at the beginning and wanna grow later
setInterval(() => {
	scrollCallbackLazy();
	// @ts-ignore
	$$(".wo997_img_shown").forEach((/** @type {ResponsiveImage} */ img) => {
		const rect = isNodeOnScreen(img);
		const dimensions = getImageDimenstions(img, rect);
		// it's ok to show an image that's tiny with high res
		if (dimensions > img.last_dimension + 25) {
			img.last_dimension = dimensions;
			loadImage(img, false);
		}
	});
}, 300);

function scrollCallbackLazy() {
	$$(".lazy:not(.wo997_img_waiting)").forEach((node) => {
		loadLazyNode(node);
	});
	$$(".wo997_img:not(.wo997_img_waiting):not(.wo997_img_shown)").forEach(
		// @ts-ignore
		(/** @type {ResponsiveImage} */ img) => {
			loadImage(img);
		}
	);
	setTimeout(() => {
		$$(".wo997_img_waiting").forEach((img) => {
			showWaitingImage(img, 400);
		});
	}, 100);
}

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
