<?php

// pick higher value of width and height
$image_default_dimensions = [
    "df" => null,
    "lg" => 1920,
    "bg" => 1200,
    "md" => 600,
    "sm" => 300,
    "tn" => 100,
];

$image_minified_formats = [
    "jpg",
    "webp"
];

// also global.js
function getUploadedFileName($file_path)
{
    return substr($file_path, strlen(UPLOADS_PLAIN_PATH));
}

function minifyImage($file_path)
{
    global $image_default_dimensions;

    $size_info = getimagesize($file_path);

    $file_extension = mime2ext($size_info['mime']);

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

    foreach ($image_default_dimensions as $image_wanted_name => $image_wanted_dimension) {
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

    $file_name_wo_extension = getFilenameWithoutExtension($file_path);

    foreach ($sizes as $size_name => $size) {
        $image_type_path = UPLOADS_PATH . $size_name;

        if (!is_dir($image_type_path)) {
            mkdir($image_type_path);
        }

        $copy_width = $size[0];
        $copy_height = $size[1];

        $output = imagecreatetruecolor($copy_width, $copy_height);
        $white = imagecolorallocate($output,  255, 255, 255);
        imagefilledrectangle($output, 0, 0, $copy_width, $copy_height, $white);
        imagecopyresized($output, $image, 0, 0, 0, 0, $copy_width, $copy_height, $width, $height);
        $final_path = "$image_type_path/$file_name_wo_extension.jpg";
        imagejpeg($output, $final_path, 100);

        imagewebp($output, "$image_type_path/$file_name_wo_extension.webp", 100);
    }
}


function getFilenameWithoutExtension($file_path)
{
    $path_info = pathinfo($file_path);
    $file_name = $path_info["basename"];
    $file_extension = $path_info["extension"];
    return substr($file_name, 0, - (1 + strlen($file_extension)));
}

/**
 * Inserts image into DB
 *
 * @param  mixed $file_tmp
 * @param  mixed $tag
 * @param  mixed $file_name
 * @param  mixed $counter
 * @return void
 */
function saveImage($tmp_file_path, $uploaded_file_name, $name, $try_to_minify_image = true)
{
    $mime_type = mime_content_type($tmp_file_path);
    $file_type = mime2ext($mime_type);
    $asset_type = getAssetTypeFromMime($mime_type);

    if (!$name) $name = rand(1000, 9999);

    // escape
    $name = getLink($name);

    $name_suffix = "";

    if ($try_to_minify_image && $asset_type == "image") {
        $info = getimagesize($tmp_file_path);

        $width = $info[0];
        $height = $info[1];

        /*if ($width * $height > 500971520) {
            return false;
        }*/

        // necessary for lazy loading and image optimization
        $name_suffix = "_" . $width . "x" . $height;
    }

    $iterator = 0;

    $base_path = $asset_type == "image" ? UPLOADS_PLAIN_PATH : UPLOADS_VIDEOS_PATH;

    // check available file_path
    $file_path = $base_path . $name . $name_suffix . "." . $file_type;
    while (true) {
        if (fetchValue("SELECT 1 FROM uploads WHERE file_path = ?", [$file_path])) {
            if ($iterator < 10) {
                $iterator++;
            } else if ($iterator > 10000) {
                die("CRITICAL ERROR!");
            } else {
                $iterator += rand(10, 100);
            }
            $file_path = $base_path . $name . "-" . $iterator . $name_suffix . "." . $file_type;
        } else break;
    }

    // save plain file
    copy($tmp_file_path, $file_path);

    query("INSERT INTO uploads(file_path, uploaded_file_name, asset_type) VALUES (?,?,?)", [
        $file_path, $uploaded_file_name, $asset_type
    ]);

    if ($try_to_minify_image && $asset_type == "image") {
        minifyImage($file_path);
    }

    return [
        "file_path" => $file_path,
        "asset_type" => $asset_type,
    ];
}

function deleteAssetByPath($path)
{
    global $image_default_dimensions, $image_minified_formats;

    $image_file_path = ltrim($path, "/");
    $file_name = getFilenameWithoutExtension($image_file_path);
    $asset_type = fetchValue("SELECT asset_type FROM uploads WHERE file_path = ?", [$image_file_path]);

    @unlink($image_file_path);

    if ($asset_type == "image") {
        foreach ($image_default_dimensions as $size_name => $area) {
            foreach ($image_minified_formats as $format) {
                $file_path = UPLOADS_PATH . $size_name . "/" . $file_name . "." . $format;
                if (file_exists($file_path)) {
                    @unlink($file_path);
                }
            }
        }
    }

    query("DELETE FROM uploads WHERE file_path = ?", [$image_file_path]);
}

function mime2ext($mime)
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

    return nonull($mime_map, $mime, false);
}

function getAssetTypeFromMime($mime)
{
    $x = explode("/", $mime);
    if (isset($x[1])) {
        return $x[0];
    }
    return null;
}
