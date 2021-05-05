<?php //route[/cms_page_test]

$page_id = intval(Request::urlParam(1, -1));

renderPage($page_id);
