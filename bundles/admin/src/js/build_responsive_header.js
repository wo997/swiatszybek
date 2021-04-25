/* js[admin] */

function buildResponsiveHeader() {
	previewUrl("/experimental");
	const preview_url = $("#previewUrl");
	preview_url.classList.add("hidden");
	showLoader();
}

window.addEventListener(
	"message",
	(event) => {
		// @ts-ignore
		if (event.origin !== window.location.origin || event.data !== "iframe_domload") {
			return;
		}

		const preview_url = $("#previewUrl");
		preview_url.style.visibility = "hidden";

		/** @type {HTMLIFrameElement} */
		// @ts-ignore
		const iframe = preview_url._child("iframe");

		let out_x = 2000;
		iframe.style.width = `${out_x}px`;

		// binary search
		let in_x = 1000;

		let min_height;

		/** @type {HTMLElement} */
		const header_main = iframe.contentWindow.document.querySelector("header.main");

		const test = (width) => {
			header_main.style.width = `${width}px`;
			return header_main.offsetHeight;
		};

		let knows;
		let height_in;
		let height_out;

		while (Math.abs(out_x - in_x) > 5) {
			if (knows !== "out") {
				height_out = test(out_x);
			}
			if (knows !== "in") {
				height_in = test(in_x);
			}

			if (min_height === undefined) {
				min_height = height_out;
			}

			const mid_x = (in_x + out_x) / 2;

			const height_mid = test(mid_x);

			if (height_mid <= min_height) {
				height_out = height_mid;
				out_x = mid_x;
				knows = "in";
			} else {
				height_in = height_mid;
				in_x = mid_x;
				knows = "out";
			}
		}

		/** @type {HTMLElement} */
		const main_menu = iframe.contentWindow.document.querySelector("nav.main_menu");
		const inner_responsive_width = main_menu.offsetWidth + 10; // 10 is just a tiny margin
		const outer_responsive_width = out_x + 100; // 100 is a width that can differ for non logged in user, there is for example zaloguj się label, it's 75px wider or so

		xhr({
			url: STATIC_URLS["ADMIN"] + "/theme/build_header",
			params: {
				inner_responsive_width,
				outer_responsive_width,
			},
			success: () => {
				showNotification("Zmodyfikowano wymiary menu", {
					one_line: true,
					type: "success",
				});
				//window.location.reload(); // intrusive, u can actually just open an empty iframe and that would build everything. funny, right?
				hideLoader();

				// build the page in background, hope nobody will notice
				xhr({ url: "/pusta-strona", success: () => {} });
			},
		});

		hideModal("previewUrl");
		setTimeout(() => {
			preview_url.style.visibility = "";
		}, 1000);
	},

	false
);
