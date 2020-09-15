/* js[global] */

function isNodeOnScreen(node, offset = -10) {
  var r = node.getBoundingClientRect();
  if (
    r.y > window.innerHeight + offset ||
    r.y + r.height < -offset ||
    r.x > window.innerWidth + offset ||
    r.x + r.width < -offset
  ) {
    return false;
  }
  return true;
}

var lazyLoadOffset = 700;

function preloadImage(img, animate = true) {
  if (!img.filename) {
    return;
  }

  if (isNodeOnScreen(img, lazyLoadOffset)) {
    var w = img.calculated_width;
    var h = img.calculated_height;

    var r = img.getBoundingClientRect();
    var image_dimension = Math.max(r.width, r.height);

    var natural_image_dimension = Math.max(w, h);
    //console.log(natural_image_dimension, image_dimension);
    var target_size_name = "df";

    if (image_dimension < natural_image_dimension) {
      //var pixelDensityFactor = window.devicePixelRatio // too many pixels on mobile devices may slow them down
      var pixelDensityFactor = window.devicePixelRatio * 0.5 + 0.5; // always keep the highest quality images, divide by f.e. 0.7 to gain performance / lose quality

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

    var src = "/" + UPLOADS_PATH + target_size_name + "/" + img.filename;

    if (WEBP_SUPPORT) {
      src += ".webp";
    } else {
      src += ".jpg";
    }

    if (
      !img.hasAttribute(
        "data-height"
      ) /*&&
      !img.hasAttribute("data-has-own-height")*/
    ) {
      img.addEventListener("load", () => {
        img.style.height = "";
      });
    }

    img.setAttribute("src", src);
    img.removeAttribute("data-src");
    delete img.filename;

    if (animate) {
      img.style.opacity = 0;
      img.classList.add("lazy_image");

      setTimeout(() => {
        showImage(img);
      }, 0);
    }
  }
}

function showImage(img) {
  if (isNodeOnScreen(img)) {
    img.style.animation = "fadeIn 0.45s";
    img.style.opacity = 1;
    img.classList.remove("lazy_image");
    setTimeout(() => {
      img.style.opacity = "";
      img.style.animation = "";
    }, 450);
  }
}

function getResponsiveImageData(src) {
  var last_dot_index = src.lastIndexOf(".");
  var path_wo_ext = src.substring(0, last_dot_index);

  var last_floor_index = path_wo_ext.lastIndexOf("_");
  if (last_floor_index === -1) {
    return null;
  }

  var dimensions = path_wo_ext.substring(last_floor_index + 1).split("x");

  var filename = path_wo_ext.replace(/\/uploads\/.{0,10}\//, ``);

  return {
    filename: filename,
    w: parseInt(dimensions[0]),
    h: parseInt(dimensions[1]),
  };
}

function setImageDimensions(img) {
  var src = img.getAttribute("data-src");
  var data = getResponsiveImageData(src);
  var rect = img.getBoundingClientRect();

  if (!data) {
    img.style.animation = "fadeIn 0.45s";
    img.setAttribute("src", src);
    img.removeAttribute("data-src");
    return rect;
  }
  if (!rect.width) {
    img.style.width = `${data.w}px`;
    rect = img.getBoundingClientRect();
  }

  img.calculated_width = data.w;
  img.calculated_height = data.h;
  img.filename = data.filename;

  /*if (rect.height) {
    img.setAttribute("data-has-own-height", "");
    console.log(rect.height);
  } else {*/
  var real_height = Math.round((rect.width * data.h) / data.w);
  img.style.height = `${real_height}px`;
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
  $$("img[data-src]:not(.lazy_image)").forEach((img) => {
    var rect = setImageDimensions(img);

    if (rect.top < window.innerHeight + lazyLoadOffset) {
      preloadImage(img, animate);
    }
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
  $$("img[data-src]").forEach((img) => {
    preloadImage(img);
  });
  $$(".lazy_image").forEach((img) => {
    showImage(img);
  });
}
