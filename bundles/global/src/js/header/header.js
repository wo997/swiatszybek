/* js[!global] */

/** @type {PiepNode} */
let main_header;
/** @type {PiepNode} */
let main_header_buttons;
/** @type {PiepNode} */
let main_header_height;
/** @type {PiepNode} */
let main_header_nav;
let header_modals_only = false;
let header_use_modals = false;
let header_height = 0;

function headerResizeCallback() {
	if (!main_header) {
		return;
	}

	//header_modals_only = window.innerWidth < 700;
	//main_header.classList.toggle("modals_only", header_modals_only);

	//header_use_modals = header_modals_only || IS_TOUCH_DEVICE;
	//main_header.classList.toggle("use_modals", header_use_modals);

	//main_header.classList.remove("menu_collapsed");
	//main_header_nav.classList.remove("bottom");
	//main_header_nav.classList.toggle("bottom", main_header.offsetHeight > 100);
	//const menu_collapsed = header_use_modals || main_header_nav.offsetWidth > main_header.offsetWidth + 1;
	//main_header.classList.toggle("menu_collapsed", menu_collapsed);
	header_height = main_header.offsetHeight;
	document.documentElement.style.setProperty("--header_height", `${header_height}px`);

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
	main_header_height = $(".header_height");
	main_header_buttons = main_header._child(".header_buttons");
	main_header_nav = main_header._child("nav");

	window.addEventListener("resize", headerResizeCallback);
	headerResizeCallback();

	requestHeaderModals();

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
