<?php

// things that should be here before the app is installed

include_once "bundles/global/helpers/debug.php";
include_once "bundles/global/helpers/general.php";

include_once "bundles/global/helpers/string.php";
include_once "bundles/global/helpers/date.php";
include_once "bundles/global/helpers/math.php";
include_once "bundles/global/helpers/array.php";
include_once "bundles/global/helpers/Files.php";
include_once "bundles/global/helpers/settings.php";

include_once "bundles/global/helpers/db/DB.php";
include_once "bundles/global/helpers/db/EntityManager.php";
include_once "bundles/global/helpers/db/Entity.php";

include_once "bundles/global/helpers/Minifiers.php";

include_once "bundles/global/helpers/email.php";
include_once "bundles/global/helpers/Request.php";

include_once "bundles/global/helpers/Security.php";
include_once "bundles/global/helpers/User.php";
include_once "bundles/global/helpers/Cart.php";
include_once "bundles/global/helpers/LastViewedProducts.php"; // must be here cause user owns these, not pretty but ok

include_once "bundles/global/helpers/EventListener.php";
include_once "bundles/global/helpers/datatable.php";
include_once "bundles/global/helpers/deployment.php";

include_once "bundles/global/helpers/Theme.php";
include_once "bundles/global/helpers/Templates.php";
include_once "bundles/global/helpers/PiepCMSManager.php";

include_once "bundles/global/helpers/company.php";
