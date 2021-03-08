<?php //route[{ADMIN}/rebate_code/get]  

$id = Request::urlParam(3);

$rebate_code = EntityManager::getEntityById("rebate_code", $id);

Request::jsonResponse(["rebate_code" => $rebate_code->getAllProps()]);
