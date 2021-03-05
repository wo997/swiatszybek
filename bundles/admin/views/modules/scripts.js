/* js[view] */

domload(() => {
	window.module_form = $(".module_info");

	var html = "";

	for (let module_name in app_modules) {
		var module = app_modules[module_name];
		html += `
                <div class="btn subtle" onclick="selectModule(this, '${module_name}')">${module.icon} <span>${module.title}</span></div>
            `;
	}

	$(".module_list")._set_content(html);
});

function getModuleFormData() {
	return {
		form_data: getFormData(module_form),
		module_name: window.module_name,
	};
}

function saveModuleSettings() {
	xhr({
		url: STATIC_URLS["ADMIN"] + "/save_module_settings",
		params: getModuleFormData(),
		success: (res) => {},
	});
}

function selectModule(btn, module_name) {
	window.module_name = module_name;
	$$(".module_list .btn").forEach((e) => {
		e.classList.toggle("primary", e === btn);
		e.classList.toggle("subtle", e !== btn);
	});

	var form = $(".module_info");

	xhr({
		url: STATIC_URLS["ADMIN"] + "/module_form",
		params: {
			module_name: module_name,
		},
		success: (res) => {
			var module = app_modules[module_name];

			var output = "";
			if (module.title) {
				output += `<h2 class='header'>${module.title} ${module.version ? `v${module.version}` : ""}</h2>`;
			}
			if (module.description) {
				output += `<div class='header'>Opis modułu: ${module.description}</div>`;
			}
			if (module.version) {
				output += `<div>${module.version}</div>`;
			}
			output += res.form;

			form._set_content(output);
			setFormData(res.form_data, form);
		},
	});
}
