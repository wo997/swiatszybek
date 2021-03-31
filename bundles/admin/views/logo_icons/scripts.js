/* js[view] */

document.addEventListener("click", (ev) => {
	const target = $(ev.target);

	const upload_img_btn = target._parent(".upload_img_btn");
	if (upload_img_btn) {
		getSelectFileModal()._nodes.file_manager._show_upload_modal(
			{
				copy_name: upload_img_btn.dataset.upload_name,
				label: upload_img_btn.dataset.upload_label,
				callback: () => {
					window.location.reload();
				},
			},
			{ source: upload_img_btn }
		);
	}
});
