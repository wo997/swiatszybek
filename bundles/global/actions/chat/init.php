<?php //route[/chat/init]

Request::jsonResponse(["admin_img" => FAVICON_PATH_LOCAL, "chatter_label" => getShopName()]);
