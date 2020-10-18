<?php

require_once 'vendor/facebook/graph-sdk/src/Facebook/autoload.php';

$fb_client = new Facebook\Facebook([
    'app_id' => "xxx", //secret('facebook_app_id'),
    'app_secret' => "zzz", //secret('facebook_app_secret'),
    'default_graph_version' => 'v2.5',
]);

$fb_helper = $fb_client->getRedirectLoginHelper();
$fb_permissions = ['email']; // Optional permissions
$fb_login_url = $fb_helper->getLoginUrl(SITE_URL . "/facebook/login_callback", $fb_permissions);
$fb_login_btn = '<div class="fb-wrapper"><a class="fb_button" href="' . htmlspecialchars($fb_login_url) . '"><i class="fab fa-facebook-square" style="font-size: 18px;vertical-align: middle;margin-right: 3px;"></i> Zaloguj się przez Facebook\'a</a></div>';
