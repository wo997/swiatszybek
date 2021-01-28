<?php //route[cancel_email_change_request]

DB::execute("UPDATE users SET email_request = NULL WHERE user_id = " . intval(User::getCurrent()->isLoggedIn()));
