<?php

include "events/topmenu_change.php";

$base_path = str_replace("\\","/",getcwd())."/";
$scanned_routes_string = "";

function processDir($parent_dir) {
    global $scanned_routes_string, $base_path;
    $exclude = ["vendor","uploads"];
    foreach (scandir($base_path.$parent_dir) as $file) {
        $path = $parent_dir.$file;
        if (substr($file,0,1) == "." || in_array($file,$exclude)) {
            continue;
        }
        if (is_dir($path)) {
            processDir($path."/");
            continue;
        }
        else if (strpos($file,".php") != strlen($file)-4) {
            continue;
        }
        $first_line = nonull(file($path),0,"");
        
        if (!preg_match("/<\?php \/\/->\[.*\]/",$first_line,$match)) continue;
        
        $scanned_routes_string .= "\"".substr($match[0],11,-1)."\" => \"".$path."\",\n";
    }
}

processDir("");

$out = "<?php return [\n";
$out .= $scanned_routes_string;
$out .= "];";

file_put_contents("scanned_routes.php",$out);

?>