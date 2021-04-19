<?php

Assets::build();

Request::jsonResponse(["ASSETS_RELEASE" => ASSETS_RELEASE]);
