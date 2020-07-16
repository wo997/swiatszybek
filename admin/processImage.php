<?php //->[admin/processImage]

function compress($source, $output_file, $quality) {
  $info = getimagesize($source);

  $width = $info[0];
  $height = $info[1];

  if ($info['mime'] == 'image/jpeg')
      $image = imagecreatefromjpeg($source);

  elseif ($info['mime'] == 'image/png')
      $image = imagecreatefrompng($source);

  /*if ($width > 4200 || $height > 4200)
    $image = imagescale($image,floor($width/4),floor($height/4));
  else if ($width > 2800 || $height > 2800)
    $image = imagescale($image,floor($width/2),floor($height/2));
  else if ($width > 2100 || $height > 2100)
    $image = imagescale($image,floor($width/2),floor($height/2));*/
  /*else if ($width > 1400 || $height > 1400)
    $image = imagescale($image,floor($width/2),floor($height/2));*/

  $factor = 1;
  if ($width > 4500 || $height > 4500) {
    $factor = 6;
  }
  if ($width > 3000 || $height > 3000) {
    $factor = 4;
  }
  if ($width > 2250 || $height > 2250) {
    $factor = 3;
  }
  else if ($width > 1500 || $height > 1500) {
    $factor = 2;
  }
  $width = floor($width/$factor);
  $height = floor($height/$factor);

  $image = imagescale($image,$width,$height);
  $output = imagecreatetruecolor($width, $height);
  $white = imagecolorallocate($output,  255, 255, 255);
  imagefilledrectangle($output, 0, 0, $width, $height, $white);
  imagecopy($output, $image, 0, 0, 0, 0, $width, $height);
  imagejpeg($output, $output_file, $quality);
}

$extensions = ['jpg', 'jpeg', 'png', 'gif'];

if ($app["user"]["is_admin"] && $_SERVER['REQUEST_METHOD'] === 'POST')
{
  if (isset($_POST['alsoDelete']))
  {
    $src = $_POST['alsoDelete'];
    $real_src = "..$src";
    if (file_exists($real_src)) unlink($real_src);
    $src = substr($src,1);
    $stmt = $con->prepare("DELETE FROM images WHERE path = ?");
    $stmt->bind_param("s", $src);
    $stmt->execute();
    $stmt->close();
  }
}
if ($app["user"]["is_admin"] && isset($_POST['base64']))
{
  global $extensions;
  $image_parts = explode(";base64,", $_POST['base64']);
  $image_type_aux = explode("image/", $image_parts[0]);
  $file_type = $image_type_aux[1];
  $image_base64 = base64_decode($image_parts[1]);
  $tmp = 'tmp.'.$file_type;
  file_put_contents($tmp, $image_base64);

  if (in_array($file_type, $extensions)) {
    newFile(-1,$file_type,$tmp,"base64");
  }
}
if ($app["user"]["is_admin"] && $_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['files'])) {
  global $extensions;

  $all_files = count($_FILES['files']['tmp_name']);
  //$output = [];
  for ($i = 0; $i < $all_files; $i++) {
    $errors = [];
    $file_name = $_FILES['files']['name'][$i];
    $file_tmp = $_FILES['files']['tmp_name'][$i];
    $file_type = str_replace("image/","",$_FILES['files']['type'][$i]);
    $file_size = $_FILES['files']['size'][$i];
    $var = explode('.', $_FILES['files']['name'][$i]);
    $file_ext = strtolower(end($var));
    if (!in_array($file_ext, $extensions)) {
      $errors[] = 'Extension not allowed: ' . $file_name . ' ' . $file_type;
    }
    if ($file_size > 500971520) {
      $errors[] = 'File size exceeds limit: ' . $file_name . ' ' . $file_type;
    }
    if (empty($errors)) {
      newFile($i,$file_type,$file_tmp,$file_name);
    }
    else {
      var_dump($errors);
      die("ppp");
    }
  }
}

function newFile($i,$file_type,$file_tmp,$file_name) {
  global $con;
  //move_uploaded_file($file_tmp, $file);

  $file_type = "jpg";

  $tag = $_POST['tag'];
  if (!$tag) $tag = rand(100,999)."-";
  $tag_free = getLink($tag);

  $path = 'uploads/';
  $file = $path . $tag_free;

  $iterator = 0;
  while (true)
  {
    $stmt = $con->prepare("SELECT COUNT(*) FROM images WHERE path = ?");
    $repeat = $file . "." . $file_type;
    $stmt->bind_param("s", $repeat);
    $stmt->execute();
    $stmt->bind_result($count);
    mysqli_stmt_fetch($stmt);
    $stmt->close();
    if ($count > 0) {
      $iterator++;
      $file = $path . $tag_free . "-" . $iterator;
    }
    else break;
    if ($iterator > 100)
    {
      $file = $path . time() . $i . "-" . $tag_free;
      break;
    }
  }

  $file_type = "jpg";

  $file .= "." . $file_type;
  
  compress($file_tmp, $file, 100);

  /*if ($i == -1) 
  {
    copy($file_tmp, $file);
  }
  else {
    
    compress($file_tmp, $file, 100);
    move_uploaded_file($file_tmp, $file);
  }*/

  $stmt = $con->prepare("INSERT INTO `images`(`name`, `path`, `tag`, `added`) VALUES (?,?,?,NOW())");
  $stmt->bind_param("sss", $file_name, $file, $tag);
  $stmt->execute();
  $stmt->close();
}

// return list
$split = isset($_POST['search']) ? $_POST['search'] : "";
if (strlen($split)>0 && $split[0] == " ") $split = substr($split,1);
$split = str_replace("  "," ",$split);
$list = explode(" ", $split);
$items = count($list);

$where = "WHERE 1";

for ($i=0;$i<$items;$i++)
{
  if ($i > 4) break;
  $clear = mysqli_real_escape_string($con,$list[$i]);
  $search = "%$clear%";

  $where .= " AND (
    `path` LIKE '$search' OR
    `name` LIKE '$search' OR
    `tag` LIKE '$search')";
}

$output = [];

$stmt = $con->prepare("SELECT `path` FROM `images` $where ORDER BY `added` DESC LIMIT 120");
$stmt->execute();
$stmt->bind_result($path);
while (mysqli_stmt_fetch($stmt))
{
  $output[] = "/" . $path;
}
$stmt->close();

ob_clean();
echo json_encode($output);
