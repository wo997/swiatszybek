function sendNews(form)
{
  var email = form.email.value;

  if (email == "")
  {
    form.querySelector(".uzupelnij").style.display = "inline-block";
    return;
  }

  xhr({
    url: '/newsletter_invite',
    params: {
      email: email
    },
    success: ()=>{
      form.style.opacity = "0";
      form.style.maxHeight = "0";
      form.style.marginBottom = "145px";
    }
  });
}