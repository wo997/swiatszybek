<?php

chdir("../../");

include "kernel.php";
foreach (fetchColumn("SELECT product_id FROM products") as $product_id) {
    triggerEvent("product_rating_change", ["product_id" => $product_id]);
}
