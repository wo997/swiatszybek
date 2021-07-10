<?php

/**
 * 
 * @typedef CartProduct {
 * product_id: number
 * qty: number
 * }
 * you can add more props later
 */

class Cart
{
    // save these
    /** @var CartProduct[] */
    private $products;
    /** @var Entity[] RebateCode */
    private $rebate_codes;
    private $delivery_type_id;
    private $carrier_id;
    private $payment_time;
    private $available_carriers;
    private $products_weight_g;
    private $delivery_price;
    private $products_price;

    // other vars
    private $rebate_codes_limit = 1; // that will be a subject to change
    private $max_single_product_count = 1000; // should be a var
    public ?User $user;

    public function __construct($user)
    {
        $this->products = [];
        $this->rebate_codes = [];

        $this->user = $user;
        $this->load();
    }

    public function getProducts()
    {
        return $this->products;
    }

    public function setDeliveryTypeId($delivery_type_id)
    {
        $this->delivery_type_id = intval($delivery_type_id);
    }

    public function getDeliveryTypeId()
    {
        return intval($this->delivery_type_id);
    }

    public function setCarrierId($carrier_id)
    {
        $this->carrier_id = intval($carrier_id);
    }

    public function getCarrierId()
    {
        return intval($this->carrier_id);
    }

    public function setPaymentTime($payment_time)
    {
        $this->payment_time = $payment_time;
    }

    public function getPaymentTime()
    {
        return $this->payment_time;
    }

    public function setDeliveryData()
    {
        $cod_fee = 0;
        if ($this->getPaymentTime() === "cod") {
            $cod_fee = floatval(getSetting(["general", "deliveries", "cod_fee"], 0));
        }

        $cart_product_ids = array_column($this->products, "product_id");

        $anything_to_ship = false;
        $products_weight_g = 0;

        $products_data = [];
        if ($cart_product_ids) {
            $product_ids_string = join(",", $cart_product_ids);
            $product_index = -1;

            $products_data = DB::fetchArr("SELECT weight, length, width, height, product_type
                FROM product p INNER JOIN general_product gp USING(general_product_id) WHERE gp.active AND p.active AND product_id IN ($product_ids_string)");

            $products_dims = [];
            foreach ($products_data as $product_data) {
                $product_index++;

                if ($product_data["product_type"] === "normal") {
                    $anything_to_ship = true;
                } else {
                    continue;
                }

                $cart_product = $this->products[$product_index];

                $qty = $cart_product["qty"];

                for ($i = 0; $i < $qty; $i++) {
                    $products_weight_g += floatval($product_data["weight"]);
                    $products_dims[] = [
                        floatval($product_data["length"]),
                        floatval($product_data["width"]),
                        floatval($product_data["height"])
                    ];
                }
            }
        }

        $this->products_weight_g = $products_weight_g;

        $available_carriers = [];

        if ($anything_to_ship) {
            foreach (DB::fetchArr("SELECT * FROM carrier WHERE active = 1 ORDER BY pos ASC") as $carrier) {
                if (!$carrier["img_url"]) {
                    foreach (EventListener::dispatch("get_carrier_img_set", ["api_key" => $carrier["api_key"]]) as $img_set) {
                        if ($img_set) {
                            $carrier["img_url"] = $img_set["light"];
                        }
                    }
                }

                $dimensions = json_decode($carrier["dimensions_json"], true);

                $dimension_fits = null;

                foreach ($dimensions as $dimension) {
                    $fits = true;

                    $max_weight_kg = $dimension["weight"];
                    if ($max_weight_kg && $products_weight_g > $max_weight_kg * 1000) {
                        $fits = false;
                    } else if ($dimension["length"] && $dimension["width"] && $dimension["height"]) {
                        $fits = putBoxIntoPackage3D([
                            $dimension["length"],
                            $dimension["width"],
                            $dimension["height"],
                        ], $products_dims);
                    }

                    if ($fits) {
                        $dimension_fits = $dimension;
                        break;
                    }
                }

                if ($dimension_fits) {
                    $delivery_price = $dimension_fits["price"];

                    if ($carrier["delivery_type_id"] === 1) {
                        $delivery_price += $cod_fee;
                    }

                    $is_free_from_price = getSetting(["general", "deliveries", "is_free_from_price"], false);
                    if ($is_free_from_price) {
                        $free_shipping_allowed = true;
                        $free_from_price_max_weight_kg = getSetting(["general", "deliveries", "free_from_price_max_weight_kg"], "");
                        if ($free_from_price_max_weight_kg) {
                            if ($this->products_weight_g > $free_from_price_max_weight_kg * 1000) {
                                $free_shipping_allowed = false;
                            }
                        }
                        if ($free_shipping_allowed) {
                            $free_from_price = getSetting(["general", "deliveries", "free_from_price"], 0);
                            if ($free_from_price) {
                                if ($this->products_price >= $free_from_price) {
                                    $delivery_price = 0;
                                }
                            }
                        }
                    }

                    $dimension_fits["price"] = $delivery_price;

                    $carrier["fit_dimensions"] = $dimension_fits;
                    $available_carriers[] = $carrier;
                }
            }
        }

        $this->available_carriers = $available_carriers;

        $this->calculateDeliveryPrice();
    }

    public function getDeliveryFitDimensions()
    {
        foreach ($this->available_carriers as $carrier) {
            if ($carrier["carrier_id"] === $this->carrier_id) {
                return $carrier["fit_dimensions"];
            }
        }

        return null;
    }

    public function calculateDeliveryPrice()
    {
        $delivery_fit_dimensions = $this->getDeliveryFitDimensions();

        $delivery_price = 0;

        if ($delivery_fit_dimensions) {
            $delivery_price = $delivery_fit_dimensions["price"];

            $is_free_from_price = getSetting(["general", "deliveries", "is_free_from_price"], false);
            if ($is_free_from_price) {
                $free_shipping_allowed = true;
                $free_from_price_max_weight_kg = getSetting(["general", "deliveries", "free_from_price_max_weight_kg"], "");
                if ($free_from_price_max_weight_kg) {
                    if ($this->products_weight_g > $free_from_price_max_weight_kg * 1000) {
                        $free_shipping_allowed = false;
                    }
                }
                if ($free_shipping_allowed) {
                    $free_from_price = getSetting(["general", "deliveries", "free_from_price"], 0);
                    if ($free_from_price) {
                        if ($this->products_price >= $free_from_price) {
                            $delivery_price = 0;
                        }
                    }
                }
            }
        }

        $this->delivery_price =  $delivery_price;
    }

    public function getAllData()
    {
        $cart_product_ids = array_column($this->products, "product_id");

        $products_price = 0;

        $products_data = [];
        if ($cart_product_ids) {
            $product_ids_string = join(",", $cart_product_ids);

            $products_data = DB::fetchArr("SELECT product_id, general_product_id, net_price, gross_price, __current_gross_price, p.__img_url img_url, p.__name name, p.__url url, p.stock, p.sell_by, p.base_unit, p.qty_step, 0 as qty
                FROM product p INNER JOIN general_product gp USING(general_product_id) WHERE gp.active AND p.active AND product_id IN ($product_ids_string) ORDER BY FIELD(product_id,$product_ids_string)");

            $product_ids_found = array_column($products_data, "product_id");

            $any_change = false;
            foreach ($this->products as $ind => $product) {
                if (!in_array($product["product_id"], $product_ids_found)) {
                    array_splice($this->products, $ind, 1);
                    array_splice($products_data, $ind, 1);
                    $any_change = true;
                }
            }
            if ($any_change) {
                $this->save();
            }

            $product_index = -1;
            foreach ($products_data as $key => $product_data) {
                $product_index++;

                $cart_product = $this->products[$product_index];

                $price = $product_data["__current_gross_price"];

                $products_price += $cart_product["qty"] * $price;

                $products_data[$key]["qty"] = $cart_product["qty"];
            }
        }

        $this->products_price = $products_price;

        $this->setDeliveryData();

        $total_price = $this->products_price;

        // subtract statics first
        foreach ($this->rebate_codes as
            /** @var Entity RebateCode */
            $rebate_code) {
            $value = $rebate_code->getProp("value");
            if (strpos($value, "%") === false) {
                $total_price -= floatval($value);
            }
        }

        // then relatives, so u can save some cents
        foreach ($this->rebate_codes as
            /** @var Entity RebateCode */
            $rebate_code) {
            $value = $rebate_code->getProp("value");
            if (strpos($value, "%") !== false) {
                $percent = floatval(str_replace("%", "", $value));
                $total_price *= 1 - ($percent * 0.01);
            }
        }

        $total_price += $this->delivery_price;

        $allow_cod = getSetting(["general", "deliveries", "allow_cod"]);
        $cod_from_price = getSetting(["general", "deliveries", "cod_from_price"], 0);
        if ($this->products_price < $cod_from_price) {
            $allow_cod = false;
        }

        $cod_fee = $this->delivery_price ? getSetting(["general", "deliveries", "cod_fee"]) : 0;

        return [
            "products" => $products_data,
            "products_price" => roundPrice($this->products_price),
            "delivery_price" => roundPrice($this->delivery_price),
            "total_price" => roundPrice($total_price),
            "rebate_codes" => array_map(fn ($x) => filterArrayKeys($x->getSimpleProps(), ["code", "value"]), $this->rebate_codes),
            "delivery_type_id" => $this->getDeliveryTypeId(),
            "carrier_id" => $this->getCarrierId(),
            "available_carriers" => $this->available_carriers,
            "allow_cod" => $allow_cod,
            "payment_time" => $this->getPaymentTime(),
            "cod_fee" => $cod_fee,
        ];
    }

    public function changeProductQty($product_id, $qty_diff)
    {
        $product_qty = $this->getProductQty($product_id);
        $this->setProductQty($product_id, $product_qty + $qty_diff);
    }

    public function getProductQty($product_id)
    {
        foreach ($this->products as
            $product) {
            if ($product["product_id"] == $product_id) {
                return intval($product["qty"]);
            }
        }

        return 0;
    }

    /**
     * @param  number $product_id
     * @return void
     */
    public function removeProduct($product_id)
    {
        $this->setProductQty($product_id, 0);
    }

    /**
     * @param  number $product_id
     * @param  number $qty
     * @return void
     */
    public function setProductQty($product_id, $qty)
    {
        $product_id = intval($product_id);
        $qty = min(intval($qty), $this->max_single_product_count);

        $match_product_index = -1;

        $index = -1;
        foreach ($this->products as
            $product) {
            $index++;
            if ($product["product_id"] == $product_id) {
                $match_product_index = $index;
                break;
            }
        }

        if ($match_product_index === -1 && $qty > 0) {
            $match_product =
                /** @var CartProduct */
                ["product_id" => $product_id, "qty" => 0];
            $this->products[] = $match_product;
            $match_product_index = count($this->products) - 1;
        }

        if ($match_product_index !== -1) {
            if ($qty === 0) {
                array_splice($this->products, $match_product_index, 1);
            } else {
                $product_id = $this->products[$match_product_index]["product_id"];
                $stock = DB::fetchVal("SELECT stock FROM product WHERE product_id = $product_id");
                $qty = min($qty, $stock);
                if ($qty <= 0) {
                    array_splice($this->products, $match_product_index, 1);
                } else {
                    $this->products[$match_product_index]["qty"] = $qty;
                }
            }
        }
    }

    /**
     * activateRebateCode
     *
     * @param  string $code
     * @return array
     */
    public function activateRebateCode($code)
    {
        if (count($this->rebate_codes) >= $this->rebate_codes_limit) {
            $res["errors"][] = "Maksymalna ilość kodów rabatowych: " . $this->rebate_codes_limit;
            return $res;
        }

        $data = $this->rebateCodeValidData($code);
        if ($data["success"]) {
            /** @var Entity RebateCode */
            $rebate_code = $data["data"];
            $code = $rebate_code->getProp("code");
            if (in_array($code, $this->getActiveRebateCodes())) {
                $res["errors"][] = "Kod $code został już użyty";
                return $res;
            } else {
                $this->rebate_codes[] = $data["data"];
            }
        }

        return $data;
    }

    /**
     *
     * @param  string $code
     * @return array
     */
    public function deactivateRebateCode($code)
    {
        foreach ($this->rebate_codes as $key =>
            /** @var Entity RebateCode */
            $rebate_code) {
            if ($rebate_code->getProp("code") === $code) {
                unset($this->rebate_codes[$key]);
            }
        }
        $this->rebate_codes = array_values($this->rebate_codes);
    }

    /**
     * @typedef ValidationResponse {
     * errors: array
     * success: boolean
     * is_info?: boolean
     * data?: array
     * }
     */

    public function rebateCodeValidData($code)
    {
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false,
            ];

        $rebate_code_id = DB::fetchVal("SELECT rebate_code_id FROM rebate_code WHERE code LIKE ?", [$code]);
        if (!$rebate_code_id) {
            $res["errors"][] = "Niepoprawny kod rabatowy";
            return $res;
        }

        $rebate_code = EntityManager::getEntityById("rebate_code", $rebate_code_id);

        if ($rebate_code->getProp("qty") <= 0) {
            $res["errors"][] = "Kod nie jest już dostępny";
        } else {
            $now = strtotime(date("Y-m-d"));
            $available_from = $rebate_code->getProp("available_from");
            if ($available_from && $now < strtotime($available_from)) {
                $res["errors"][] = "Kod będzie dostępny od $available_from";
            }
            $available_till = $rebate_code->getProp("available_till");
            if ($available_till && $now > strtotime($available_till)) {
                $res["errors"][] = "Kod utracił ważność $available_till";
            }
            $general_products = json_decode($rebate_code->getProp("general_products_json"), 1);
            if ($general_products) {
                $required_products_html = [];
                foreach ($general_products as $general_product) {
                    $general_product_id = $general_product["general_product_id"];
                    $qty = $general_product["qty"];

                    $sum_products = 0;
                    $product_ids = DB::fetchCol("SELECT product_id FROM product WHERE general_product_id = ?", [$general_product_id]);

                    foreach ($this->products as $product) {
                        if (in_array($product["product_id"], $product_ids)) {
                            $sum_products += intval($product["qty"]);
                        }
                    }

                    if ($sum_products < $qty) {
                        $general_product_data = DB::fetchRow("SELECT name, __url FROM general_product WHERE general_product_id = ?", [$general_product_id]);
                        $required_products_html[] = "<a class=\"link\" href=\"" . $general_product_data["__url"] . "\">"
                            . $general_product_data["name"] . ($qty ? " × $qty szt." : "")
                            . "  </a>";
                    }
                }

                if ($required_products_html) {
                    $cnt = count($required_products_html);
                    if ($cnt === 1) {
                        $res["errors"][] = "Wymagany produkt:<br>" . $required_products_html[0];
                    } else {
                        $res["errors"][] = "Wymagane produkty:<br>" . join("<br>", $required_products_html);
                    }
                }
            }
        }

        if (!count($res["errors"])) {
            $res["success"] = true;
            $res["data"] = $rebate_code;
        }

        return $res;
    }

    /**
     * getActiveRebateCodes
     *
     * @return string[]
     */
    public function getActiveRebateCodes()
    {
        return array_map(fn ($x) => $x->getProp("code"), $this->rebate_codes);
    }

    public function empty()
    {
        $this->products = [];
    }

    public function save()
    {
        $cart_data = [];
        $cart_data["products"] = $this->getProducts();
        $cart_data["rebate_codes"] = $this->getActiveRebateCodes();
        $cart_data["delivery_type_id"] = $this->getDeliveryTypeId();
        $cart_data["carrier_id"] = $this->getCarrierId();
        $cart_data["payment_time"] = $this->getPaymentTime();

        $cart_json = json_encode($cart_data);

        $_SESSION["current_user_cart_json"] = $cart_json;
        setcookie("current_user_cart_json", $cart_json, (time() + 31536000), "/");

        $user_id = $this->user->getId();
        if ($user_id) {
            DB::execute("UPDATE user SET cart_json = ? WHERE user_id = $user_id", [$cart_json]);
        }
    }

    public function load()
    {
        $user_id = $this->user->getId();

        if ($user_id) {
            $cart_json = DB::fetchVal("SELECT cart_json FROM user WHERE user_id = $user_id");
        }
        if (!$cart_json && isset($_SESSION["current_user_cart_json"])) {
            $cart_json = $_SESSION["current_user_cart_json"];
        }
        if (!$cart_json && isset($_COOKIE["current_user_cart_json"])) {
            $cart_json = $_COOKIE["current_user_cart_json"];
        }

        $cart_data = json_decode($cart_json, true);

        $this->products = def($cart_data, "products", []);
        $this->delivery_type_id = def($cart_data, "delivery_type_id", -1);
        $this->carrier_id = def($cart_data, "carrier_id", -1);
        $this->payment_time = def($cart_data, "payment_time", "prepayment");

        $any_failed = false;
        foreach (def($cart_data, "rebate_codes", []) as $code) {
            if (!$this->activateRebateCode($code)["success"]) {
                $any_failed = true;
            }
        }

        if ($any_failed) {
            $this->save();
        }
    }
}
