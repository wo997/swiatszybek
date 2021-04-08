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
    private $products;
    /** @var Entity[] RebateCode */
    private $rebate_codes;
    private $delivery_type_id;

    // other vars
    private $rebate_codes_limit = 2; // that will be a subject to change
    private $max_single_product_count = 10; // should be a var
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
        $this->delivery_type_id = $delivery_type_id;
    }

    public function getDeliveryTypeId()
    {
        return intval($this->delivery_type_id);
    }

    public function getDeliveryPrice()
    {
        if ($this->delivery_type_id <= 0) {
            return 0;
        }
        return $this->delivery_type_id * 10;
    }

    public function getAllData()
    {
        $cart_product_ids = array_column($this->products, "product_id");

        $products_price = 0;

        $products_data = [];
        if ($cart_product_ids) {
            $product_ids_string = join(",", $cart_product_ids);
            $product_index = -1;

            $products_data = DB::fetchArr("SELECT product_id, general_product_id, net_price, gross_price, __img_url img_url, __name name, __url url, stock, 0 as qty
                FROM product WHERE product_id IN ($product_ids_string) ORDER BY FIELD(product_id,$product_ids_string)");

            $product_ids_found = array_column($products_data, "product_id");
            if (count($product_ids_found) !== count($cart_product_ids)) {
                $this->products = array_filter($this->products, fn ($x) => in_array($x["product_id"], $product_ids_found));
                $this->save();
            }

            foreach ($products_data as $key => $product_data) {
                $product_index++;

                $cart_product =
                    /** @var CartProduct */
                    $this->products[$product_index];

                $price = $product_data["gross_price"];

                $products_price += $cart_product["qty"] * $price;

                $products_data[$key]["qty"] = $cart_product["qty"];
            }
        }

        $delivery_price = $this->getDeliveryPrice();

        $total_price = $products_price;

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

        $total_price += $delivery_price;

        return [
            "products" => $products_data,
            "products_price" => roundPrice($products_price),
            "delivery_price" => roundPrice($delivery_price),
            "total_price" => roundPrice($total_price),
            "rebate_codes" => array_map(fn ($x) => filterArrayKeys($x->getSimpleProps(), ["code", "value"]), $this->rebate_codes),
            "delivery_type_id" => $this->getDeliveryTypeId(),
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
            /** @var CartProduct */
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

        /** @var CartProduct */
        $match_product_index = -1;

        $index = -1;
        foreach ($this->products as
            /** @var CartProduct */
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
                $this->products[$match_product_index]["qty"] = $qty;
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
        }

        // TODO: limit by price etc ezy

        // ...

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
