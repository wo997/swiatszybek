/* js[view] */

domload(() => {
	const toggle_free_from = $(".toggle_free_from");

	toggle_free_from.addEventListener("change", () => {
		expand($(".case_free_from"), toggle_free_from._get_value());
	});
});
