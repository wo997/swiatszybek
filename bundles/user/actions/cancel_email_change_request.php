<?php //route[cancel_email_change_request]

query("UPDATE users SET email_request = NULL WHERE user_id = " . intval($app["user"]["id"]));
