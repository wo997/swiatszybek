<?php //->[admin/modify_basket]
query("UPDATE zamowienia SET basket = ? WHERE zamowienie_id = ?",[$_POST["basket"], $_POST["zamowienie_id"]]);
