<?php //route[{ADMIN}file/delete]

Files::deleteUploadedFile($_POST["file_path"]);
