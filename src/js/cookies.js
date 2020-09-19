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
  $$("[data-store]").forEach((e) => {
    e.addEventListener("change", () => {
      if (ignoreValueChanges) return;
      var name = e.getAttribute("data-store");
      if (!name) name = e.getAttribute("name");
      localStorage.setItem(name, e.getValue());
    });
  });
});

function loadFormFromLocalStorage() {
  $$("[data-store]").forEach((e) => {
    var name = e.getAttribute("data-store");
    if (!name) name = e.getAttribute("name");

    var value = localStorage.getItem(name);
    if (value) {
      setValue(e, value);
    }
  });
}
