/* js[admin_everywhere] */

function setPagePublished(page_id, published) {
	showLoader();
	xhr({
		url: STATIC_URLS["ADMIN"] + "/page/save",
		params: {
			page: {
				page_id,
				active: published,
			},
		},
		success: (res) => {
			hideLoader();
			setPagePublishedCallback(published);

			showNotification("Strona zapisana jako " + (published ? "widoczna" : "ukryta"), { one_line: true, type: "success" });
		},
	});
}

function setPagePublishedCallback(published) {
	document.body.classList.toggle("current_page_published", published);
}
