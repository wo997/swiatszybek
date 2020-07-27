<?php //->[admin/save_slider]

$input = ["exceptions" => ["categories", "description"]];
include "helpers/safe_post.php";

if (isset($_POST["remove"])) {
    query("DELETE FROM slides WHERE slide_id = ?", [
        $_POST["slide_id"]
    ]);
} else {
    $slide_id = nonull($_POST, "slide_id", "-1");

    if ($slide_id == "-1") {
        query("INSERT INTO slides () VALUES ()");
        $slide_id = getLastInsertedId();
    } else {
        $slide_id = $_POST["slide_id"];
    }

    query("UPDATE slides SET content = ?, published = ? WHERE slide_id = " . intval($slide_id), [
        $_POST["content"], $_POST["published"]
    ]);
}

die;
