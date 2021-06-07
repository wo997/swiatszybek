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
	parent._children("image-picker:not(.image-picker-registered)").forEach((input) => {
		input.classList.add("image-picker-registered");

		input.insertAdjacentHTML(
			"afterbegin",
			html`
				<img class="wo997_img freeze" />
				<div class="controls">
					<button class="btn subtle change_btn" data-tooltip="Zmień"><i class="fas fa-cog"></i></button>
					<button class="btn subtle preview_btn" data-tooltip="Podgląd"><i class="fas fa-eye"></i></button>
					<button class="btn subtle empty_btn" data-tooltip="Wyczyść"><i class="fas fa-eraser"></i></button>
					<button class="btn primary select_btn"><i class="fas fa-image"></i> <i class="fas fa-plus"></i></button>
				</div>
			`
		);

		const img = input._child("img");
		const select_btn = input._child(".select_btn");
		const change_btn = input._child(".change_btn");
		const preview_btn = input._child(".preview_btn");
		const empty_btn = input._child(".empty_btn");

		let setting_value = false;

		img.addEventListener("change", () => {
			const value = img._get_value();
			const selected = !!value && value != "/src/img/empty_img_147x94.svg";
			if (!setting_value) {
				input._dispatch_change();
			}
			input.classList.toggle("selected", selected);
		});

		const select = () => {
			const select_file_modal = getSelectFileModal();
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

		empty_btn.addEventListener("click", () => {
			input._set_value("");
		});

		preview_btn.addEventListener("click", () => {
			zoomImage(img.dataset.src, { source: input });
		});

		input._get_value = () => {
			return img._get_value();
		};

		input._set_value = (value, options = {}) => {
			setting_value = true;
			img._set_value(value);
			setting_value = false;

			if (!options.quiet) {
				input._dispatch_change();
			}
		};

		input._set_value("", { quiet: true });
	});
}
