<?php //->[admin/save-slider]



$posts = ["typ"];

foreach ($posts as $p) {
    if (!isset($_POST[$p]))
        die($p);

    $$p = $_POST[$p];
}

foreach ($typ as $k) {
    $kolejnosc = $k["kolejnosc"];
    $img = $k["img"];
    $slide_id = $k["id"];
    $link = $k["link"];
    $tekst = $k["tekst"];

    $typ_exists = false;
    if ($slide_id !== "") {
        $stmt = $con->prepare("SELECT slide_id FROM slides WHERE slide_id = ?");
        $stmt->bind_param("i", $slide_id);
        $stmt->execute();
        if (mysqli_stmt_fetch($stmt))
            $typ_exists = true;

        $stmt->close();
    }

    $valid = $img != "";

    if ($typ_exists) {

    } else if ($valid) {
        $stmt = $con->prepare("INSERT INTO slides () VALUES ()");
        $stmt->execute();
        $stmt->close();

        $stmt = $con->prepare("SELECT MAX(slide_id) FROM slides");
        $stmt->execute();
        $stmt->bind_result($slide_id);
        mysqli_stmt_fetch($stmt);
        $stmt->close();
    }

    if ($valid)
    {
        $stmt = $con->prepare("UPDATE slides SET img = ?, kolejnosc = ?, link = ?, tekst = ? WHERE slide_id = ".intval($slide_id));
        $stmt->bind_param("ssss", $img, $kolejnosc, $link, $tekst);
        $stmt->execute();
        $stmt->close();
    }
    else if ($slide_id) {
        $stmt = $con->prepare("DELETE FROM slides WHERE slide_id = ?");
        $stmt->bind_param("s", $slide_id);
        $stmt->execute();
        $stmt->close();
    }
}

header("Location: /admin/slider/$specificTime");
die;
