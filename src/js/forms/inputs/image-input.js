/* js[global] */

window.addEventListener("register-form-components", registerImageInputs);

function registerImageInputs() {
  $$("image-input:not(.image-input-registered)").forEach((c) => {
    c.classList.add("image-input-registered");

    useTool("fileManager");

    c.insertAdjacentHTML(
      "afterbegin",
      `
        <img name="icon" data-type="src" style="max-width:100px;max-height:100px" />
        <button class="btn primary" onclick='fileManager.open(this.next(),{asset_types:["image"], size: "sm"})'>Wybierz</button>
        `
    );

    c.addEventListener("click", (e) => {});
  });
}
