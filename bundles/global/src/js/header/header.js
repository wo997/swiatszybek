/* js[modules/main_menu] */

/** @type {PiepNode} */
let main_header;
/** @type {PiepNode} */
let main_header_buttons;
/** @type {PiepNode} */
let main_header_nav;
let header_modals_only = false;
let header_use_modals = false;

function headerResizeCallback() {
	if (!main_header) {
		return;
	}

	header_height = main_header.offsetHeight;

	const main_search_wrapper = $(".main_search_wrapper");
	const r = main_search_wrapper.getBoundingClientRect();
	document.documentElement.style.setProperty("--main_search_wrapper_width", `${r.width}px`);
	main_search_wrapper.classList.toggle("wanna_expand", r.width < 400);
	main_search_wrapper.classList.toggle("expand_both", r.left < window.innerWidth * 0.5);
}

domload(() => {
	main_header = $("header.main");
	if (!main_header) {
		return;
	}
	main_header_buttons = main_header._child(".header_buttons");
	main_header_nav = main_header._child("nav");

	requestHeaderModals();
	window.addEventListener("resize", headerResizeCallback);
	headerResizeCallback();

	const onScroll = () => {
		const scroll_top = document.documentElement.scrollTop;

		let res = { other_header_visible: false };
		window.dispatchEvent(
			new CustomEvent("main_header_scroll", {
				detail: {
					res,
				},
			})
		);

		const min = scroll_top - main_header.offsetHeight;
		const max = scroll_top - main_header.offsetHeight * (res.other_header_visible ? 1 : 0);
		main_header.classList.toggle("invisible", !!res.other_header_visible);
	};
	document.addEventListener("scroll", onScroll);
	onScroll();
});
