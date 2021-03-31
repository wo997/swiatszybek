/* js[global] */

function requestHeaderModals() {
	// user
	if (IS_LOGGED) {
		registerModalContent(html`
			<div id="userMenu" data-expand data-dismissable>
				<div class="modal_body" style="max-width: 500px;">
					<button class="close_modal_btn"><i class="fas fa-times"></i></button>
					<h3 class="modal_header"><img class="user_icon" src="/src/img/user_icon.svg" /> Moje konto</h3>
					<div class="scroll_panel scroll_shadow">
						<div></div>
					</div>
				</div>
			</div>
		`);
		$("#userMenu .scroll_panel > div").insertAdjacentHTML("afterbegin", $("header .user_menu").outerHTML);

		const hua = $("header .user_btn");
		hua.addEventListener("click", (ev) => {
			if (header_use_modals) {
				showModal("userMenu", { source: hua });
				ev.preventDefault();
				return false;
			}
		});
	}

	// last viewed products
	registerModalContent(html`
		<div id="lastViewedProducts" data-dismissable>
			<div class="modal_body">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header">
					<img class="product_history_icon" src="/src/img/product_history_icon.svg" />
					Ostatnie
				</h3>
				<div class="put_it_here flex_stretch"></div>
			</div>
		</div>
	`);

	const last_viewed_products_menu = $(".last_viewed_products_menu");
	const move_this_last_viewed_part = $(".move_this_last_viewed_part");
	window.addEventListener("modal_show", (event) => {
		// @ts-ignore
		if (event.detail.node.id != "lastViewedProducts") {
			return;
		}
		$("#lastViewedProducts .put_it_here").append(move_this_last_viewed_part);
	});
	window.addEventListener("modal_hidden", (event) => {
		// @ts-ignore
		if (event.detail.node.id != "lastViewedProducts") {
			return;
		}
		last_viewed_products_menu.append(move_this_last_viewed_part);
	});

	// search
	const msb = $(".mobile_search_btn");

	msb.addEventListener("click", () => {
		showModal("mainSearch", {
			source: msb,
		});
		$("#mainSearch input").focus();
	});

	registerModalContent(html`
		<div id="mainSearch" data-expand data-dismissable>
			<div class="modal_body" style="max-width: 500px;">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header"><img class="search_icon" src="/src/img/search_icon.svg" /> Wyszukiwarka</h3>
				<div class="scroll_panel scroll_shadow panel_padding">
					<div></div>
				</div>
			</div>
		</div>
	`);

	const sc = $("#mainSearch .scroll_panel > div");
	const sw = $("header .main_search_wrapper");
	sc.insertAdjacentHTML("afterbegin", sw.outerHTML);

	// menu
	registerModalContent(html`
		<div id="mainMenu" data-expand data-dismissable>
			<div class="modal_body" style="max-width: 500px;">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header"><img class="menu_icon" src="/src/img/menu_icon.svg" /> Menu</h3>
				<div class="scroll_panel scroll_shadow">
					<div></div>
				</div>
			</div>
		</div>
	`);

	const mm = $("#mainMenu .scroll_panel > div");
	mm.insertAdjacentHTML("afterbegin", main_header_nav.outerHTML);
	mm._child(".main_menu > ul").insertAdjacentHTML(
		"beforeend",
		//<img class="product_history_icon" src="/src/img/product_history_icon.svg" />
		//<img class="heart_icon" src="/src/img/heart_icon.svg" />
		html`
			<li>
				<a onclick="showModal('lastViewedProducts',{source:this});return false;"> Ostatnio przeglądane produkty </a>
			</li>
			<!-- <li>
				<a onclick="showModal('wishList',{source:this});return false;">
					Schowek
				</a>
			</li> -->
		`
	);

	$$("#mainMenu ul:not(.level_0)").forEach((ul) => {
		const a = ul._prev();
		a.insertAdjacentHTML("beforeend", `<button class="expand_btn btn transparent"><i class="fas fa-chevron-right"></button>`);
		ul.classList.add("expand_y", "hidden", "animate_hidden");
	});

	$("#mainMenu").addEventListener("click", (ev) => {
		const target = $(ev.target);

		const expand_btn = target._parent(".expand_btn");
		if (expand_btn) {
			const open = expand_btn.classList.toggle("open");
			expand(expand_btn._parent()._next(), open);
			ev.preventDefault();
			return false;
		}
	});
}
