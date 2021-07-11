<?php //route[/comment/add]

try {
    DB::beginTransaction();
    $comment_data = json_decode($_POST["comment"], true);
    $comment_data["comment"] = htmlspecialchars($comment_data["comment"]);

    /** @var EntityUser */
    $user = User::getCurrent()->getEntity();
    $user->setProp("nickname", htmlspecialchars($_POST["nickname"]));

    $comment = EntityManager::getEntity("comment", $comment_data);
    $comment->setProp("user", User::getCurrent()->getId());
    EntityManager::saveAll();
    DB::commitTransaction();
    Request::jsonResponse(["success" => true]);
} catch (Exception $e) {
    var_dump($e);
    DB::rollbackTransation();
}
