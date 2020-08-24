/* js[global] */

function registerTextCounters() {
  $$("[data-show-count]:not(.registered)").forEach((e) => {
    e.classList.add("registered");
    e.addEventListener("change", () => {
      e.next().find("span").innerHTML = e.value.length;
      if (e.value.length > e.getAttribute("data-show-count")) {
        e.next().style.color = "#f00";
        e.next().style.fontWeight = "bold";
      } else if (e.value.length > 0.9 * e.getAttribute("data-show-count")) {
        e.next().style.color = "#fa0";
        e.next().style.fontWeight = "bold";
      } else {
        e.next().style.color = "";
        e.next().style.fontWeight = "";
      }
    });
    e.addEventListener("input", () => {
      e.dispatchEvent(new Event("change"));
    });
    e.insertAdjacentHTML(
      "afterend",
      `
            <div style="color:#555">
              <span></span><span> / ${e.getAttribute(
                "data-show-count"
              )} znaków ${nonull(
        e.getAttribute("data-count-description")
      )}</span>
            </div>
        `
    );
    e.dispatchEvent(new Event("change"));
  });
}
