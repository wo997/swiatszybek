<?php 

require_once "get_basket_data.php";

$nr = 0;
$res = "";

foreach($app["user"]["basket"]["variants"] as $basket_variant) {
    $v = $basket_variant;
    $quantity = $v["quantity"];
    $stock = $v["stock"];

    if ($nr == 0) {
        $res .= "<table class='item-list item-list-full'><tr style='background: #60d010;color: white;'>
        <td>Produkt</td>
        <td></td>
        <td>Cena</td>
        <td>Ilość</td>
        <td>Suma</td>
        </tr>";
    }
    $nr++;

    $remove = "<button class='removeBtn' type='button' onclick='addItem(-1,".$v["variant_id"].")'>-</button>";
    $add = $quantity < $stock ?
            "<button class='addBtn' type='button' onclick='addItem(1,".$v["variant_id"].")'>+</button>"
            : "<button type='button' style='visibility:hidden'>+</button>";

    $res .= "<tr data-variant_id='".$v["variant_id"]."'>
                <td><img src='/uploads/df/".$v["zdjecie"]."' style='max-width:130px;display:block;margin:auto'></td>
                <td><a class='linkable' href='".getProductLink($v["product_id"],$v["link"])."'>".$v["title"]." ".$v["name"]."</a></td>
                <td class='pln oneline' style='font-weight:normal'><label>Cena:</label> ".$v["real_price"]." zł</td>
                <td class='oneline' data-stock='$stock'>$remove $quantity szt. $add</td>
                <td class='pln oneline'><label>Suma:</label> ".$v["total_price"]." zł</td>
            </tr>";
    }
    if ($nr > 0) {
    $res .= "</table>";
}