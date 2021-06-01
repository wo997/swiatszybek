<?php //hook[helper]

function getAllUsers()
{
    return DB::fetchArr("SELECT * FROM user");
}

function preloadUsers()
{
    $users = json_encode(getAllUsers());
    return <<<JS
    users = $users;
    loadedUsers();
JS;
}
