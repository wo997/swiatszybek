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
  if (!img.hasAttribute("data-src")) {
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

    var src = img.setSrcBase.replace(
      /\/uploads\/.{0,10}\//,
      `/uploads/${target_size_name}/`
    );

    if (WEBP_SUPPORT) {
      src += ".webp";
    } else {
      src += ".jpg";
    }

    if (!img.hasAttribute("data-height")) {
      img.addEventListener("load", () => {
        img.style.height = "";
      });
    }

    img.setAttribute("src", src);
    img.removeAttribute("data-src");
  }

  if (animate) {
    img.style.opacity = 0;
    img.classList.add("lazy_image");

    setTimeout(() => {
      showImage(img);
    }, 0);
  }
}

function showImage(img) {
  if (isNodeOnScreen(img)) {
    img.style.animation = "fadeIn 0.45s";
    img.style.opacity = 1;
    img.classList.remove("lazy_image");
  }
}

function setImageDimensions(img) {
  var src = img.getAttribute("data-src");
  var last = src.lastIndexOf(".");
  var new_src = src.substring(0, last);

  var rect = img.getBoundingClientRect();

  var split = new_src.split("(");
  if (split.length < 2) {
    img.setAttribute("src", src);
    img.removeAttribute("data-src");
    return rect;
  }
  var dimensions = split[1].replace(")", "").split("x");

  w = parseInt(dimensions[0]);
  h = parseInt(dimensions[1]);

  if (!rect.width) {
    img.style.width = `${w}px`;
    rect = img.getBoundingClientRect();
  }

  img.calculated_width = w;
  img.calculated_height = h;
  img.setSrcBase = new_src;

  var real_height = Math.round((rect.width * parseInt(h)) / parseInt(w));
  img.style.height = `${real_height}px`;
  img.classList.add("remove_height");

  //alert(img.getBoundingClientRect().height);
  return rect;
}

document.addEventListener("DOMContentLoaded", () => {
  lazyLoadImages();
});

function lazyLoadImages(animate = true) {
  //var preload_count = 2; // 2 by default + fill with size, in reality returns more

  //var cmsArea = null; // singleton

  $$("img[data-src]").forEach((img) => {
    //var real_height =
    var rect = setImageDimensions(img);

    /*if (cmsArea === null) {
      cmsArea =
        img.findParentByClassName("cms").getBoundingClientRect().width *
        window.innerHeight;
    }*/

    if (rect.top < window.innerHeight + lazyLoadOffset) {
      //var image_area = r.width * real_height;

      //if (cmsArea > 0) {
      preloadImage(img, animate);
      //}
      //cmsArea -= image_area;
    }
  });
}

document.addEventListener("scroll", scrollCallbackLazy);
document.addEventListener("click", scrollCallbackLazy);
document.addEventListener("touchmove", scrollCallbackLazy);
document.addEventListener("mousemove", () => {
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
