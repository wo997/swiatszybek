<?php //route[aktywuj]

$user_id = urlParam(1);
$authentication_token = urlParam(2);

DB::execute("UPDATE users SET authenticated = 1, stworzono = NOW() WHERE user_id = ? AND authentication_token = ?", [
    $user_id, $authentication_token
]);

$user_data = DB::fetchRow("SELECT email, authenticated FROM users WHERE user_id = ?", [$user_id]);

if ($user_data["authenticated"] == "1") {
    $response_footer = "
    <button class='btn success medium hide_case_logged_in' onclick='showModal(\"loginForm\",{source:this});hideParentModal(this)'>
      Zaloguj się <i class='fas fa-user'></i>
    </button>
    <button class='btn subtle medium' onclick='hideParentModal(this)'>
      Zamknij <img class='cross-icon' src='/src/img/cross.svg'>
    </button>
  ";
    $response_body = MESSAGE_HEADER_SUCCESS
        . "<div class='default-message-text'>Konto "
        . $user_data["email"] . "<br>zostało aktywowane</div>";
} else {
    $response_footer = MESSAGE_OK_BUTTON;
    $response_body = MESSAGE_HEADER_ERROR . "<div class='default-message-text'>Wystąpił błąd aktywacji konta</div>";
}

$_SESSION["message_modal"] = $response_body . "<div class='message-footer'>$response_footer</div>";
redirect("/");
