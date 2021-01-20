<?php //route[{ADMIN}save_slider]

if (isset($_POST["remove"])) {
    DB::execute("DELETE FROM slides WHERE slide_id = ?", [
        $_POST["slide_id"]
    ]);
} else {
    $slide_id = def($_POST, "slide_id", "-1");

    if ($slide_id == "-1") {
        DB::execute("INSERT INTO slides () VALUES ()");
        $slide_id = DB::lastInsertedId();
    } else {
        $slide_id = $_POST["slide_id"];
    }

    DB::execute("UPDATE slides SET content_desktop = ?, content_mobile = ?, published = ? WHERE slide_id = " . intval($slide_id), [
        $_POST["content_desktop"], $_POST["content_mobile"], $_POST["published"]
    ]);
}

die;
