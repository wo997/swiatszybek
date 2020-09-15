/* js[global] */

/* deprecated */
document.addEventListener("DOMContentLoaded", function () {
  var popup = $(".old-popupWrapper");
  if (popup) {
    popup.addEventListener("click", function (e) {
      if (e.target == popup) hidePopup();
    });
  }
});

function hidePopup() {
  var p = $(".old-popupWrapper");
  if (!p) return;
  p.style.opacity = 0;
  setTimeout(function () {
    p.style.top = "-100vh";
  }, 400);
  toggleBodyScroll(true);
}

function showPopup() {
  var p = $(".old-popupWrapper");
  if (!p) return;
  p.style.top = "0";
  p.style.opacity = 1;
  toggleBodyScroll(false);
}
