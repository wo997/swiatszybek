<?php //route[basket_action]

User::getCurrent()->cart->changeProductQty($_POST["product_id"], $_POST["qty_diff"]);

//Request::jsonResponse(User::getCurrent()->cart->);
