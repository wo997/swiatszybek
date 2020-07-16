<?php 

include_once "kernel.php";

$products = "";
//$now = str_replace("/","T",date("Y-m-d/H:i:s+00.00"));
$now = date("Y-m-d");

$stmt = $con->prepare("SELECT i.product_id, title, link FROM products i WHERE i.published = 1");
$stmt->execute();
$stmt->bind_result($product_id, $title, $link);
while (mysqli_stmt_fetch($stmt))
{
    $products .= "<url>
        <loc>".getProductLink($product_id,$link)."</loc>
        <lastmod>$now</lastmod>
        <priority>0.80</priority>
        </url>";
}
$stmt->close();

$cms = "";

$stmt = $con->prepare("SELECT link FROM cms WHERE published = 1");
$stmt->execute();
$stmt->bind_result($link);
while (mysqli_stmt_fetch($stmt))
{
    $prio = 1-0.2*(1+substr_count($link,"/"));
    if ($link == "") $prio = 1;
    $cms .= "<url>
        <loc>$SITE_URL/$link</loc>
        <lastmod>$now</lastmod>
        <priority>$prio</priority>
        </url>";
}
$stmt->close();

$sitemap = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<url>
  <loc>$SITE_URL/logowanie</loc>
  <lastmod>$now</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>$SITE_URL/rejestracja</loc>
  <lastmod>$now</lastmod>
  <priority>0.8</priority>
</url>
$products
$cms
</urlset>
XML;

file_put_contents("sitemap.xml",$sitemap);