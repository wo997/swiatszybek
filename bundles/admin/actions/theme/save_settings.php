<?php //route[{ADMIN}/theme/save_settings]

Request::jsonResponse(Theme::saveSettings($_POST));
