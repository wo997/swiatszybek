<?php //route[{ADMIN}test-view]

use MatthiasMullie\Minify;

use Patchwork\JSqueeze;

$js = "
const a = abc(`12`);

function abc(vars){
    var qwerty = \"123\" + vars;
    qwerty += qwerty;
    return qwerty;
}
console.log(a);
function lop(numberxxx,cipa){
    alert(numberxxx + cipa);
  }
  lop(2,3);
";

/*$js = "function lop(numberxxx,cipa){
    alert(numberxxx + cipa);
  }
  lop(2,3);";*/

// $myPacker = new GK\JavascriptPacker($js, 10);
// die($myPacker->pack());

// $minifiedCode = \JShrink\Minifier::minify($js, array('flaggedComments' => false));
// die($minifiedCode);

$minifier = new Minify\JS($js);
saveFile(BUILDS_PATH . "piesek.js", $minifier->minify());
die;


$jz = new JSqueeze();
$minifiedJs = $jz->squeeze(
    $js,
    true,
    false
);
die($minifiedJs);

?>

<?php startSection("head_content"); ?>

<title>Zaawansowane</title>



<?php startSection("header"); ?>

<div class="custom-toolbar">
    <span class="title">Zaawansowane</span>
    <button class="btn primary" onclick="saveZawansowane()">Zapisz <i class="fa fa-save"></i></button>
</div>

<?php startSection("body_content"); ?>


<div class="my_component"></div>

<?php include "admin/page_template.php"; ?>