<?php //route[{ADMIN}/gus/regon]

// function do_something($params)
// {
//     global $gg_token;

//     $curl = curl_init();

//     curl_setopt_array($curl, array(
//         CURLOPT_VERBOSE => true,
//         CURLOPT_URL => "https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/UslugaBIRzewnPubl.svc/Zaloguj",

//         -H "Content-Type: application/soap+xml;charset=UTF-8"
//         CURLOPT_POST => 1,
//         // CURLOPT_HTTPHEADER => array(
//         //     "Token: $gg_token"
//         // ),
//         CURLOPT_POSTFIELDS => http_build_query($params),
//         CURLOPT_RETURNTRANSFER => true,
//     ));

//     $response = curl_exec($curl);
//     //$curl_error = curl_error($curl);
//     //var_dump("error", $curl_error);
//     $data = json_decode($response, true);

//     return $data;
// }
// $gg_token = do_something(["pKluczUzytkownika" => "abcde12345abcde12345"]);

// var_dump($gg_token);

$stream_context_opts = array(
    'https' => array(
        'method' => "POST",
        'header' => "Content-Type: application/xop+xml; charset=utf-8\r\n"
    )
);

$soap_stream_context = stream_context_create($stream_context_opts);

$client = new SoapClient(
    "https://wyszukiwarkaregontest.stat.gov.pl/wsBIR/wsdl/UslugaBIRzewnPubl-ver11-test.wsdl",
    [
        // 'soap_version' => SOAP_1_2,
        'trace' => 1,
        'stream_context' => $soap_stream_context,
    ]
);
$client->__soapCall("Zaloguj", ["pKluczUzytkownika" => "abcde12345abcde12345"]);

//var_dump($client);
