<?php

function getShopName()
{
    return getSetting(["general", "company", "shop_name"], "");
}
