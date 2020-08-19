<?php

$servername = secret('db_server');
$username = secret('db_user');
$pss = secret('db_pass');
$dbname = secret('db_name');

$con = new mysqli($servername, $username, $pss, $dbname) or die("Failed to connect to MySQL: " . mysqli_connect_error());
$con->set_charset("utf8mb4");
