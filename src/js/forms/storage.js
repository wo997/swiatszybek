/* js[global] */

// load saved fields from local storage
domload(() => {
  $$("[data-store]").forEach((e) => {
    e.addEventListener("change", () => {
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
