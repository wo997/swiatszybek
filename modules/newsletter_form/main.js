function sendNews(form) {
	form = $(form);
	var email = form.email.value;

	if (email == "") {
		form.find(".uzupelnij").style.display = "inline-block";
		return;
	}

	xhr({
		url: "/newsletter_invite",
		params: {
			email: email,
		},
		success: () => {
			form.style.opacity = "0";
			form.style.maxHeight = "0";
			form.style.marginBottom = "145px";
		},
	});
}
