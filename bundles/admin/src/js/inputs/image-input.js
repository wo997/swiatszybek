/* js[admin] */

window.addEventListener("register-form-components", (ev) => {
	// @ts-ignore
	registerImageInputs(ev.detail.parent);
});

/**
 *
 * @param {PiepNode} parent
 */
function registerImageInputs(parent) {
	parent._children("image-input:not(.image-input-registered)").forEach((input) => {
		input.classList.add("image-input-registered");

		input.insertAdjacentHTML(
			"afterbegin",
			html`
				<img class="wo997_img" />
				<div class="controls">
					<button class="btn subtle change_btn" data-tooltip="Zmień"><i class="fas fa-cog"></i></button>
					<button class="btn subtle preview_btn" data-tooltip="Podgląd"><i class="fas fa-eye"></i></button>
					<button class="btn primary select_btn"><i class="fas fa-image"></i> <i class="fas fa-plus"></i></button>
				</div>
			`
		);

		const img = input._child("img");
		const select_btn = input._child(".select_btn");
		const change_btn = input._child(".change_btn");
		const preview_btn = input._child(".preview_btn");
		const select_file_modal = getSelectFileModal();

		img.addEventListener("change", () => {
			const selected = !!img._get_value();
			if (!input._setting_value) {
				input._dispatch_change();
			}
			input.classList.toggle("selected", selected);
		});

		const select = () => {
			select_file_modal._data.file_manager.select_target = input;
			select_file_modal._render();
			select_file_modal._show({ source: input });
		};

		select_btn.addEventListener("click", () => {
			select();
		});

		change_btn.addEventListener("click", () => {
			select();
		});

		preview_btn.addEventListener("click", () => {
			zoomImage(img.dataset.src, { source: input });
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

		input._set_value("");
	});
}
