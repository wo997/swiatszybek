function sendContact(form) {
  form = $(form);
  var name = form.name.value;
  var email = form.email.value;
  var subject = form.subject.value;
  var message = form.message.value;

  if (name == "" || email == "" || subject == "" || message == "") {
    form.find(".uzupelnij").style.display = "inline-block";
    return;
  }

  xhr({
    url: "/kontakt-mail.php",
    params: {
      name: name,
      email: email,
      subject: subject,
      message: message,
    },
    success: () => {
      form.style.opacity = "0";
      form.style.maxHeight = "0";
      form.style.marginBottom = "100px";
    },
  });
}
