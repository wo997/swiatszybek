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

var lazyLoadOffset = 800;

function preloadImage(img) {
  if (!img.hasAttribute("data-src")) {
    return;
  }

  if (isNodeOnScreen(img, lazyLoadOffset)) {
    var r = img.getBoundingClientRect();
    var image_dimension = Math.max(r.width, r.height);

    var [w, h] = img.getAttribute("data-d").split("x");
    w = parseInt(w);
    h = parseInt(h);

    var natural_image_dimension = Math.max(w, h);
    var target_size_name = "df";

    //var pixelDensityFactor = window.devicePixelRatio // too many pixels on mobile devices may slow them down
    var pixelDensityFactor = window.devicePixelRatio * 0.5 + 0.5; // always keep the highest quality images, divide by f.e. 0.7 to gain performance / lose quality

    Object.entries(image_default_dimensions).forEach(
      ([size_name, size_dimension]) => {
        if (
          image_dimension < size_dimension / pixelDensityFactor &&
          image_dimension < natural_image_dimension // never bigger than default dimensions
        ) {
          target_size_name = size_name;
        }
      }
    );

    img.setAttribute(
      "src",
      img
        .getAttribute("data-src")
        .replace(/\/uploads\/.{0,4}\//, `/uploads/${target_size_name}/`)
    );
    img.removeAttribute("data-src");
    img.style.height = "";
  }

  img.style.opacity = 0;
  img.classList.add("lazy_image");

  if (isNodeOnScreen(img)) {
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

document.addEventListener("DOMContentLoaded", () => {
  var preload_count = 2; // 2 by default + fill with size, in reality returns more

  var cmsArea = null; // singleton

  $$("img[data-src]").forEach((img) => {
    var r = img.getBoundingClientRect();

    var [w, h] = img.getAttribute("data-d").split("x");
    var real_height = Math.round((r.width * parseInt(h)) / parseInt(w));
    img.style.height = `${real_height}px`;

    if (cmsArea === null) {
      cmsArea =
        img.findParentByClassName("cms").getBoundingClientRect().width *
        window.innerHeight;
    }

    if (r.top < window.innerHeight + lazyLoadOffset) {
      var image_area = r.width * real_height;

      cmsArea -= image_area + 100;

      if (cmsArea > 0) {
        preload_count++;
      }
    }
  });

  var images_shown = 0;
  $$("img[data-src]").forEach((img) => {
    if (images_shown < preload_count) {
      images_shown++;
      preloadImage(img);
    }
  });
});

document.addEventListener("scroll", () => {
  $$("img[data-src]").forEach((img) => {
    preloadImage(img);
  });
  $$(".lazy_image").forEach((img) => {
    showImage(img);
  });
});
