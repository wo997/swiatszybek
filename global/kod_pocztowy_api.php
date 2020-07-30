<?php //route[kod_pocztowy_api]
if (!isset($_POST['kod'])) die;

echo file_get_contents("http://kodpocztowy.intami.pl/api/" . $_POST['kod']);

/*
$ch = curl_init("http://kodpocztowy.intami.pl/api/".$_POST['kod']);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json'
));

echo curl_exec($ch);*/
