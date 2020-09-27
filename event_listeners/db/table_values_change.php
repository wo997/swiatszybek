<?php //event[table_values_change]

if ($args["table"] == "menu") {
    triggerEvent("topmenu_change");
}
