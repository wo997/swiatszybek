/* js[global] */
document.addEventListener("DOMContentLoaded", function () {
  if (!IS_MOBILE) {
    /*$$(".navbar_wrapper .dropdown").forEach((e) => {
      var a = e.find("a");
      var u = e.find(".dropdown-header");
      if (a && u) {
        u.addEventListener("click", () => {
          window.location = a.href;
        });
      }
    });*/
  }
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
  toggleBodyScroll(false);
}

function showPopup() {
  var p = $(".old-popupWrapper");
  if (!p) return;
  p.style.top = "0";
  p.style.opacity = 1;
  toggleBodyScroll(true);
}
