<?php
if ($_SERVER['SERVER_PORT'] != "8000" || isset($CRON))
{
  $servername = secret('db_server');
  $username = secret('db_user');
  $pss = secret('db_pass');
  $dbname = secret('db_name');
}
else
{
  $servername = "localhost";
  $username = "root";
  $pss = "";
  $dbname = "padmate";
}
$con = new mysqli($servername, $username, $pss, $dbname) or die("Failed to connect to MySQL: " . mysqli_connect_error());
$con->set_charset("utf8mb4");
