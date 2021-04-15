/* js[view] */

domload(() => {
	/** @type {FileManagerComp} */
	// @ts-ignore
	const file_manager_comp = $("file-manager-comp.files");

	FileManagerComp(file_manager_comp, undefined);

	if (typeof new URL(window.location.href).searchParams.get("przeslij") === "string") {
		file_manager_comp._show_upload_modal();
	}

	$(".main_header").appendChild(file_manager_comp._child(".custom_toolbar"));
});
