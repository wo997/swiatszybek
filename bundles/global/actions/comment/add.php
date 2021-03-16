<?php //route[/comment/add]

try {
    DB::beginTransaction();
    $comment_data = json_decode($_POST["comment"], true);
    $comment_data["options_csv"] = join(",", array_map(fn ($x) => clean($x), $comment_data["options_ids"]));

    $nickname = $_POST["nickname"];
    // TODO: update users nickname

    $comment = EntityManager::getEntity("comment", $comment_data);
    $comment->setProp("user", User::getCurrent()->getId());
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["success" => true]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
