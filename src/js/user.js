/* js[global] */

// keep connected
setInterval(() => {
  xhr({
    url: "/ping.php",
  });
}, 60000);

function logout() {
  if (USER_TYPE == "f") {
    window.location = "/logout";
    return false;
  }
  if (USER_TYPE == "g") {
    try {
      var auth2 = gapi.auth2.getAuthInstance();
      auth2.signOut().then(function () {
        window.location = "/logout";
      });
      auth2.disconnect();
    } catch (error) {
      console.log(error);
      window.location = "/logout";
    }
    return false;
  }
}

function onSignIn(googleUser) {
  var form = $("#google-form");
  if (IS_LOGGED || !form) return;

  var id_token = googleUser.getAuthResponse().id_token;
  if (!id_token) return;

  form.id_token.value = id_token;
  form.submit();
}

// requires login_form included
function login() {
  const loginForm = $(`#loginForm`);

  if (!validateForm(loginForm)) {
    return;
  }

  xhr({
    url: "/login",
    params: getFormData(loginForm),
    success: (res) => {
      if (res.message && res.error_field_name) {
        showFieldErrors(loginForm.find(`[name="${res.error_field_name}"]`), [
          res.message,
        ]);
      }
    },
  });
}
