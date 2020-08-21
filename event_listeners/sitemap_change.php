<?php //event[sitemap_change]

$site_url = SITE_URL;

$productsXML = "";
//$now = str_replace("/","T",date("Y-m-d/H:i:s+00.00"));
$now = date("Y-m-d");

$products = fetchArray("SELECT i.product_id, title, link FROM products i WHERE i.published = 1");
foreach ($products as $product) {
  $productsXML .= "<url>
        <loc>" . getProductLink($product["product_id"], $product["link"]) . "</loc>
        <lastmod>$now</lastmod>
        <priority>0.80</priority>
        </url>";
}

$cmssXML = "";
$cmss = fetchArray("SELECT link FROM cms WHERE published = 1");
foreach ($cmss as $cms) {
  $prio = 1 - 0.2 * (1 + substr_count($cms["link"], "/"));
  if ($link == "") $prio = 1;
  $cmssXML .= "<url>
        <loc>$site_url/" . $cms["$link"] . "</loc>
        <lastmod>$now</lastmod>
        <priority>$prio</priority>
        </url>";
}

$sitemap = <<<XML
<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<url>
  <loc>$site_url/logowanie</loc>
  <lastmod>$now</lastmod>
  <priority>0.8</priority>
</url>
<url>
  <loc>$site_url/rejestracja</loc>
  <lastmod>$now</lastmod>
  <priority>0.8</priority>
</url>
$productsXML
$cmssXML
</urlset>
XML;

file_put_contents(BUILDS_PATH . "sitemap.xml", $sitemap);
