<?php //route[admin/uploads_action]

if ($app["user"]["permissions"]["backend_access"] && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['files'])) {
    for ($counter = 0; $counter < count($_FILES['files']['tmp_name']); $counter++) {
        $tmp_file_path = $_FILES['files']['tmp_name'][$counter];
        $uploaded_file_name = $_FILES['files']['name'][$counter];
        $name = nonull($_POST, "tag", date("Y-m-d_H:i:s"));
        $file_info = saveImage($tmp_file_path, $uploaded_file_name, $name, true, $counter);
        //minifyImage($file_path, $file_name, nonull($_POST, "tag", date("Y-m-d_H:i:s")), $counter);
        //minifyImage($file_info["file_path"]);
    }
}

if ($app["user"]["permissions"]["backend_access"] && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['delete_path'])) {
        // method delete image by path ezy
        $image_file_path = ltrim($_POST['delete_path'], "/");

        $file_name = getFilenameWithoutExtension($image_file_path);

        foreach ($image_default_dimensions as $size_name => $area) {
            foreach ($image_minified_formats as $format) {
                $file_path = UPLOADS_PATH . $size_name . "/" . $file_name . "." . $format;
                if (file_exists($file_path)) {
                    @unlink($file_path);
                    //var_dump($file_path);
                }
            }
        }

        @unlink($image_file_path);
        ///var_dump($image_file_path);

        //var_dump("DELETE FROM uploads WHERE path = ?", [$image_file_path]);
        query("DELETE FROM uploads WHERE file_path = ?", [$image_file_path]);
        die;
    }
}
if ($app["user"]["permissions"]["backend_access"] && isset($_POST['base64'])) {
    $counter = 0;
    foreach (json_decode($_POST['base64']) as $src) {
        $counter++;
        $image_parts = explode(";base64,", $src);
        $image_type_aux = explode("image/", $image_parts[0]);
        $file_type = $image_type_aux[1];
        $image_base64 = base64_decode($image_parts[1]);
        $tmp = UPLOADS_PATH . "tmp." . $file_type;
        file_put_contents($tmp, $image_base64);

        processImage($tmp, "", nonull($_POST, "tag", date("Y-m-d_H:i:s")), $counter);
        // todo fucked up
    }
}

if (isset($_POST['search'])) { // return list
    $where = "1";
    $searchQuery = getSearchQuery([
        "main_search_value" => $_POST['search'],
        "main_search_fields" => ["file_path", "uploaded_file_name"]
    ]);
    $where .= $searchQuery;

    $paths = fetchArray("SELECT file_path, asset_type FROM uploads WHERE $where ORDER BY file_id DESC LIMIT 120");

    die(json_encode($paths));
}
