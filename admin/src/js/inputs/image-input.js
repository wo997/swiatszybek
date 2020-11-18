/* js[admin] */

window.addEventListener("register-form-components", registerImageInputs);

function imageInputValueChange(data) {
  console.log(data);
}

function registerImageInputs() {
  $$("image-input:not(.image-input-registered)").forEach((input) => {
    input.classList.add("image-input-registered");

    // TODO crazy, we use names so far hmm
    input.classList.add("form-input");

    useTool("fileManager");

    input.insertAdjacentHTML(
      "afterbegin",
      /*html*/ `
        <img data-type="src" />
        <button class="btn primary" onclick='fileManager.open(this.prev(),{asset_types:["image"], size: "sm", callback: imageInputValueChange})'></button>
      `
    );

    const img = input.find("img");
    img.addEventListener("change", () => {
      input.find("button").setContent(img.getValue() ? "Zmień" : "Wybierz");
      if (!input.setting_value) {
        input.dispatchChange();
      }
    });

    input.getValue = () => {
      return img.getValue();
    };

    input.setValue = (value, options = {}) => {
      input.setting_value = true;
      img.setValue(value);
      delete input.setting_value;

      if (!options.quiet) {
        input.dispatchChange();
      }
    };

    input.setValue();
  });
}
