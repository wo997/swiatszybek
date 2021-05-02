/* js[view] */

/** @type {PiepCMS} */
let piep_cms;

domload(() => {
	piep_cms = new PiepCMS($(".piep_editor"));

	$(".piep_editor_header .save").addEventListener("click", () => {
		// const errors = validateInputs(directCompNodes(comp, "[data-validate]"));

		// if (errors.length > 0) {
		// 	return;
		// }

		xhr({
			url: STATIC_URLS["ADMIN"] + "/page/save",
			params: {
				page: {
					page_id: page_data ? page_data.page_id : -1,
					v_dom_json: JSON.stringify(piep_cms.v_dom),
				},
			},
			success: (res) => {
				if (!res.page_id) {
					alert("Wystąpił błąd krytyczny");
					return;
				}

				showNotification(!page_data ? "Dodano stronę" : "Zapisano stronę", {
					one_line: true,
					type: "success",
				});

				page_data = res; // just dont be a null

				const make_sure_url_is_cool = `${STATIC_URLS["ADMIN"]}/strona/${res.page_id}`;
				history.replaceState(undefined, "", make_sure_url_is_cool);
			},
		});
	});

	let preview_url = "/";

	if (page_data.general_product) {
		$(".piep_editor_header .breadcrumbs").insertAdjacentHTML(
			"beforeend",
			html`
				<div class="crumb">${page_data.general_product.name}</div>
				<a
					class="btn subtle ml1"
					style="font-size:1rem"
					href="${STATIC_URLS["ADMIN"]}/produkt/${page_data.general_product.general_product_id}"
				>
					Edytuj produkt
					<i class="fas fa-cube"></i>
				</a>
			`
		);

		preview_url = page_data.general_product.__url;
	}

	$(".piep_editor_header .preview").addEventListener("click", () => {
		previewUrl(preview_url);
	});

	if (page_data) {
		try {
			const v_dom = JSON.parse(page_data.v_dom_json);
			piep_cms.import(v_dom);
		} catch {}
	}

	if (template_data) {
		try {
			const v_dom = JSON.parse(template_data.v_dom_json);
			piep_cms.import(v_dom);
		} catch {}
	}

	return;
	piep_cms.import([
		{
			id: 100,
			tag: "h1",
			text: "Dobry frejmwork",
			styles: { fontSize: "1.4rem", fontWeight: "var(--bold)", marginTop: "50px" },
			attrs: {},
			classes: [],
		},
		{
			id: 101,
			tag: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: {
				marginTop: "20px",
				marginLeft: "-10px",
				marginBottom: "-50px",
				marginRight: "30px",
				paddingTop: "20px",
				paddingLeft: "30px",
				paddingBottom: "40px",
				paddingRight: "50px",
				backgroundColor: "var(--clr_primary)",
			},
			attrs: {},
			classes: [],
		},
		{
			id: 102,
			tag: "h1",
			text: "123234234563456",
			styles: { fontSize: "1.4rem", fontWeight: "var(--normal)", color: "#d5d" },
			attrs: {},
			classes: [],
		},
		{
			id: 103,
			tag: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: { marginTop: "20px" },
			attrs: {},
			classes: [],
		},
		{
			tag: "div",
			id: 1234,
			text: undefined,
			styles: { padding: "10px", border: "1px solid yellow" },
			classes: ["columns_container"],
			attrs: {},
			children: [
				{
					id: 1238,
					tag: "div",
					styles: { padding: "10px", border: "1px solid red" },
					attrs: {},
					classes: ["vertical_container"],
					children: [
						{
							id: 1235,
							tag: "p",
							text: "AAA<br>AAA<br>AAA<br>AAA<br>AAA<br>AAA<br>AAA<br>AAA<br>AAA<br>AAA<br>",
							styles: { padding: "10px", border: "1px solid pink" },
							attrs: {},
							classes: [],
						},
					],
				},
				{
					id: 1239,
					tag: "div",
					styles: { padding: "10px", border: "1px solid red" },
					attrs: {},
					classes: ["vertical_container"],
					children: [],
				},
				{
					id: 1241,
					tag: "div",
					styles: { padding: "10px", border: "1px solid red" },
					attrs: {},
					classes: ["vertical_container"],
					children: [
						{
							id: 1233,
							tag: "p",
							text: "BBB",
							styles: { padding: "10px", border: "1px solid pink" },
							attrs: {},
							classes: [],
						},
						{
							id: 1133,
							tag: "p",
							text: "CCC",
							styles: { padding: "10px", border: "1px solid blue" },
							attrs: {},
							classes: [],
						},
					],
				},
			],
		},
		{
			id: 104,
			tag: "h1",
			text: "Dobry frejmwork aaaaaaaaaa",
			styles: { fontSize: "1.4rem", fontWeight: "var(--semi_bold)", color: "#d5d" },
			attrs: {},
			classes: [],
		},
		{
			id: 105,
			tag: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: { marginTop: "20px" },
			attrs: {},
			classes: [],
		},
		// {
		// 	id: 169,
		// 	tag: "div",
		// 	styles: { display: "flex", borderWidth: "1px", borderColor: "#00c", borderStyle: "solid", padding: "10px" },
		// 	attrs: {},
		// 	classes: [],
		// 	children: [
		// 		{
		// 			id: 170,
		// 			tag: "div",
		// 			styles: {
		// 				display: "flex",
		// 				borderWidth: "1px",
		// 				borderColor: "#00c",
		// 				borderStyle: "solid",
		// 				padding: "10px",
		// 				flexDirection: "column",
		// 			},
		// 			attrs: {},
		// 			classes: [],
		// 			children: [
		// 				{
		// 					id: 171,
		// 					tag: "p",
		// 					text: "dfgsdgs sdgf sdfgsdg fsdgfsdgfsdfgsd fgsdg f",
		// 					styles: { display: "flex", borderWidth: "1px", borderColor: "#c00", borderStyle: "solid", padding: "10px" },
		// 					attrs: {},
		// 					classes: [],
		// 				},
		// 				{
		// 					id: 172,
		// 					tag: "p",
		// 					text: "ADFG DFGSDG SDFGSDF GSDFG SDFG SDGFD FGSDGFS",
		// 					styles: { display: "flex", borderWidth: "1px", borderColor: "#0c0", borderStyle: "solid", padding: "10px" },
		// 					attrs: {},
		// 					classes: [],
		// 				},
		// 			],
		// 		},
		// 		{
		// 			id: 173,
		// 			tag: "p",
		// 			text: "dfgsdgs sdgf sdfgsdg fsdgfsdgfsdfgsd fgsdg f",
		// 			styles: { display: "flex", borderWidth: "1px", borderColor: "#c00", borderStyle: "solid", padding: "10px" },
		// 			attrs: {},
		// 			classes: [],
		// 		},
		// 		{
		// 			id: 174,
		// 			tag: "p",
		// 			text: "ADFG DFGSDG SDFGSDF GSDFG SDFG SDGFD FGSDGFS",
		// 			styles: { display: "flex", borderWidth: "1px", borderColor: "#0c0", borderStyle: "solid", padding: "10px" },
		// 			attrs: {},
		// 			classes: [],
		// 		},
		// 	],
		// },
		{
			id: 10,
			tag: "img",
			styles: { width: "50%" },
			attrs: {
				"data-src": "/uploads/-/2021-04-02-19-41-1_559x377.jpg",
			},
			classes: ["wo997_img"],
		},
		{
			id: 107,
			tag: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: { marginTop: "20px", fontSize: "30px" },
			attrs: {},
			classes: [],
		},
		{
			id: 3,
			tag: "div",

			styles: {},
			children: [
				{ id: 4, tag: "p", text: "dziecko 1", styles: {}, attrs: {}, classes: [] },
				{ id: 8, tag: "p", text: "", styles: {}, attrs: {}, classes: [] },
				{
					id: 5,
					tag: "p",
					children: [
						{ id: 6, tag: "span", text: "dziecko 2.1", styles: {}, attrs: {}, classes: [] },
						{ id: 7, tag: "span", text: "dziecko 2.2", styles: {}, attrs: {}, classes: [] },
					],
					styles: {},
					attrs: {},
					classes: [],
				},
			],
			attrs: {},
			classes: [],
		},
		{
			id: 9,
			tag: "div",
			styles: {
				backgroundColor: "red",
				padding: "20px",
			},
			children: [],
			attrs: {},
			classes: [],
		},
	]);
});
