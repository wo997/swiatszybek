<?php //route[{ADMIN}file/upload]

$type = def($_POST, "type", "files");

for ($i = 0; $i < count($_FILES['files']['tmp_name']); $i++) {
    $tmp_file_path = $_FILES['files']['tmp_name'][$i];
    $original_file_name = $_FILES['files']['name'][$i];
    $name = def($_POST, "name", date("Y-m-d-H-i-s"));

    $file_data = Files::saveUploadedFile($tmp_file_path, $original_file_name, $name);

    if ($type == "copy") {
        $copy_path = UPLOADS_PLAIN_PATH . $name . "." . Files::getFileExtension($file_data["file_path"]);
        copy($tmp_file_path, $copy_path);
        Files::processImage($copy_path);

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
        Request::jsonResponse([
            "path" => $file_data["file_path"]
        ]);
    }
}
