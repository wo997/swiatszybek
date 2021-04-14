/* js[view] */

/** @type {PiepCMS} */
let piep_cms;

domload(() => {
	piep_cms = new PiepCMS($(".piep_editor"));
});
