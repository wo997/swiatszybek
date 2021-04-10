<?php //route[{ADMIN}/general_product/variant/all_with_options]

Request::jsonResponse([
    "variants" => getAllGeneralProductVariants(),
    "options" => getAllGeneralProductVariantOptions(),
]);
