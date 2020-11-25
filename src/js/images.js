/* js[global] */

var lazyLoadOffset = 700;

// also files.php
function loadLazyNode(node, animate = true) {
	if (!node.classList.contains("lazy")) {
		return;
	}

	if (isNodeOnScreen(node, lazyLoadOffset)) {
		node.classList.remove("lazy");
		showImage(node);
	}
}

function loadImage(img, animate = true) {
	if (!img.file_name) {
		return;
	}

	if (isNodeOnScreen(img, lazyLoadOffset)) {
		var w = img.calculated_width;
		var h = img.calculated_height;

		var r = img.getBoundingClientRect();

		if (!r.width) {
			return;
		}

		// floating point numbers suck
		var image_dimension = Math.max(r.width, r.height) - 1;

		var natural_image_dimension = Math.max(w, h);
		//console.log(natural_image_dimension, image_dimension, w, h);
		var target_size_name = "df";

		if (image_dimension < natural_image_dimension) {
			var pixelDensityFactor = window.devicePixelRatio * 0.5 + 0.5; // compromise quality and speed
			Object.entries(image_default_dimensions).forEach(
				([size_name, size_dimension]) => {
					if (size_name == "df") {
						return;
					}
					if (
						image_dimension < size_dimension / pixelDensityFactor &&
						size_dimension < natural_image_dimension
					) {
						target_size_name = size_name;
					}
				}
			);
		}

		var src = "/" + UPLOADS_PATH + target_size_name + "/" + img.file_name;

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

		img.addEventListener("load", () => {
			if (
				!img.hasAttribute(
					"data-height"
				) /*&&
          !img.hasAttribute("data-has-own-height")*/
			) {
				img.style.height = "";
				//window.dispatchEvent(new Event("wo997_img_loaded"));
			}
		});

		if (img.await_img_replace) {
			preloadImage(src);
			img.setAttribute("data-next-src", src);
			delete img.await_img_replace;
			delete img.file_name;
		} else {
			img.setAttribute("src", src);
			img.classList.add("wo997_img_waiting");
			delete img.file_name;
		}

		if (animate) {
			img.style.opacity = 0;
			img.classList.remove("wo997_img_waiting");
			img.classList.add("wo997_img_waiting");

			setTimeout(() => {
				showImage(img);
			}, 0);
		}
	}
}

function showImage(img) {
	if (isNodeOnScreen(img)) {
		img.style.animation = "show 0.45s";
		img.style.opacity = 1;
		img.classList.remove("wo997_img_waiting");
		img.classList.add("wo997_img_loaded");
		setTimeout(() => {
			img.style.opacity = "";
			img.style.animation = "";
		}, 450);
	}
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
	var last_dot_index = src.lastIndexOf(".");
	var ext = src.substring(last_dot_index + 1);
	var path_wo_ext = src.substring(0, last_dot_index);

	var last_floor_index = path_wo_ext.lastIndexOf("_");
	if (last_floor_index === -1) {
		return null;
	}

	var dimensions = path_wo_ext.substring(last_floor_index + 1).split("x");

	var file_name = path_wo_ext.replace(/(\/)?uploads\/.{0,10}\//, ``);

	return {
		file_name: file_name,
		extension: ext,
		w: parseInt(dimensions[0]),
		h: parseInt(dimensions[1]),
	};
}

function setImageDimensions(img) {
	var src = img.getAttribute("data-src");
	var data = getResponsiveImageData(src);
	var rect = img.getBoundingClientRect();

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

	/*if (rect.height) {
    img.setAttribute("data-has-own-height", "");
    console.log(rect.height);
  } else {*/
	var real_height = Math.round((rect.width * data.h) / data.w);
	if (!img.style.height) {
		img.style.height = `${real_height}px`;
	}
	/*}*/

	return rect;
}

document.addEventListener("DOMContentLoaded", () => {
	// to help with flexbox
	setTimeout(() => {
		lazyLoadImages();
	});
});
window.addEventListener("load", () => {
	lazyLoadImages();
});

function lazyLoadImages(animate = true) {
	setCustomHeights();

	$$(".lazy").forEach((img) => {
		var rect = img.getBoundingClientRect();

		if (rect.top < window.innerHeight + lazyLoadOffset) {
			loadLazyNode(img, animate);
		}
	});

	$$(".wo997_img:not(.wo997_img_waiting):not(.wo997_img_loaded)").forEach(
		(img) => {
			var rect = setImageDimensions(img);

			if (rect.top < window.innerHeight + lazyLoadOffset) {
				loadImage(img, animate);
			}
		}
	);

	setTimeout(() => {
		setCustomHeights();
	});
}

document.addEventListener("scroll", scrollCallbackLazy);
document.addEventListener("click", scrollCallbackLazy);
document.addEventListener("touchmove", scrollCallbackLazy);
document.addEventListener("drag", scrollCallbackLazy);
document.addEventListener("mouseover", () => {
	delay("scrollCallbackLazy", 100);
});

function scrollCallbackLazy() {
	$$(".lazy:not(.wo997_img_waiting)").forEach((node) => {
		loadLazyNode(node);
	});
	$$(".wo997_img:not(.wo997_img_waiting):not(.wo997_img_loaded)").forEach(
		(img) => {
			loadImage(img);
		}
	);
	$$(".wo997_img_waiting").forEach((img) => {
		showImage(img);
	});
}

function preloadImage(url) {
	const img = new Image();
	img.src = url;
}

// TODO: hey! this is temporary so the current content won't fail, pls consider remiving it once the new page builder is done
domload(() => {
	$$("[data-src]").forEach((e) => {
		e.classList.add("wo997_img");
	});
});
