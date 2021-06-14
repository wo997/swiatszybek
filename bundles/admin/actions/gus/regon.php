<?php //route[{ADMIN}/gus/regon]


use GusApi\GusApi;
use GusApi\ReportTypes;
//use GusApi\BulkReportTypes;

//$gus = new GusApi('your api key here');
//for development server use:
$gus = new GusApi('abcde12345abcde12345', 'dev');

try {
    $gus->login();
    $gusReports = $gus->getByNip("5792092290");

    foreach ($gusReports as $gusReport) {
        echo $gusReport->getName() . " " . $gusReport->getStreet() . ' ' . $gusReport->getPropertyNumber() . '/' . $gusReport->getApartmentNumber();
    }
} catch (Exception $e) {
}
