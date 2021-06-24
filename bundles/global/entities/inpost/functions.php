<?php //hook[helper]

class InPostApi
{
    private $hostLive = "https://api-shipx-pl.easypack24.net/";
    private $hostSandbox = "https://sandbox-api-shipx-pl.easypack24.net/";
    public $organizationId;
    private $apiToken;
    private $isSandbox;

    public function __construct($organizationId, $apiToken, $isSandbox = false)
    {
        $this->organizationId = $organizationId;
        $this->apiToken = $apiToken;
        $this->isSandbox = $isSandbox;

        if ($this->isSandbox) {
            $this->hostLive = $this->hostSandbox;
        }
    }

    /** @var InPostApi */
    private static $inpost_api;
    public static $settings;

    public static function get()
    {
        if (!self::$inpost_api) {
            self::$settings = getSetting(["general", "delivery_integrations"]);
            self::$inpost_api = new InPostApi(
                def(self::$settings, "inpost_organization_id"),
                def(self::$settings, "inpost_token"),
                def(self::$settings, "inpost_test_mode"),
            );
        }

        return self::$inpost_api;
    }

    public function call(String $url, $type = "GET", $params = null)
    {
        $ch = curl_init($this->hostLive . $url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Host: api-shipx-pl.easypack24.net",
            "Content-Type: application/json",
            "Authorization: Bearer " . $this->apiToken
        ]);
        if ($type == "POST") {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($params));
        } else if ($type == "DELETE") {
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "DELETE");
        }

        $res = curl_exec($ch);

        $json = json_decode($res, true);
        if ($json) $res = $json;

        return $res;
    }


    // public function registerShipmentPaczkomat($params)
    // {
    //     return $this->call("v1/organizations/{$this->organizationId}/shipments", "POST", [
    //         "receiver" => [
    //             "phone" => $params["phone"],
    //             "email" => $params["email"]
    //         ],
    //         "sender" => $inpost_sender,
    //         "parcels" => [
    //             "template" => $params["size"]
    //         ],
    //         "custom_attributes" => [
    //             "target_point" => $params["parcel"]
    //         ],
    //         //"status" => "created", // created, offers_prepared albo offer_selected !!! confirmed by itself after half a second
    //         "service" => "inpost_locker_standard",
    //         "reference" => $params["order_reference"],
    //         "insurance" => [
    //             "amount" => $params["insurance"],
    //             "currency" => "PLN"
    //         ],
    //         "end_of_week_collection" => $params["end_of_week_collection"]
    //     ]);
    // }

    // public function registerShipmentKurier($params)
    // {
    //     return $this->call("v1/organizations/{$this->organizationId}/shipments", "POST", [
    //         "receiver" =>  [
    //             "company_name" => $params["company_name"],
    //             "first_name" => $params["first_name"],
    //             "last_name" => $params["last_name"],
    //             "phone" => $params["phone"],
    //             "email" => $params["email"],
    //             "address" => [
    //                 "street" => $params["street"],
    //                 "building_number" => $params["building_number"],
    //                 "city" => $params["city"],
    //                 "post_code" => $params["post_code"],
    //                 "country_code" => "PL"
    //             ],
    //         ],
    //         "sender" => $inpost_sender,
    //         "parcels" => [
    //             "template" => $params["size"]
    //         ],
    //         "service" => "inpost_courier_standard",
    //         "reference" => $params["order_reference"],
    //         "insurance" => [
    //             "amount" => $params["insurance"],
    //             "currency" => "PLN"
    //         ],
    //         "end_of_week_collection" => $params["end_of_week_collection"]
    //     ]);
    // }

    // function getShipmentLabel($id)
    // {
    //     return $this->call("v1/organizations/{$this->organizationId}/shipments/labels?shipment_ids[]=$id&format=pdf");
    // }

    // function showShipmentLabel($id)
    // {
    //     //var_dump(updateShipment($id, ["status" => "confirmed"]));
    //     //var_dump(getShipmentLabel($id));die;
    //     header("Content-type:application/pdf");
    //     die($this->getShipmentLabel($id));
    // }
}

// $inpost_sender =   [
//     "company_name" => "Padmate",
//     "first_name" => "",
//     "last_name" => "",
//     "phone" => "722797900",
//     "email" => "sklep@padmate.pl",
//     "address" => [
//         "street" => "Górczewska",
//         "building_number" => "216/11",
//         "city" => "Warszawa",
//         "post_code" => "01-460",
//         "country_code" => "PL"
//     ],
// ];
