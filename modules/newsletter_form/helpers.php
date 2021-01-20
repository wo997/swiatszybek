<?php
$hasNewsletter = DB::fetchRow("SELECT accepted FROM `newsletter` WHERE email LIKE ? LIMIT 1", [$app["user"]["email"]]);
