<?php //route[admin/search_uzytkownicy]  

  $where = "u.authenticated = 1";

  if (isset($_POST['user_id']))
  {
    $where .= getListCondition("user_id",$_POST['user_id']);
  }

  echo getTableData([
    "select" => "user_id, imie, nazwisko, email, telefon, user_type, DATE_FORMAT(stworzono, '%d-%m-%Y %H:%i') as stworzono,(select count(1) from zamowienia z where z.user_id = u.user_id) as zamowienia_count,firma",
    "from" => "users u",
    "where" => $where,
    "order" => "u.user_id DESC",
    "main_search_fields" => ["u.imie","u.nazwisko","u.firma","u.email"],
  ]);
