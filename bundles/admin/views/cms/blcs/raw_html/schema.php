<?php //hook[event]

EventListener::register("render_module_template_hook", function ($params) {
    return def($params, ["v_node", "settings", "html_code"]);
});
