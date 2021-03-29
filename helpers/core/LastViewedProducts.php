<?php

class LastViewedProducts
{
    private static $limit = 50;
    private $general_product_ids;
    public ?User $user;

    public function __construct($user)
    {
        $this->general_product_ids = [];
        $this->user = $user;
        $this->load();
    }

    public function save()
    {
        $last_viewed_products_json = json_encode($this->general_product_ids);

        $_SESSION["current_user_last_viewed_products_json"] = $last_viewed_products_json;
        setcookie("current_user_last_viewed_products_json", $last_viewed_products_json, (time() + 31536000), "/");

        $user_id = $this->user->getId();
        if ($user_id) {
            DB::execute("UPDATE user SET last_viewed_products_json = ? WHERE user_id = $user_id", [$last_viewed_products_json]);
        }
    }

    public function load()
    {
        $user_id = $this->user->getId();

        if ($user_id) {
            $last_viewed_products_json = DB::fetchVal("SELECT last_viewed_products_json FROM user WHERE user_id = $user_id");
        }
        if (!$last_viewed_products_json && isset($_SESSION["current_user_last_viewed_products_json"])) {
            $last_viewed_products_json = $_SESSION["current_user_last_viewed_products_json"];
        }
        if (!$last_viewed_products_json && isset($_COOKIE["current_user_last_viewed_products_json"])) {
            $last_viewed_products_json = $_COOKIE["current_user_last_viewed_products_json"];
        }

        $last_viewed_products = json_decode($last_viewed_products_json, true);
        if (!$last_viewed_products) {
            $last_viewed_products = [];
        }

        $this->general_product_ids = $last_viewed_products;
    }

    public function add($general_product_ids)
    {
        foreach ($general_product_ids as $general_product_id) {
            while (true) {
                $last_viewed_product_index = array_search($general_product_id, $this->general_product_ids);
                if ($last_viewed_product_index === false) {
                    break;
                }
                array_splice($this->general_product_ids, $last_viewed_product_index, 1);
            }
            array_unshift($this->general_product_ids, $general_product_id);
        }

        if (count($this->general_product_ids) > self::$limit) {
            array_splice($this->general_product_ids, self::$limit);
        }

        $this->save();
    }

    public function getProductsData()
    {
        if (!$this->general_product_ids) {
            return [];
        }

        $general_product_ids_csv = join(",", $this->general_product_ids);

        return DB::fetchArr("SELECT general_product_id, __img_url img_url, name, __url url
            FROM general_product WHERE general_product_id IN ($general_product_ids_csv) ORDER BY FIELD(general_product_id,$general_product_ids_csv)");
    }
}
