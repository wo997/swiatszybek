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

var lazyLoadOffset = 1000;

function preloadImage(img, animate = true) {
  if (!img.hasAttribute("data-src")) {
    return;
  }

  if (isNodeOnScreen(img, lazyLoadOffset)) {
    var src = img.getAttribute("data-src");
    var last = src.lastIndexOf(".");
    new_src = src.substring(0, last);

    var split = new_src.split("(");
    if (split.length < 2) {
      img.setAttribute("src", src);
      img.removeAttribute("data-src");
      return;
    }
    var dimensions = split[1].replace(")", "").split("x");

    w = parseInt(dimensions[0]);
    h = parseInt(dimensions[1]);

    var r = img.getBoundingClientRect();
    var image_dimension = Math.max(r.width, r.height);

    var natural_image_dimension = Math.max(w, h);
    console.log(natural_image_dimension, image_dimension);
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

    new_src = new_src.replace(
      /\/uploads\/.{0,10}\//,
      `/uploads/${target_size_name}/`
    );

    if (WEBP_SUPPORT) {
      new_src += ".webp";
    } else {
      new_src += ".jpg";
    }

    img.setAttribute("src", new_src);
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
    if (img.hasAttribute("data-d")) {
      setTimeout(() => {
        img.style.height = ""; // that's the solution
      }, 2000);
    }
  }
}

function setImageHeight(img, r) {
  var dimension = img.getAttribute("data-d");
  if (!dimension) {
    return;
  }
  var [w, h] = dimension.split("x");
  var real_height = Math.round((r.width * parseInt(h)) / parseInt(w));
  img.style.height = `${real_height}px`;
  //return real_height;
}

document.addEventListener("DOMContentLoaded", () => {
  lazyLoadImages();
});

function lazyLoadImages(animate = true) {
  //var preload_count = 2; // 2 by default + fill with size, in reality returns more

  //var cmsArea = null; // singleton

  $$("img[data-src]").forEach((img) => {
    var r = img.getBoundingClientRect();
    //var real_height =
    setImageHeight(img, r);

    /*if (cmsArea === null) {
      cmsArea =
        img.findParentByClassName("cms").getBoundingClientRect().width *
        window.innerHeight;
    }*/

    if (r.top < window.innerHeight + lazyLoadOffset) {
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
  console.log(1);
  $$("img[data-src]").forEach((img) => {
    preloadImage(img);
  });
  $$(".lazy_image").forEach((img) => {
    showImage(img);
  });
}
