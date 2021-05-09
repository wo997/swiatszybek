<?php

class Files
{
    public static $image_fixed_dimensions = [
        "df" => null,
        "lg" => 1920,
        "bg" => 1200,
        "md" => 600,
        "sm" => 300,
        "tn" => 100,
    ];

    public static $same_ext_image_allowed_types = [
        "png", "bmp", "gif"
    ];

    public static $image_minified_formats = [
        "jpg", "webp"
    ];

    public static $minify_extensions = [
        "jpg", "png", "gif", "bmp", "webp"
    ];

    /**
     * @param  mixed $file_tmp
     * @param  mixed $tag
     * @param  mixed $file_name
     * @param  mixed $counter
     * @return void
     */
    public static function saveUploadedFile($tmp_file_path, $original_file_name, $name)
    {
        $mime_type = mime_content_type($tmp_file_path);
        $file_ext = self::mime2ext($mime_type);
        $file_type = self::getAssetTypeFromMime($mime_type);

        $user_id = User::getCurrent()->getId();

        if (!$name) $name = rand(1000, 9999);

        // escape
        $name = escapeUrl($name);

        $name_suffix = "";

        //if ($file_type == "image") {
        // TODO: option to save gif as a plain gif lol
        if ($file_type == "image") {
            $info = getimagesize($tmp_file_path);

            $width = $info[0];
            $height = $info[1];

            // TODO: throw errors
            /*if ($width * $height > 500971520) {
                return false;
            }*/

            // necessary for lazy loading and image optimization
            $name_suffix = "_" . $width . "x" . $height;
        }

        $name_counter = 0;

        $base_path = ""; // $file_type == "image" ? UPLOADS_PLAIN_PATH : UPLOADS_VIDEOS_PATH;
        if ($file_type == "image") {
            $base_path = UPLOADS_PLAIN_PATH;
        } else if ($file_type == "video") {
            $base_path = UPLOADS_VIDEOS_PATH;
        }

        $name_counter = DB::fetchVal("SELECT MAX(name_counter) FROM file WHERE name = ?", [$name]);
        $name_counter = $name_counter ? $name_counter + 1 : 1;
        $file_path = $base_path . $name . "-" . $name_counter . $name_suffix . "." . $file_ext;

        // save plain file
        copy($tmp_file_path, $file_path);

        DB::insert("file", [
            "file_path" => $file_path,
            "original_file_name" => $original_file_name,
            "file_type" => $file_type,
            "name" => $name,
            "name_counter" => $name_counter,
            "user_id" => $user_id,
        ]);

        //if ($file_type == "image") {
        if (in_array($file_ext, self::$minify_extensions)) {
            self::processImage($file_path);
        }

        return [
            "file_path" => $file_path,
            "file_type" => $file_type,
        ];
    }

    public static function processImage($file_path)
    {
        $size_info = getimagesize($file_path);

        $file_extension = self::mime2ext($size_info['mime']);

        if ($file_extension == 'jpg') {
            $image = imagecreatefromjpeg($file_path);
        } else if ($file_extension == 'png') {
            $image = imagecreatefrompng($file_path);
        } else if ($file_extension == 'gif') {
            $image = imagecreatefromgif($file_path);
        } else if ($file_extension == 'bmp') {
            $image = imagecreatefrombmp($file_path);
        } else if ($file_extension == 'webp') {
            $image = imagecreatefromwebp($file_path);
        } else {
            return false;
        }

        $width = $size_info[0];
        $height = $size_info[1];

        $image_dimension = max($width, $height);

        foreach (self::$image_fixed_dimensions as $image_wanted_name => $image_wanted_dimension) {
            if ($image_wanted_dimension) {
                $scale = $image_wanted_dimension / $image_dimension;
                if ($scale >= 1) {
                    continue; // we dont want to scale images up
                }

                $sizes[$image_wanted_name] = [
                    round($width * $scale),
                    round($height * $scale),
                ];
            } else {
                $sizes[$image_wanted_name] = [$width, $height];
            }
        }

        $file_name_wo_extension = self::getFileNameWithoutExtension($file_path);

        foreach ($sizes as $size_name => $size) {
            $file_path_wo_extension = UPLOADS_PATH . $size_name . "/" . $file_name_wo_extension;

            $copy_width = $size[0];
            $copy_height = $size[1];

            $output = imagecreatetruecolor($copy_width, $copy_height);
            $white = imagecolorallocate($output,  255, 255, 255);
            imagefilledrectangle($output, 0, 0, $copy_width, $copy_height, $white);
            //imagecopyresized($output, $image, 0, 0, 0, 0, $copy_width, $copy_height, $width, $height);
            // below gives way better quality
            imagecopyresampled($output, $image, 0, 0, 0, 0, $copy_width, $copy_height, $width, $height);

            imagejpeg($output, $file_path_wo_extension . ".jpg", 80);

            imagewebp($output, $file_path_wo_extension . ".webp", 80);

            imagedestroy($output);

            $output_transparent = imagecreatetruecolor($copy_width, $copy_height);
            imagealphablending($output_transparent, false);
            imagesavealpha($output_transparent, true);
            imagecopyresampled($output_transparent, $image, 0, 0, 0, 0, $copy_width, $copy_height, $width, $height);

            if ($file_extension == 'png') {
                imagepng($output_transparent, $file_path_wo_extension . ".png");
            } else if ($file_extension == 'gif') {
                imagegif($output_transparent, $file_path_wo_extension . ".gif");
            } else if ($file_extension == 'bmp') {
                imagebmp($output_transparent, $file_path_wo_extension . ".bmp");
            }

            imagedestroy($output_transparent);
        }

        imagedestroy($image);
    }

    // also images.js
    public static function getUploadedFileName($file_path)
    {
        // TODO: optimize images on backend as well, by path
        $start = strlen(UPLOADS_PLAIN_PATH);
        return substr($file_path, $start, strrpos($file_path, ".") - $start);
    }

    public static function getFileNameWithoutExtension($file_path)
    {
        $path_info = pathinfo($file_path);
        $file_name = $path_info["basename"];
        $file_extension = $path_info["extension"];
        return substr($file_name, 0, - (1 + strlen($file_extension)));
    }


    public static function getFileExtension($file_path)
    {
        $path_info = pathinfo($file_path);
        if (!$path_info) {
            return null;
        }
        return def($path_info, "extension", null);
    }


    // also images.js
    public static function getResponsiveImageData($src)
    {
        $last_dot_index = strrpos($src, ".");
        $ext = substr($src, $last_dot_index + 1);
        $path_wo_ext = substr($src, 0, $last_dot_index);

        $last_floor_index = strrpos($path_wo_ext, "_");
        if ($last_floor_index === false) {
            return null;
        }

        $dimsstr = substr($path_wo_ext, $last_floor_index + 1);
        if (!preg_match('/^\d*x\d*$/', $dimsstr)) {
            return;
        }

        $dimensions = explode("x", $dimsstr);

        $file_name = preg_replace("/(\/)?uploads\/.{0,10}\//", "", $path_wo_ext);

        return [
            "file_name" => $file_name,
            "extension" => $ext,
            "w" => intval($dimensions[0]),
            "h" => intval($dimensions[1]),
        ];
    }

    public static function getResponsiveImageBySize($src, $image_dimension, $options = [])
    {
        // floating point numbers suck
        $image_dimension -= 1;

        $image_data = self::getResponsiveImageData($src);

        if (!$image_data) {
            return null;
        }
        $natural_image_dimension = max($image_data["w"], $image_data["h"]);
        $target_size_name = "df";

        if ($image_dimension < $natural_image_dimension) {
            // TODO: maybe from cookie?
            $pixelDensityFactor = 1;
            foreach (self::$image_fixed_dimensions as $size_name => $size_dimension) {
                if ($size_name == "df") {
                    continue;
                }
                if (
                    $image_dimension < $size_dimension / $pixelDensityFactor &&
                    $size_dimension < $natural_image_dimension
                ) {
                    $target_size_name = $size_name;
                }
            }
        }


        $src = "/" . UPLOADS_PATH . $target_size_name . "/" . $image_data["file_name"];

        if (def($options, "same-ext", false) && in_array($image_data["extension"], self::$same_ext_image_allowed_types)) {
            $src .= "." . $image_data["extension"];
        } else if (WEBP_SUPPORT) {
            $src .= ".webp";
        } else {
            $src .= ".jpg";
        }
        return $src;
    }


    public static function deleteUploadedFile($full_file_path)
    {
        $file_path = ltrim($full_file_path, "/");
        $file_name = self::getFileNameWithoutExtension($file_path);
        $file_ext = self::getFileExtension($file_path);
        //$file_type = DB::fetchVal("SELECT file_type FROM file WHERE file_path = ?", [$file_path]);

        @unlink($file_path);

        if (in_array(self::$minify_extensions, $file_ext)) {
            $image_data = self::getResponsiveImageData($file_path);
            if ($image_data) {
                foreach (self::$image_fixed_dimensions as $size_name => $area) {
                    foreach (self::$image_minified_formats as $format) {
                        $min_file_path = UPLOADS_PATH . $size_name . "/" . $file_name . "." . $format;
                        if (file_exists($min_file_path)) {
                            @unlink($min_file_path);
                        }
                    }
                }
            }
        }

        DB::execute("DELETE FROM file WHERE file_path = ?", [$file_path]);
    }

    public static function mime2ext($mime)
    {
        $mime_map = [
            'video/3gpp2'                                                               => '3g2',
            'video/3gp'                                                                 => '3gp',
            'video/3gpp'                                                                => '3gp',
            'application/x-compressed'                                                  => '7zip',
            'audio/x-acc'                                                               => 'aac',
            'audio/ac3'                                                                 => 'ac3',
            'application/postscript'                                                    => 'ai',
            'audio/x-aiff'                                                              => 'aif',
            'audio/aiff'                                                                => 'aif',
            'audio/x-au'                                                                => 'au',
            'video/x-msvideo'                                                           => 'avi',
            'video/msvideo'                                                             => 'avi',
            'video/avi'                                                                 => 'avi',
            'application/x-troff-msvideo'                                               => 'avi',
            'application/macbinary'                                                     => 'bin',
            'application/mac-binary'                                                    => 'bin',
            'application/x-binary'                                                      => 'bin',
            'application/x-macbinary'                                                   => 'bin',
            'image/bmp'                                                                 => 'bmp',
            'image/x-bmp'                                                               => 'bmp',
            'image/x-bitmap'                                                            => 'bmp',
            'image/x-xbitmap'                                                           => 'bmp',
            'image/x-win-bitmap'                                                        => 'bmp',
            'image/x-windows-bmp'                                                       => 'bmp',
            'image/ms-bmp'                                                              => 'bmp',
            'image/x-ms-bmp'                                                            => 'bmp',
            'application/bmp'                                                           => 'bmp',
            'application/x-bmp'                                                         => 'bmp',
            'application/x-win-bitmap'                                                  => 'bmp',
            'application/cdr'                                                           => 'cdr',
            'application/coreldraw'                                                     => 'cdr',
            'application/x-cdr'                                                         => 'cdr',
            'application/x-coreldraw'                                                   => 'cdr',
            'image/cdr'                                                                 => 'cdr',
            'image/x-cdr'                                                               => 'cdr',
            'zz-application/zz-winassoc-cdr'                                            => 'cdr',
            'application/mac-compactpro'                                                => 'cpt',
            'application/pkix-crl'                                                      => 'crl',
            'application/pkcs-crl'                                                      => 'crl',
            'application/x-x509-ca-cert'                                                => 'crt',
            'application/pkix-cert'                                                     => 'crt',
            'text/css'                                                                  => 'css',
            'text/x-comma-separated-values'                                             => 'csv',
            'text/comma-separated-values'                                               => 'csv',
            'application/vnd.msexcel'                                                   => 'csv',
            'application/x-director'                                                    => 'dcr',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'   => 'docx',
            'application/x-dvi'                                                         => 'dvi',
            'message/rfc822'                                                            => 'eml',
            'application/x-msdownload'                                                  => 'exe',
            'video/x-f4v'                                                               => 'f4v',
            'audio/x-flac'                                                              => 'flac',
            'video/x-flv'                                                               => 'flv',
            'image/gif'                                                                 => 'gif',
            'application/gpg-keys'                                                      => 'gpg',
            'application/x-gtar'                                                        => 'gtar',
            'application/x-gzip'                                                        => 'gzip',
            'application/mac-binhex40'                                                  => 'hqx',
            'application/mac-binhex'                                                    => 'hqx',
            'application/x-binhex40'                                                    => 'hqx',
            'application/x-mac-binhex40'                                                => 'hqx',
            'text/html'                                                                 => 'html',
            'image/x-icon'                                                              => 'ico',
            'image/x-ico'                                                               => 'ico',
            'image/vnd.microsoft.icon'                                                  => 'ico',
            'text/calendar'                                                             => 'ics',
            'application/java-archive'                                                  => 'jar',
            'application/x-java-application'                                            => 'jar',
            'application/x-jar'                                                         => 'jar',
            'image/jp2'                                                                 => 'jp2',
            'video/mj2'                                                                 => 'jp2',
            'image/jpx'                                                                 => 'jp2',
            'image/jpm'                                                                 => 'jp2',
            'image/jpg'                                                                 => 'jpg',
            'image/jpeg'                                                                => 'jpg',
            'image/pjpeg'                                                               => 'jpg',
            'application/x-javascript'                                                  => 'js',
            'application/json'                                                          => 'json',
            'text/json'                                                                 => 'json',
            'application/vnd.google-earth.kml+xml'                                      => 'kml',
            'application/vnd.google-earth.kmz'                                          => 'kmz',
            'text/x-log'                                                                => 'log',
            'audio/x-m4a'                                                               => 'm4a',
            'audio/mp4'                                                                 => 'm4a',
            'application/vnd.mpegurl'                                                   => 'm4u',
            'audio/midi'                                                                => 'mid',
            'application/vnd.mif'                                                       => 'mif',
            'video/quicktime'                                                           => 'mov',
            'video/x-sgi-movie'                                                         => 'movie',
            'audio/mpeg'                                                                => 'mp3',
            'audio/mpg'                                                                 => 'mp3',
            'audio/mpeg3'                                                               => 'mp3',
            'audio/mp3'                                                                 => 'mp3',
            'video/mp4'                                                                 => 'mp4',
            'video/mpeg'                                                                => 'mpeg',
            'application/oda'                                                           => 'oda',
            'audio/ogg'                                                                 => 'ogg',
            'video/ogg'                                                                 => 'ogg',
            'application/ogg'                                                           => 'ogg',
            'font/otf'                                                                  => 'otf',
            'application/x-pkcs10'                                                      => 'p10',
            'application/pkcs10'                                                        => 'p10',
            'application/x-pkcs12'                                                      => 'p12',
            'application/x-pkcs7-signature'                                             => 'p7a',
            'application/pkcs7-mime'                                                    => 'p7c',
            'application/x-pkcs7-mime'                                                  => 'p7c',
            'application/x-pkcs7-certreqresp'                                           => 'p7r',
            'application/pkcs7-signature'                                               => 'p7s',
            'application/pdf'                                                           => 'pdf',
            'application/octet-stream'                                                  => 'pdf',
            'application/x-x509-user-cert'                                              => 'pem',
            'application/x-pem-file'                                                    => 'pem',
            'application/pgp'                                                           => 'pgp',
            'application/x-httpd-php'                                                   => 'php',
            'application/php'                                                           => 'php',
            'application/x-php'                                                         => 'php',
            'text/php'                                                                  => 'php',
            'text/x-php'                                                                => 'php',
            'application/x-httpd-php-source'                                            => 'php',
            'image/png'                                                                 => 'png',
            'image/x-png'                                                               => 'png',
            'application/powerpoint'                                                    => 'ppt',
            'application/vnd.ms-powerpoint'                                             => 'ppt',
            'application/vnd.ms-office'                                                 => 'ppt',
            'application/msword'                                                        => 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation' => 'pptx',
            'application/x-photoshop'                                                   => 'psd',
            'image/vnd.adobe.photoshop'                                                 => 'psd',
            'audio/x-realaudio'                                                         => 'ra',
            'audio/x-pn-realaudio'                                                      => 'ram',
            'application/x-rar'                                                         => 'rar',
            'application/rar'                                                           => 'rar',
            'application/x-rar-compressed'                                              => 'rar',
            'audio/x-pn-realaudio-plugin'                                               => 'rpm',
            'application/x-pkcs7'                                                       => 'rsa',
            'text/rtf'                                                                  => 'rtf',
            'text/richtext'                                                             => 'rtx',
            'video/vnd.rn-realvideo'                                                    => 'rv',
            'application/x-stuffit'                                                     => 'sit',
            'application/smil'                                                          => 'smil',
            'text/srt'                                                                  => 'srt',
            'image/svg+xml'                                                             => 'svg',
            'application/x-shockwave-flash'                                             => 'swf',
            'application/x-tar'                                                         => 'tar',
            'application/x-gzip-compressed'                                             => 'tgz',
            'image/tiff'                                                                => 'tiff',
            'font/ttf'                                                                  => 'ttf',
            'text/plain'                                                                => 'txt',
            'text/x-vcard'                                                              => 'vcf',
            'application/videolan'                                                      => 'vlc',
            'text/vtt'                                                                  => 'vtt',
            'audio/x-wav'                                                               => 'wav',
            'audio/wave'                                                                => 'wav',
            'audio/wav'                                                                 => 'wav',
            'application/wbxml'                                                         => 'wbxml',
            'video/webm'                                                                => 'webm',
            'image/webp'                                                                => 'webp',
            'audio/x-ms-wma'                                                            => 'wma',
            'application/wmlc'                                                          => 'wmlc',
            'video/x-ms-wmv'                                                            => 'wmv',
            'video/x-ms-asf'                                                            => 'wmv',
            'font/woff'                                                                 => 'woff',
            'font/woff2'                                                                => 'woff2',
            'application/xhtml+xml'                                                     => 'xhtml',
            'application/excel'                                                         => 'xl',
            'application/msexcel'                                                       => 'xls',
            'application/x-msexcel'                                                     => 'xls',
            'application/x-ms-excel'                                                    => 'xls',
            'application/x-excel'                                                       => 'xls',
            'application/x-dos_ms_excel'                                                => 'xls',
            'application/xls'                                                           => 'xls',
            'application/x-xls'                                                         => 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'         => 'xlsx',
            'application/vnd.ms-excel'                                                  => 'xlsx',
            'application/xml'                                                           => 'xml',
            'text/xml'                                                                  => 'xml',
            'text/xsl'                                                                  => 'xsl',
            'application/xspf+xml'                                                      => 'xspf',
            'application/x-compress'                                                    => 'z',
            'application/x-zip'                                                         => 'zip',
            'application/zip'                                                           => 'zip',
            'application/x-zip-compressed'                                              => 'zip',
            'application/s-compressed'                                                  => 'zip',
            'multipart/x-zip'                                                           => 'zip',
            'text/x-scriptzsh'                                                          => 'zsh',
        ];

        return def($mime_map, $mime, false);
    }

    public static function getAssetTypeFromMime($mime)
    {
        $x = explode("/", $mime);
        if (isset($x[1])) {
            return $x[0];
        }
        return null;
    }

    public static function save($dir, $contents)
    {
        $parts = explode('/', $dir);
        $file = array_pop($parts);
        $dir = '';
        foreach ($parts as $part) {
            $dir .= $part . "/";
            if (!is_dir(APP_PATH . $dir)) {
                mkdir(APP_PATH . $dir);
            }
        }

        file_put_contents(APP_PATH . $dir . $file, $contents);
    }

    public static function createDir($dir)
    {
        // TODO: unline the function on top it doesnt not work for recursive elements, do we even need it?
        // TODO: maybe should be is_dir
        if (file_exists($dir)) {
            return;
        }
        mkdir($dir);
    }

    /**
     * @typedef scanDirectoriesOptions {
     * exclude_paths?: array
     * include_paths?: array
     * }
     */

    /**
     * @param scanDirectoriesOptions $options
     */
    public static function scanDirectories($options = [], $callback, $parent_dir = "", $level = 0)
    {
        foreach (scandir(APP_PATH . $parent_dir) as $file) {
            $path = $parent_dir . $file;
            if (str_replace(".", "", $file) == "") {
                continue;
            }
            if ($level === 0) {
                if (isset($options["exclude_paths"]) && in_array($file, $options["exclude_paths"])) {
                    continue;
                }
                if (isset($options["include_paths"]) && !in_array($file, $options["include_paths"])) {
                    continue;
                }
            }
            if (is_dir($path)) {
                self::scanDirectories($options, $callback, $path . "/", $level + 1);
                continue;
            }
            $first_line = def(file($path), 0, "");

            $callback($path, $first_line, $parent_dir);
        }
    }

    public static function getAnnotationPHP($type, $line)
    {
        if (preg_match("/<\?php \/\/$type\[.*\]/", $line, $match)) {
            return substr($match[0], strlen("<?php //" . $type . "["), -1);
        }
    }

    public static function getAnnotationRoute($line)
    {
        $type = "route";

        $url = "";
        if (preg_match("/<\?php \/\/$type\[.*\]/", $line, $match)) {
            $url = substr($match[0], strlen("<?php //" . $type . "["), -1);
        } else {
            return $url;
        }

        if (preg_match("/\{.*\}/", $url, $matches)) {
            $static_url_width_curly_braces = $matches[0];
            $static_url = substr($static_url_width_curly_braces, 1, -1);
            if (isset(Request::$static_urls[$static_url])) {
                $url = str_replace($static_url_width_curly_braces, Request::$static_urls[$static_url], $url);
            }
        }

        return $url;
    }

    public static function getAnnotation($type, $line, $parent_dir)
    {
        if (preg_match('/\*.*\*/', $line) && preg_match("/(?<=$type\[).*(?=\])/", $line, $match)) {
            $scope = $match[0];
            if ($scope === "view") {
                $view_path = $parent_dir . "view.php";
                if (file_exists($view_path)) {
                    $first_line = def(file($view_path), 0, "");
                    if ($url = Files::getAnnotationRoute($first_line)) {
                        $scope = "views" . $url;
                    }
                }
            }

            return $scope;
        }
        return null;
    }
}

function version($scope)
{
    global $build_info;
    return def($build_info, ["scopes", $scope, "version"], 0);
}
