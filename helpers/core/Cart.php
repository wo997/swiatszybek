<?php

/**
 * @typedef CartProduct {
                                 * product_id: number
 * qty: number
 * }
 * you can add more props later
 */

class Cart
{
    private $products;
    private $products_data;
    private $rebate_codes; // all
    private $rebate_codes_codes = []; // just strings
    private $rebate_codes_limit = 1; // that will be a subject to change
    private $products_price;
    private $final_price;

    public function __construct($user_id = null)
    {
        $this->products = [];
        $this->rebate_codes = [];

        if ($user_id) {
            $this->loadCart($user_id);
        }
    }

    public function getProducts()
    {
        return $this->products;
    }

    public function getAllData()
    {
        $product_ids = [];
        foreach ($this->products as
            /** @var CartProduct */
            $product) {
            $product_ids[] = $product["product_id"];
        }

        $final_price = 0;

        $products_data = [];
        if ($product_ids) {
            $product_ids_string = join(",", $product_ids);
            $product_index = -1;

            // watch out not to send vulnerable data
            $products_data = DB::fetchArr("SELECT product_id, net_price, gross_price, __img_url, __name FROM product WHERE product_id IN ($product_ids_string) ORDER BY FIELD(product_id,$product_ids_string)");

            foreach ($products_data as $product_data) {
                $product_index++;

                $cart_product =
                    /** @var CartProduct */
                    $this->products[$product_index];

                $price = $product_data["gross_price"];

                $final_price += $cart_product["qty"] * $price;
            }
        }
        $this->final_price = $final_price;

        return [
            "products" => $this->products,
            "products_data" => $products_data,
            "final_price" => $this->final_price,
            "rebate_codes" => $this->rebate_codes_codes
        ];
    }

    // public function getFinalPrice()
    // {
    //     foreach ($this->products as $product) {
    //         //$product[""]
    //     }
    //     $this->final_price = 0;
    //     return $this->final_price;
    // }

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

    public function setProductQty($product_id, $qty)
    {
        $product_id = intval($product_id);
        $qty = intval($qty);

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

        if ($match_product_index === -1) {
            $match_product =
                /** @var CartProduct */
                ["product_id" => $product_id, "qty" => 0];
            $this->products[] = $match_product;
            $match_product_index = count($this->products) - 1;
        }

        if ($match_product_index !== -1) {
            $product_id = $this->products[$match_product_index]["product_id"];
            $stock = DB::fetchVal("SELECT stock FROM product WHERE product_id = $product_id");
            $qty = min($qty, $stock);
            $this->products[$match_product_index]["qty"] = $qty;
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
            $res["errors"][] = "Niepoprawny kod rabatowy";
            return $res;
        }

        $data = $this->rebateCodeValidData($code);
        if ($data["success"]) {
            $this->rebate_codes[] = $data["data"];
            $this->rebate_codes_codes[] = $data["data"]["code"];
        }

        return $data;
    }

    /**
     * @typedef ValidationResponse {
     * errors: array
     * success: boolean
     * is_info?: boolean
     * data?: array
     * }
     */

    public function rebateCodeValidData()
    {
        // LIKE should take care of lower upper cases :)
        // DB::fetchRow("SELECT * FROM rebate_code WHERE rebate_code LIKE ", );
        $rebate_code_data = ["code" => "PREMIERA123", "qty" => "4", "available_from" => "2020-12-05"];
        $res =
            /** @var ValidationResponse */
            [
                "errors" => [],
                "success" => false,
            ];

        if (!$rebate_code_data) {
            $res["errors"][] = "Niepoprawny kod rabatowy";
            return $res; // early return lol
        }

        if ($rebate_code_data["qty"] <= 0) {
            $res["errors"][] = "Kod został wykorzystany";
        }

        // limit by price etc ezy

        // ...

        if (!count($res["errors"])) {
            $res["success"] = true;
            $res["data"] = $rebate_code_data;
        }

        return $res;
    }

    public function saveCart()
    {
        $cart_data = [];
        $cart_data["products"] = $this->products;
        $cart_data["rebate_codes"] = $this->rebate_codes_codes;

        $cart_json = json_encode($cart_data);

        $_SESSION["current_user_cart_json"] = $cart_json;
        setcookie("current_user_cart_json", $cart_json, (time() + 31536000), "/");

        $curr_user_id = User::getCurrent()->getId();
        if ($curr_user_id) {
            DB::execute("UPDATE user SET cart_json = ? WHERE user_id = $curr_user_id", [$cart_json]);
        }
    }

    public function loadCart($user_id)
    {
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

        $any_failed = false;
        foreach (def($cart_data, "rebate_codes", []) as $code) {
            if (!$this->activateRebateCode($code)["success"]) {
                $any_failed = true;
            }
        }

        if ($any_failed) {
            $this->saveCart();
        }
    }
}
