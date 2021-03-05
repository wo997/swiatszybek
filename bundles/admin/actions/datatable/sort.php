<?php //route[{ADMIN}/datatable/sort]

sortTable($_POST["table"], json_decode($_POST["positions"], true), $_POST["order_key"]);
