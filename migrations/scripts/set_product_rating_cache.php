<?php

chdir("../../");

include "kernel.php";
foreach (fetchColumn("SELECT product_id FROM products") as $product_id) {
    $input = ["product_id" => $product_id];
    include 'events/rating_change.php';
}