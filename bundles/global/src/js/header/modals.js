/* js[global] */

let requested_header_modals = false;
function requestHeaderModals() {
	if (requested_header_modals) return;
	requested_header_modals = true;

	//user
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

	//basket
	registerModalContent(html`
		<div id="basketMenu" data-expand data-dismissable>
			<div class="modal_body">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header" style="max-width: 500px;">
					<div class="basket_icon_wrapper">
						<img class="basket_icon" src="/src/img/basket_icon.svg" />
						<div class="cart_product_count"></div>
					</div>
					Koszyk
				</h3>
				<div class="scroll_panel scroll_shadow panel_padding">
					<div></div>
				</div>
				<div style="display:flex;padding:0 5px 5px" class="cart_menu_mobile_summary footer"></div>
			</div>
		</div>
	`);

	// const su = $("header .nav_cart_summary");
	// $("#basketMenu .cart_menu_mobile_summary").insertAdjacentHTML("afterbegin", su.outerHTML);

	// const hc = $("header .header_basket_content_wrapper");
	// $("#basketMenu .scroll_panel > div").appendChild(hc);

	const bbtn = $("header .cart_wrapper .basket-btn");
	if (bbtn) {
		bbtn.addEventListener("click", (ev) => {
			if (header_use_modals) {
				showModal("basketMenu", { source: bbtn });
				ev.preventDefault();
				return false;
			}
		});
	}

	// last viewed products
	registerModalContent(html`
		<div id="lastViewedProducts" data-expand="previous" data-dismissable>
			<div class="modal_body">
				<button class="close_modal_btn"><i class="fas fa-times"></i></button>
				<h3 class="modal_header">
					<img class="product_history_icon" src="/src/img/product_history_icon.svg" />
					Ostatnio przeglądane
				</h3>
				<div class="scroll_panel scroll_shadow panel_padding">
					<div></div>
				</div>
				<div style="display:flex;padding:0 5px 5px" class="cart_menu_mobile_summary footer"></div>
			</div>
		</div>
	`);

	const lvps = $("#lastViewedProducts .scroll_panel > div");
	lvps.insertAdjacentHTML("beforeend", $(".last_viewed_products").outerHTML);

	// wishlist
	registerModalContent(html`
      <div id="wishList" data-expand="previous" data-dismissable>
        <div class="modal_body">
            <button class="close_modal_btn"><i class="fas fa-times"></i></button>
            <h3 class="modal_header">
              <img class="heart_icon" src="/src/img/heart_icon.svg"></img>
              Schowek  
            </h3>
            <div class="scroll_panel scroll_shadow panel_padding">
              <div></div>
            </div>
            <div style='display:flex;padding:0 5px 5px' class='cart_menu_mobile_summary footer'></div>
        </div>
    </div>
  `);

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

	//menu
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
		html`
			<li>
				<a onclick="showModal('lastViewedProducts',{source:this});return false;">
					<img class="product_history_icon" src="/src/img/product_history_icon.svg" /> Ostatnio przeglądane produkty
				</a>
			</li>
			<li>
				<a onclick="showModal('wishList',{source:this});return false;">
					<img class="heart_icon" src="/src/img/heart_icon.svg" /> Schowek
				</a>
			</li>
		`
	);

	$$("#mainMenu ul:not(.level_0)").forEach((ul) => {
		const a = ul._prev();
		a.insertAdjacentHTML("beforeend", `<button class="expand_btn btn transparent"><i class="fas fa-chevron-right"></button>`);
		ul.classList.add("expand_y", "hidden", "animate_hidden");
	});

	$("#mainMenu").addEventListener("click", (ev) => {
		const target = $(ev.target);

		const expand_btn = target._parent(".expand_btn", { skip: 0 });
		if (expand_btn) {
			const open = expand_btn.classList.toggle("open");
			expand(expand_btn._parent()._next(), open);
			ev.preventDefault();
			return false;
		}
	});
}
