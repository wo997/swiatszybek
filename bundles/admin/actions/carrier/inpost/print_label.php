<?php //route[{ADMIN}/carrier/inpost/print_label]

use Imper86\PhpInpostApi\Enum\ServiceType;

$api = getInpostApi();

$shop_order = EntityManager::getEntityById("shop_order", $_POST["shop_order_id"]);

$inpost_shipment_id = $shop_order->getProp("inpost_shipment_id");

$inpost_settings = getSetting(["general", "carriers", "inpost"], []);
$organizationId = def($inpost_settings, "organizationId", "");

if (!$inpost_shipment_id) {
    $response = $api->organizations()->shipments()->post($organizationId, [
        'receiver' => [
            'name' => 'Name',
            'company_name' => 'Company name',
            'first_name' => 'Jan',
            'last_name' => 'Kowalski',
            'email' => 'test@inpost.pl',
            'phone' => '111222333',
        ],
        'parcels' => [
            ['template' => 'small'],
        ],
        'insurance' => [
            'amount' => 25,
            'currency' => 'PLN',
        ],
        'cod' => [
            'amount' => 12.50,
            'currency' => 'PLN',
        ],
        'custom_attributes' => [
            'sending_method' => 'dispatch_order',
            'target_point' => 'KRA012',
        ],
        'service' => ServiceType::INPOST_LOCKER_STANDARD,
        'reference' => 'Test',
        //'external_customer_id' => '8877xxx',
    ]);

    $shipmentData = json_decode($response->getBody()->__toString(), true);

    $inpost_shipment_id = $shipmentData['id'];
    $shop_order->setProp("inpost_shipment_id", $inpost_shipment_id);

    $cnt = 0;
    do {
        sleep(1);
        $response = $api->shipments()->get($shipmentData['id']);
        $shipmentData = json_decode($response->getBody()->__toString(), true);
        $cnt++;
        if ($cnt > 10) {
            Request::jsonResponse(["error" => 1]);
        }
    } while ($shipmentData['status'] === 'confirmed');
}

$labelResponse = $api->shipments()->label()->get($inpost_shipment_id, [
    'format' => 'Pdf',
    'type' => 'A6',
]);

header("Content-type:application/pdf");
echo $labelResponse->getBody()->__toString();
die;
