/* js[view] */

domload(() => {
	/** @type {FileManagerComp} */
	// @ts-ignore
	const file_manager_comp = $("file-manager-comp.files");

	fileManagerComp(file_manager_comp, undefined);
});
