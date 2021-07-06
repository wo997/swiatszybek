/* js[piep_cms_dependencies] */
{
	/**
	 * @type {{
	 * description: string
	 * classes: string[]
	 * }[]}
	 */
	const icons = [
		{ classes: ["fas", "fa-chevron-right"], description: "chevron right strzałka szewron prawo " },
		{ classes: ["fas", "fa-chevron-left"], description: "chevron left strzałka szewron lewo" },
		{ classes: ["fas", "fa-chevron-up"], description: "chevron up strzałka szewron góra" },
		{ classes: ["fas", "fa-chevron-down"], description: "chevron down strzałka szewron dół" },
		{ classes: ["fas", "fa-shopping-cart"], description: "shopping cart koszyk" },
		{ classes: ["fas", "fa-cart-plus"], description: "shopping cart plus add koszyk dodaj plus" },
		{ classes: ["fas", "fa-angle-double-right"], description: "angle double right podwójna strzałka prawo" },
		{ classes: ["fas", "fa-angle-double-left"], description: "angle double left podwójna strzałka lewo" },
		{ classes: ["fas", "fa-angle-double-up"], description: "angle double up podwójna strzałka góra" },
		{ classes: ["fas", "fa-angle-double-down"], description: "angle double down podwójna strzałka dół" },
		{ classes: ["fas", "fa-check"], description: "check podwójna strzałka dół" },
		{ classes: ["fas", "fa-times"], description: "times krzyżyk razy" },
		{ classes: ["fas", "fa-ellipsis-h"], description: "ellipsis horizontal wielokropek poziomy" },
		{ classes: ["fas", "fa-ellipsis-v"], description: "ellipsis vertical wielokropek pionowy" },
		{ classes: ["fas", "fa-thumbs-up"], description: "thumbs up like polubienie" },
		{ classes: ["fab", "fa-facebook-f"], description: "facebook social" },
		{ classes: ["fab", "fa-facebook"], description: "facebook social" },
		{ classes: ["fab", "fa-facebook-messenger"], description: "facebook messenger social" },
		{ classes: ["fab", "fa-instagram-square"], description: "instagram social" },
		{ classes: ["fab", "fa-instagram"], description: "instagram social" },
		{ classes: ["fab", "fa-twitter"], description: "twitter social" },
		{ classes: ["fab", "fa-twitter-square"], description: "twitter social" },
		{ classes: ["fab", "fa-youtube"], description: "youtube social" },
		{ classes: ["fab", "fa-youtube-square"], description: "youtube social" },
		{ classes: ["fas", "fa-arrow-right"], description: "strzałka prawo" },
		{ classes: ["fas", "fa-arrow-left"], description: "arrow left strzałka lewo" },
		{ classes: ["fas", "fa-arrow-up"], description: "arrow up strzałka góra" },
		{ classes: ["fas", "fa-arrow-down"], description: "arrow down strzałka dół" },
		{ classes: ["fas", "fa-address-book"], description: "address book książka adresowa" },
		{ classes: ["far", "fa-address-book"], description: "address book książka adresowa" },
		{ classes: ["fas", "fa-clipboard"], description: "clipboard schowek" },
		{ classes: ["far", "fa-clipboard"], description: "clipboard schowek" },
		{ classes: ["fas", "fa-clipboard-check"], description: "clipboard check schowek" },
		{ classes: ["fas", "fa-comment"], description: "comment komentarz" },
		{ classes: ["far", "fa-comment"], description: "comment komentarz" },
		{ classes: ["fas", "fa-comments"], description: "comments komentarze" },
		{ classes: ["far", "fa-comments"], description: "comments komentarze" },
		{ classes: ["fas", "fa-file"], description: "file plik" },
		{ classes: ["far", "fa-file"], description: "file plik" },
		{ classes: ["fas", "fa-phone"], description: "phone telefon" },
		{ classes: ["fas", "fa-phone-alt"], description: "phone telefon" },
		{ classes: ["fas", "fa-phone-square"], description: "phone telefon" },
		{ classes: ["fas", "fa-phone-square-alt"], description: "phone telefon" },
		{ classes: ["fas", "fa-smile"], description: "smile uśmiech" },
		{ classes: ["far", "fa-smile"], description: "smile uśmiech" },
		{ classes: ["fas", "fa-smile-wink"], description: "smile wink uśmiech oczko" },
		{ classes: ["far", "fa-smile-wink"], description: "smile wink uśmiech oczko" },
		{ classes: ["fas", "fa-user"], description: "user użytkownik" },
		{ classes: ["far", "fa-user"], description: "user użytkownik" },
		{ classes: ["fas", "fa-arrow-alt-circle-right"], description: "arrow right strzałka prawo" },
		{ classes: ["far", "fa-arrow-alt-circle-right"], description: "arrow right strzałka prawo" },
		{ classes: ["fas", "fa-arrow-alt-circle-left"], description: "arrow left strzałka lewo" },
		{ classes: ["far", "fa-arrow-alt-circle-left"], description: "arrow left strzałka lewo" },
		{ classes: ["fas", "fa-arrow-alt-circle-up"], description: "arrow up strzałka góra" },
		{ classes: ["far", "fa-arrow-alt-circle-up"], description: "arrow up strzałka góra" },
		{ classes: ["fas", "fa-arrow-alt-circle-down"], description: "arrow down strzałka dół" },
		{ classes: ["far", "fa-arrow-alt-circle-down"], description: "arrow down strzałka dół" },
		{ classes: ["fas", "fa-arrow-circle-right"], description: "arrow right strzałka prawo" },
		{ classes: ["fas", "fa-arrow-circle-left"], description: "arrow left strzałka lewo" },
		{ classes: ["fas", "fa-arrow-circle-up"], description: "arrow up strzałka góra" },
		{ classes: ["fas", "fa-arrow-circle-down"], description: "arrow down strzałka dół" },
		{ classes: ["fas", "fa-arrows-alt"], description: "arrows strzałki" },
		{ classes: ["fas", "fa-arrows-alt-h"], description: "arrows horizontal strzałki poziome" },
		{ classes: ["fas", "fa-arrows-alt-v"], description: "arrows vertical strzałki pionowe" },
		{ classes: ["fas", "fas fa-angle-right"], description: "angle right strzałka prawo" },
		{ classes: ["fas", "fa-angle-left"], description: "angle left strzałka lewo" },
		{ classes: ["fas", "fa-angle-up"], description: "angle up strzałka góra" },
		{ classes: ["fas", "fa-angle-down"], description: "angle down strzałka dół" },
		{ classes: ["fas", "fa-award"], description: "award nagroda" },
		{ classes: ["fas", "fa-battery-empty"], description: "battery empty pusta bateria rozładowana" },
		{ classes: ["fas", "fa-battery-full"], description: "battery full pełna bateria naładowana" },
		{ classes: ["fas", "fa-battery-half"], description: "battery half połowa baterii" },
		{ classes: ["fas", "fa-battery-quarter"], description: "battery quarter ćwierć baterii" },
		{ classes: ["fas", "fa-battery-three-quarters"], description: "battery three quarters trzy czwarte baterii" },
		{ classes: ["fas", "fa-bell"], description: "bell dzwonek" },
		{ classes: ["far", "fa-bell"], description: "bell dzwonek" },
		{ classes: ["fas", "fa-bell-slash"], description: "bell slash dzwonek przekreślony" },
		{ classes: ["far", "fa-bell-slash"], description: "bell slash dzwonek przekreślony" },
		{ classes: ["fas", "fa-box"], description: "box pudełko" },
		{ classes: ["fas", "fa-box-open"], description: "box open pudełko otwarte" },
		{ classes: ["fas", "fa-boxes"], description: "boxes pudełka" },
		{ classes: ["fas", "fa-calculator"], description: "calculator kalkulator" },
		{ classes: ["fas", "fa-calendar"], description: "calendar kalendarz" },
		{ classes: ["far", "fa-calendar"], description: "calendar kalendarz" },
		{ classes: ["fas", "fa-calendar-alt"], description: "calendar kalendarz" },
		{ classes: ["far", "fa-calendar-alt"], description: "calendar kalendarz" },
		{ classes: ["fas", "fa-calendar-check"], description: "calendar check kalendarz" },
		{ classes: ["far", "fa-calendar-check"], description: "calendar check kalendarz" },
		{ classes: ["fas", "fa-calendar-day"], description: "calendar day kalendarz dzień" },
		{ classes: ["fas", "fa-calendar-minus"], description: "calendar minus kalendarz" },
		{ classes: ["far", "fa-calendar-minus"], description: "calendar minus kalendarz" },
		{ classes: ["fas", "fa-calendar-plus"], description: "calendar plus kalendarz" },
		{ classes: ["far", "fa-calendar-plus"], description: "calendar plus kalendarz" },
		{ classes: ["fas", "fa-calendar-times"], description: "calendar times kalendarz krzyżyk" },
		{ classes: ["far", "fa-calendar-times"], description: "calendar times kalendarz krzyżyk" },
		{ classes: ["fas", "fa-calendar-week"], description: "calendar week kalendarz tydzień" },
		{ classes: ["fas", "fa-camera"], description: "camera aparat" },
		{ classes: ["fas", "fa-camera-retro"], description: "camera retro aparat" },
		{ classes: ["fas", "fa-angry"], description: "angry zły emoji" },
		{ classes: ["far", "fa-angry"], description: "angry zły emoji" },
		{ classes: ["fas", "fa-book"], description: "book książka" },
		{ classes: ["fas", "fa-book-open"], description: "book książka otwarta" },
		{ classes: ["fas", "fa-bookmark"], description: "bookmark zakładka" },
		{ classes: ["far", "fa-bookmark"], description: "bookmark zakładka" },
		{ classes: ["fas", "fa-business-time"], description: "business time czas" },
		{ classes: ["fas", "fa-chart-bar"], description: "chart bar wykres słupkowy" },
		{ classes: ["far", "fa-chart-bar"], description: "chart bar wykres słupkowy" },
		{ classes: ["fas", "fa-chart-line"], description: "chart line wykres liniowy" },
		{ classes: ["fas", "fa-chart-pie"], description: "chart pie wykres diagram kołowy" },
		{ classes: ["fas", "fa-copy"], description: "copy kopiowanie" },
		{ classes: ["far", "fa-copy"], description: "copy kopiowanie" },
		{ classes: ["fas", "fa-cut"], description: "cut wycinanie" },
		{ classes: ["fas", "fa-database"], description: "database baza danych" },
		{ classes: ["fas", "fa-desktop"], description: "desktop komputer" },
		{ classes: ["fas", "fa-dollar-sign"], description: "dollar sign dolar znak" },
		{ classes: ["fas", "fa-door-closed"], description: "door closed zamknięte drzwi" },
		{ classes: ["fas", "fa-door-open"], description: "door closed otwarte drzwi" },
		{ classes: ["fas", "fa-download"], description: "download pobierać" },
		{ classes: ["fas", "fa-edit"], description: "edit edytować" },
		{ classes: ["far", "fa-edit"], description: "edit edytować" },
		{ classes: ["fas", "fa-envelope"], description: "envelope koperta" },
		{ classes: ["far", "fa-envelope"], description: "envelope koperta" },
		{ classes: ["fas", "fa-envelope-open"], description: "envelope open koperta otwarta" },
		{ classes: ["far", "fa-envelope-open"], description: "envelope open koperta otwarta" },
		{ classes: ["fas", "fa-envelope-open-text"], description: "envelope open text koperta otwarta tekst" },
		{ classes: ["fas", "fa-envelope-square"], description: "envelope koperta" },
		{ classes: ["fas", "fa-equals"], description: "equals równa się" },
		{ classes: ["fas", "fa-eraser"], description: "eraser gumka" },
		{ classes: ["fas", "fa-euro-sign"], description: "euro sign znak" },
		{ classes: ["fas", "fa-exclamation"], description: "exclamation wykrzyknik" },
		{ classes: ["fas", "fa-exclamation-circle"], description: "exclamation wykrzyknik" },
		{ classes: ["fas", "fa-exclamation-triangle"], description: "exclamation wykrzyknik" },
		{ classes: ["fas", "fa-external-link-alt"], description: "external link zewnętrzny" },
		{ classes: ["fas", "fa-external-link-square-alt"], description: "external link zewnętrzny" },
		{ classes: ["fas", "fa-eye"], description: "eye oko" },
		{ classes: ["far", "fa-eye"], description: "eye oko" },
		{ classes: ["fas", "fa-file-alt"], description: "file plik" },
		{ classes: ["far", "fa-file-alt"], description: "file plik" },
		{ classes: ["fas", "fa-file-image"], description: "file image grafika" },
		{ classes: ["far", "fa-file-image"], description: "file image grafika" },
		{ classes: ["fas", "fa-file-pdf"], description: "file pdf plik" },
		{ classes: ["far", "fa-file-pdf"], description: "file pdf plik" },
		{ classes: ["fas", "fa-file-excel"], description: "file excel plik" },
		{ classes: ["far", "fa-file-excel"], description: "file excel plik" },
		{ classes: ["fas", "fa-file-word"], description: "file word plik" },
		{ classes: ["far", "fa-file-word"], description: "file word plik" },
		{ classes: ["fas", "fa-file-powerpoint"], description: "file powerpoint plik" },
		{ classes: ["far", "fa-file-powerpoint"], description: "file powerpoint plik" },
		{ classes: ["fas", "fa-file-audio"], description: "file audio plik" },
		{ classes: ["far", "fa-file-audio"], description: "file audio plik" },
		{ classes: ["fas", " fa-file-video"], description: "file video plik wideo" },
		{ classes: ["far", " fa-file-video"], description: "file video plik wideo" },
		{ classes: ["fas", "fa-file-upload"], description: "file upload wgrać plik" },
		{ classes: ["fas", "fa-file-download"], description: "file download pobierać plik" },
		{ classes: ["fas", "fa-folder"], description: "folder" },
		{ classes: ["far", "fa-folder"], description: "folder" },
		{ classes: ["fas", "fa-folder-open"], description: "folder open otwarty" },
		{ classes: ["far", "fa-folder-open"], description: "folder open otwarty" },
		{ classes: ["far", "fa-folder-minus"], description: "folder minus" },
		{ classes: ["far", "fa-folder-plus"], description: "folder plus" },
		{ classes: ["fas", "fa-font"], description: "font czcionka" },
		{ classes: ["fas", "fa-forward"], description: "forward do przodu" },
		{ classes: ["fas", "fa-backward"], description: "backward do tyłu" },
		{ classes: ["fas", "fa-glass-cheers"], description: "cheers toast" },
		{ classes: ["fas", "fa-greater-than"], description: "greater than większy niż" },
		{ classes: ["fas", "fa-greater-than-equal"], description: "greater than equal większy lub równy" },
		{ classes: ["fas", "fa-less-than"], description: "less than mniejszy niż" },
		{ classes: ["fas", "fa-less-than-equal"], description: "less than equal mniejszy lub równy" },
	];

	piep_cms_manager.registerProp({
		name: "fa_icon",
		blc_groups: [
			{
				module_names: ["fa_icon"],
				priority: 100,
			},
		],
		type_groups: ["advanced"],
		menu_html: html`
			<div class="label">Ikonka</div>
			<div class="float_icon mb2">
				<input class="field filter_icons" placeholder="Filtruj ikonki..." />
				<i class="fas fa-search"></i>
			</div>
			<div class="scroll_panel scroll_shadow" style="max-height: 200px;">
				<div class="pretty_radio global_root icon_input" style="--columns: 8;--box-padding: 5px 0;font-size: 20px;">
					${icons
						.map(
							(b) => html`
								<div class="checkbox_area" data-description="${b.description}">
									<p-checkbox data-value="${b.classes.join(" ")}"></p-checkbox>
									<i class="${b.classes.join(" ")}"></i>
								</div>
							`
						)
						.join("")}
				</div>
			</div>
		`,
		init: (piep_cms, menu_wrapper) => {
			const icon_input = menu_wrapper._child(".icon_input");
			const filter_icons = menu_wrapper._child(".filter_icons"); // TODO: DO THIS, empty on open btw ;)
			piep_cms.container.addEventListener("set_blc_menu", () => {
				const v_node = piep_cms.getFocusVNode();
				if (!v_node) {
					return;
				}

				filter_icons._set_value("");

				let first_class = "";
				let second_class = "";
				v_node.classes.forEach((c) => {
					const icon = icons.find((i) => i.classes[0] === c);
					if (icon) {
						first_class = icon.classes[0];
					}
				});
				v_node.classes.forEach((c) => {
					const icon = icons.find((i) => i.classes[1] === c);
					if (icon) {
						second_class = icon.classes[1];
					}
				});
				icon_input._set_value(first_class + " " + second_class, { quiet: true });

				const checked = icon_input._child(".checked");
				if (checked) {
					scrollIntoView(checked, { duration: 0 });
				}
			});
			icon_input.addEventListener("change", () => {
				const v_node = piep_cms.getFocusVNode();
				if (!v_node) {
					return;
				}
				/** @type {string} */
				const classes_str = icon_input._get_value();
				const classes = classes_str.split(" ");
				icons.forEach((i) => {
					piep_cms.removeClasses(v_node, ...i.classes);
				});
				piep_cms.addClasses(v_node, ...classes);
				piep_cms.update({ dom: true });
			});
			const filterChange = () => {
				const filter = filter_icons._get_value();
				icon_input._direct_children().forEach((e) => {
					e.classList.toggle("hidden", !e.dataset.description.includes(filter));
				});
			};
			filter_icons.addEventListener("input", filterChange);
			filter_icons.addEventListener("change", filterChange);
		},
	});

	piep_cms_manager.registerBlcSchema({
		id: "fa_icon",
		icon: html`<i class="fas fa-icons"></i>`,
		label: html`Ikonka`,
		group: "text",
		priority: 5,
		inline: true,
		layout_schema: "just_content",
		v_node: {
			tag: "i",
			id: -1,
			styles: {},
			classes: ["fas", "fa-chevron-right"],
			module_name: "fa_icon",
			attrs: {},
		},
	});
}
