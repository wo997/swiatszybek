function sendNews(form) {
	form = $(form);
	var email = form.email.value;

	if (email == "") {
		form._child(".uzupelnij").style.display = "inline-block";
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
