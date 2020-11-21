<?php

$CRON = true;
$TEST = true;

//chdir(__DIR__."/..");
//var_Dump(file_exists(__DIR__."/../cron-0000.php"));
//var_Dump(file_exists("kernel.php"));
//die(getcwd());

//chdir(__DIR__."/../../cron");

require 'cron/cron-hourly.php';
//require 'sales.php';
