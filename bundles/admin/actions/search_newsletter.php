<?php //route[{ADMIN}search_newsletter]  

jsonResponse(paginateData([
    "select" => "email, DATE_FORMAT(invitation_sent, '%d-%m-%Y %H:%i') as requested",
    "from" => "newsletter n",
    "where" => "n.accepted = 1",
    "order" => "person_id DESC",
    "quick_search_fields" => ["n.email"],
]));
