/* js[global] */

function setCookie(cname, cvalue) {
  var d = new Date();
  d.setTime(d.getTime() + 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/;samesite";
}

function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// load save fields in cookie
var ignoreValueChanges = false;
window.addEventListener("DOMContentLoaded", () => {
  $$("[data-cookie]").forEach((e) => {
    e.addEventListener("change", () => {
      if (ignoreValueChanges) return;
      var cookieName = e.getAttribute("data-cookie");
      if (!cookieName) cookieName = e.getAttribute("name");
      setCookie(cookieName, e.value);
    });
  });
});

function loadFormFromCookies() {
  $$("[data-cookie]").forEach((e) => {
    var cookieName = e.getAttribute("data-cookie");
    if (!cookieName) cookieName = e.getAttribute("name");
    var value = getCookie(cookieName);
    if (value) {
      setValue(e, value);
    }
  });
}
