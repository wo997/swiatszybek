<?php

// if (IS_XHR && isset($_FILES['files'])) {
//     $type = def($_POST, "type", "files");

//     for ($counter = 0; $counter < count($_FILES['files']['tmp_name']); $counter++) {
//         $tmp_file_path = $_FILES['files']['tmp_name'][$counter];
//         $uploaded_file_name = $_FILES['files']['name'][$counter];
//         $name = def($_POST, "name", date("Y-m-d-H-i-s"));

//         $file_data = saveImage($tmp_file_path, $uploaded_file_name, $name);

//         if ($type == "copy") {
//             $copy_path = UPLOADS_PLAIN_PATH . $name . "." . getFileExtension($file_data["file_path"]);
//             copy($tmp_file_path, $copy_path);
//             processImage($copy_path);

//             $image_version = getSetting("theme", "copied_images", [$name, "version"]);
//             if (!$image_version) {
//                 $image_version = 1;
//             } else {
//                 $image_version++;
//             }
//             saveSettings("theme", "copied_images", [
//                 [
//                     "path" => [$name],
//                     "value" => [
//                         "version" => $image_version,
//                         "path" => $file_data["file_path"]
//                     ]
//                 ]
//             ]);
//             Request::jsonResponse([
//                 "path" => $file_data["file_path"]
//             ]);
//         }
//     }
// }
