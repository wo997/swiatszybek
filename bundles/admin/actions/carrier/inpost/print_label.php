<?php //route[{ADMIN}/carrier/inpost/print_label]

$shop_order = EntityManager::getEntityById("shop_order", $_POST["shop_order_id"]);
$inpost_shipment_id = def($_POST, "inpost_shipment_id", "");

/** @var Entity Address */
$courier_address = $shop_order->getProp("courier_address");

$inpost_api = InPostApi::get();

if (!$inpost_shipment_id) {
    $receiver = [
        'name' => $courier_address->getProp("__display_name"),
        'first_name' => $courier_address->getProp("first_name"),
        'last_name' => $courier_address->getProp("last_name"),
        'email' => $courier_address->getProp("email"),
        'phone' => $courier_address->getProp("phone"),
    ];

    $company = $courier_address->getProp("company");
    if ($company) {
        $receiver['company_name'] = $courier_address->getProp("company");
    }

    $register_shipment = $inpost_api->call("v1/organizations/{$inpost_api->organizationId}/shipments", "POST", [
        "receiver" =>  $receiver,
        //"sender" => $inpost_sender,
        "parcels" => [
            "template" => $_POST["package_api_key"]
        ],
        "service" => "inpost_courier_standard",
        "reference" => "Zamowienie #{$shop_order->getId()}",
        "insurance" => [
            "amount" => $_POST["insurance"],
            "currency" => "PLN"
        ],
        "end_of_week_collection" => $_POST["end_of_week_collection"]
    ]);

    $inpost_shipment_id = def($register_shipment, "id", null);

    if ($inpost_shipment_id) {
        $shop_order->setProp("inpost_shipment_id", $inpost_shipment_id);

        usleep(1000 * 200);
        try {
            $tries = 0;
            while (true) {
                if ($tries++ > 5) throw new Exception("Too many tries");

                $shipment_data = $inpost_api->call("v1/shipments/$id");
                if (!$shipment) {
                    continue;
                }
                if ($shipment["status"] === "confirmed") {
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

header("Content-type:application/pdf");
echo $inpost_api->call("v1/organizations/19102/shipments/labels?shipment_ids[]=$id&format=pdf");
die;
