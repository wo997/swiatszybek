<?php 

require "get_basket_data.php";

$nr = 0;
$res = "";
foreach ($basket_ids as $variant_id)
{
    $v = $app["user"]["basket"]["variants"][array_search($variant_id,$app["user"]["basket"]["variant_id_list"])];
    $product_id = $v["product_id"];
    $title = $v["title"];
    $name = $v["name"];
    $zdjecie = $v["zdjecie"];
    $price = $v["real_price"];
    $total_price = $v["total_price"];
    $quantity = $v["quantity"];
    $stock = $v["stock"];
    $zdjecie = $v["zdjecie"];

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

    $link = getLink($title);

    if (!empty($name))
        $title .= " ".$name;

    $remove = "<button class='removeBtn' type='button' onclick='addItem(-1,$variant_id)'>-</button>";
    $add = $quantity < $stock ?
            "<button class='addBtn' type='button' onclick='addItem(1,$variant_id)'>+</button>"
            : "<button type='button' style='visibility:hidden'>+</button>";

    $product_link = getProductLink($v["product_id"],$v["link"]);

    $res .= "<tr data-variant_id='$variant_id'>
                <td><img src='/uploads/df/$zdjecie' style='max-width:130px;display:block;margin:auto'></td>
                <td><a class='linkable' target='_blank' href='$product_link'>$title</a></td>
                <td class='pln oneline' style='font-weight:normal'><label>Cena:</label> $price zł</td>
                <td class='oneline' data-stock='$stock'>$remove $quantity szt. $add</td>
                <td class='pln oneline'><label>Suma:</label> $total_price zł</td>
            </tr>";
    }
    if ($nr > 0) {
    $res .= "</table>";
}