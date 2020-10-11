<?php //route[admin/uploads_action]

if (IS_XHR && isset($_FILES['files'])) {
    $type = nonull($_POST, "type", "files");

    for ($counter = 0; $counter < count($_FILES['files']['tmp_name']); $counter++) {
        $tmp_file_path = $_FILES['files']['tmp_name'][$counter];
        $uploaded_file_name = $_FILES['files']['name'][$counter];
        $name = nonull($_POST, "name", date("Y-m-d-H-i-s"));

        $file_data = saveImage($tmp_file_path, $uploaded_file_name, $name);

        if ($type == "copy") {
            $copy_path = UPLOADS_PLAIN_PATH . $name . "." . getFileExtension($file_data["file_path"]);
            copy($tmp_file_path, $copy_path);
            processImage($copy_path);

            $image_version = getSetting("theme", "copied_images", [$name, "version"]);
            if (!$image_version) {
                $image_version = 1;
            } else {
                $image_version++;
            }
            saveSettings("theme", "copied_images", [
                [
                    "path" => [$name],
                    "value" => [
                        "version" => $image_version,
                        "path" => $file_data["file_path"]
                    ]
                ]
            ]);
            json_response([
                "path" => $file_data["file_path"]
            ]);
        }
    }
}

if (IS_XHR && isset($_POST['delete_path'])) {
    deleteAssetByPath($_POST["delete_path"]);
    die;
}
if (isset($_POST['base64'])) {
    foreach (json_decode($_POST['base64']) as $src) {
        $image_parts = explode(";base64,", $src);
        $image_type_aux = explode("image/", $image_parts[0]);
        $file_type = $image_type_aux[1];
        $image_base64 = base64_decode($image_parts[1]);
        $tmp_file_path = UPLOADS_PATH . "tmp." . $file_type;
        saveFile($tmp_file_path, $image_base64);

        $name = nonull($_POST, "name", date("Y-m-d-H-i-s"));
        saveImage($tmp_file_path, $name, $name);
    }
}

if (isset($_POST['search'])) { // return list
    $where = "1";
    $searchQuery = getSearchQuery([
        "main_search_value" => $_POST['search'],
        "main_search_fields" => ["file_path", "uploaded_file_name"]
    ]);
    $where .= $searchQuery;

    if (isset($_POST["asset_types"])) {
        $where .= " AND asset_type IN (" . escapeSQL($_POST["asset_types"]) . ")";
    }

    $paths = fetchArray("SELECT file_path, asset_type, uploaded_file_name FROM uploads WHERE $where ORDER BY file_id DESC LIMIT 120");

    json_response($paths);
}
