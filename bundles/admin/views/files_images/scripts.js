/* js[view] */

domload(() => {
	/** @type {FileManagerComp} */
	// @ts-ignore
	const file_manager_comp = $("file-manager-comp.files");

	fileManagerComp(file_manager_comp, undefined);

	const upload_btn = $(".custom-toolbar .upload_btn");
	upload_btn.addEventListener("click", () => {
		file_manager_comp._show_upload_modal({ source: upload_btn });
	});

	if (typeof new URL(window.location.href).searchParams.get("przeslij") === "string") {
		upload_btn.click();
	}
});
