/* js[admin] */

window.addEventListener("register-form-components", registerImageInputs);

function registerImageInputs() {
	$$("image-input:not(.image-input-registered)").forEach((input) => {
		input.classList.add("image-input-registered");

		// TODO: crazy, we use names so far hmm
		// input.classList.add("form-input");

		//useTool("fileManager");

		input.insertAdjacentHTML(
			"afterbegin",
			/*html*/ `
                <div class="image-input-img-wrapper">
                <img class="wo997_img"/>
                <i class="fas fa-image"></i>
                </div>
                <button class="btn primary"></button>
            `
		);

		const img = input._child("img");
		const button = input._child("button");
		const wrapper = input._child(".image-input-img-wrapper");

		const options_json = input.getAttribute("data-options");
		if (options_json) {
			try {
				const options = JSON.parse(options_json);

				if (options.width) {
					wrapper.style.width = options.width;
				}

				// it could be a function
				if (options.height) {
					if (options.height.indexOf("w") !== -1) {
						wrapper.setAttribute("data-height", options.height);
					} else {
						wrapper.style.height = options.height;
					}
				}
			} catch (e) {
				console.error(e);
			}
		}

		img.addEventListener("change", () => {
			const selected = !!img._get_value();
			const btn = input._child("button");
			btn._set_content(selected ? "Zmień" : "Wybierz");
			btn.classList.toggle("primary", !selected);
			btn.classList.toggle("secondary", selected);
			if (!input._setting_value) {
				input._dispatch_change();
			}
			input.classList.toggle("selected", selected);
		});

		wrapper.addEventListener("click", () => {
			button.click();
		});

		button.addEventListener("click", () => {
			fileManager.open(img, {
				asset_types: ["image"],
			});
		});

		input._get_value = () => {
			return img._get_value();
		};

		input._set_value = (value, options = {}) => {
			input._setting_value = true;
			img._set_value(value);
			delete input._setting_value;

			if (!options.quiet) {
				input._dispatch_change();
			}
		};

		input._set_value();
	});
}
