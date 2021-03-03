/* js[global] */

let header_modals_only = false;
let header_use_modals = false;

function headerResizeCallback() {
	if (!main_header) {
		return;
	}

	header_modals_only = window.innerWidth < 700;
	main_header.classList.toggle("modals_only", header_modals_only);

	header_use_modals = header_modals_only || IS_TOUCH_DEVICE;
	main_header.classList.toggle("use_modals", header_use_modals);

	main_header.classList.remove("menu_collapsed");
	main_header_nav.classList.remove("bottom");
	main_header_nav.classList.toggle("bottom", main_header.offsetHeight > 100);
	const menu_collapsed = header_use_modals || main_header_nav.offsetWidth > main_header.offsetWidth + 1;
	main_header.classList.toggle("menu_collapsed", menu_collapsed);
	main_header_height.style.height = main_header.offsetHeight + "px";

	if (header_use_modals) {
		requestHeaderModals();
	}
}

/** @type {PiepNode} */
let main_header;
/** @type {PiepNode} */
let main_header_buttons;
/** @type {PiepNode} */
let main_header_height;
/** @type {PiepNode} */
let main_header_nav;
domload(() => {
	main_header = $("header.main");
	if (!main_header) {
		return;
	}
	main_header_height = $(".header_height");
	main_header_buttons = main_header._child(".header_buttons");
	main_header_nav = main_header._child("nav");
	headerResizeCallback();
	window.addEventListener("resize", headerResizeCallback);
});

windowload(() => {
	if (!main_header) {
		return;
	}
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

domload(() => {
	$$(`.headerbtn_menu`).forEach((e) => {
		e.addEventListener("mousewheel", (event) => {
			// @ts-ignore
			if ((event.deltaY < 0 && e.scrollTop < 1) || (event.deltaY > 0 && e.scrollTop > e.scrollHeight - e.offsetHeight - 1)) {
				event.preventDefault();
			} else {
				event.stopPropagation();
			}
		});
	});
});
