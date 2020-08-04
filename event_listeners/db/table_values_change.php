<?php //event[table_values_change]

if ($input["table"] == "menu") {
    triggerEvent("topmenu_change");
}
