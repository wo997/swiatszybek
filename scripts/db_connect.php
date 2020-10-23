<?php

date_default_timezone_set("Europe/Warsaw");
$con = new mysqli(secret('db_server'), secret('db_user'), secret('db_pass'), secret('db_name')) or die("Failed to connect to MySQL: " . mysqli_connect_error());
$con->set_charset("utf8mb4");
