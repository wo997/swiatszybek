<?php //route[{ADMIN}/carrier/inpost/print_label]

$inpost_shipment_id = def($_POST, "inpost_shipment_id", "");

$inpost_api = InPostApi::get();

if (!$inpost_shipment_id) {
    $shop_order_id = def($_POST, "shop_order_id", "");
    if (!$shop_order_id) {
        die;
    }
    $shop_order = EntityManager::getEntityById("shop_order", $shop_order_id);

    /** @var Entity Address */
    $courier_address = $shop_order->getProp("courier_address");
    /** @var Entity Address */
    $main_address = $shop_order->getProp("main_address");

    $delivery_type_id = $_POST["delivery_type_id"];

    $register_shipment_data =  [
        //"sender" => $inpost_sender, (we can make it custom? but leave empty first)
        "parcels" => [
            "template" => $_POST["package_api_key"]
        ],
        "service" => "inpost_courier_standard",
        "reference" => "Zamowienie #{$shop_order->getId()}",
        "insurance" => [
            "amount" => $_POST["insurance"],
            "currency" => "PLN"
        ],
        "end_of_week_collection" => $_POST["end_of_week_collection"],
        "custom_attributes" => []
    ];

    if ($delivery_type_id === 1) {
        // courier
        $receiver = [
            'name' => $courier_address->getProp("__display_name"),
            'first_name' => $courier_address->getProp("first_name"),
            'last_name' => $courier_address->getProp("last_name"),
            'email' => $courier_address->getProp("email"),
            'phone' => extractPolishPhoneNumber($courier_address->getProp("phone")),
        ];

        $company = $courier_address->getProp("company");
        if ($company) {
            $receiver['company_name'] = $courier_address->getProp("company");
        }
    } else {
        // parcel_locker
        $receiver = [
            'email' => $main_address->getProp("email"),
            'phone' => extractPolishPhoneNumber($main_address->getProp("phone")),
        ];

        $register_shipment_data["service"] = "inpost_locker_standard";

        $register_shipment_data["custom_attributes"]["target_point"] = "WAW53N"; // TODO: $_POST
    }

    $register_shipment_data["receiver"] = $receiver;

    // var_dump($register_shipment_data);
    // die;

    $register_shipment = $inpost_api->call("v1/organizations/{$inpost_api->organizationId}/shipments", "POST", $register_shipment_data);

    $inpost_shipment_id = def($register_shipment, "id", null);

    if ($inpost_shipment_id) {
        $shop_order->setProp("inpost_shipment_id", $inpost_shipment_id);

        usleep(1000 * 200);
        try {
            $tries = 0;
            while (true) {
                if ($tries++ > 5) throw new Exception("Too many tries");

                $shipment_data = $inpost_api->call("v1/shipments/$inpost_shipment_id");
                if (!$shipment_data) {
                    continue;
                }
                if ($shipment_data["status"] === "confirmed") {
                    // success
                    break;
                }
                usleep(300000);
            }
        } catch (Exception $e) {
            echo "<h3>Błąd krytyczny! Spróbuj ponownie później.</h3>";
            //var_dump($e);
            die;
        }
    } else {

        if (isset($register_shipment["message"]) && isset($register_shipment["details"])) {
            echo "<h4>Błąd:</h4>";
            echo $register_shipment["message"];
            echo "<h4>Szczegóły</h4>";
            var_dump($register_shipment["details"]);
        } else {
            var_dump($register_shipment);
        }
        echo "<h3>Błąd krytyczny! Spróbuj ponownie później.</h3>";
        //var_dump($inpostData);
        die;
    }
}

EntityManager::saveAll();

// print label
$label_data = $inpost_api->call("v1/shipments/$inpost_shipment_id/label?format=pdf");
// ugh?
//$label_data = $inpost_api->call("v1/organizations/19102/shipments/labels?shipment_ids[]=$inpost_shipment_id&format=pdf");
//var_dump($label_data);
//die;
header("Content-type:application/pdf");
echo $label_data;
die;
