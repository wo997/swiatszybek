<?php //route[login]

$login_res = User::getCurrent()->login($_POST["email"], $_POST["password"]);
json_response($login_res);

// the user should reload after displaying a green info yayayaya
// if ($login_res["errors"]) {
// } else {
//     reload();
// }

// $posts = ["password", "email"];

// foreach ($posts as $p) {
//     if (!isset($_POST[$p]))
//         die;
// }

// $response = [];
// // if (strpos($_SERVER["HTTP_REFERER"], "/zakup") !== false) {
// //   $_SESSION["redirect"] = "/zakup";
// // }

// $password = $_POST["password"];
// $email = $_POST["email"];

// $user_data = DB::fetchRow("SELECT * FROM `users` WHERE user_type = 'regular' AND email = ?", [$email]);
// if (!$user_data) {
//     $response["message"] = "Takie konto nie istnieje";
//     $response["error_field_name"] = "email";
//     json_response($response);
// }
// if (!password_verify($password, $user_data["password_hash"])) {
//     $response["message"] = "Niepoprawne hasło";
//     $response["error_field_name"] = "password";
//     json_response($response);
// }
// if (!$user_data["authenticated"]) {
//     $response["message"] = "Konto nie zostało aktywowane";
//     $response["error_field_name"] = "email";
//     json_response($response);
// }

// $remember_me = def($_POST, "remember_me", 0);

// if ($remember_me) {
//     $remember_me_token = $user_data["user_id"] . "-" . generateAuthenticationToken();
//     setcookie("remember_me_token", $remember_me_token, time() + 3600 * 24 * 30);
//     DB::execute("UPDATE users SET remember_me_token = ? WHERE user_id = " . intval($user_data["user_id"]), [$remember_me_token]);
// }

// loginUser($user_data["user_id"], $user_data["email"], "regular", ["name" => $user_data["email"]]);
