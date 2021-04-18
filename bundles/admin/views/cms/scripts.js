/* js[view] */

/** @type {PiepCMS} */
let piep_cms;

domload(() => {
	piep_cms = new PiepCMS($(".piep_editor"));

	piep_cms.import([
		{
			id: 100,
			tag: "h1",
			text: "Dobry frejmwork",
			styles: { fontSize: "1.4rem", fontWeight: "700", marginTop: "50px" },
			attrs: {},
			classes: [],
		},
		{
			id: 101,
			tag: "p",
			text:
				"Wirtualny DOM krul. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			styles: { marginTop: "20px", backgroundColor: "var(--clr_primary)" },
			attrs: {},
			classes: [],
		},
		{
			id: 102,
			tag: "h1",
			text: "123234234563456",
			styles: { fontSize: "1.4rem", fontWeight: "400", color: "#d5d" },
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
			id: 104,
			tag: "h1",
			text: "Dobry frejmwork aaaaaaaaaa",
			styles: { fontSize: "1.4rem", fontWeight: "600", color: "#d5d" },
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
		{
			id: 169,
			tag: "div",
			styles: { display: "flex", borderWidth: "1px", borderColor: "#00c", borderStyle: "solid", padding: "10px" },
			attrs: {},
			classes: [],
			children: [
				{
					id: 170,
					tag: "div",
					styles: {
						display: "flex",
						borderWidth: "1px",
						borderColor: "#00c",
						borderStyle: "solid",
						padding: "10px",
						flexDirection: "column",
					},
					attrs: {},
					classes: [],
					children: [
						{
							id: 171,
							tag: "p",
							text: "dfgsdgs sdgf sdfgsdg fsdgfsdgfsdfgsd fgsdg f",
							styles: { display: "flex", borderWidth: "1px", borderColor: "#c00", borderStyle: "solid", padding: "10px" },
							attrs: {},
							classes: [],
						},
						{
							id: 172,
							tag: "p",
							text: "ADFG DFGSDG SDFGSDF GSDFG SDFG SDGFD FGSDGFS",
							styles: { display: "flex", borderWidth: "1px", borderColor: "#0c0", borderStyle: "solid", padding: "10px" },
							attrs: {},
							classes: [],
						},
					],
				},
				{
					id: 173,
					tag: "p",
					text: "dfgsdgs sdgf sdfgsdg fsdgfsdgfsdfgsd fgsdg f",
					styles: { display: "flex", borderWidth: "1px", borderColor: "#c00", borderStyle: "solid", padding: "10px" },
					attrs: {},
					classes: [],
				},
				{
					id: 174,
					tag: "p",
					text: "ADFG DFGSDG SDFGSDF GSDFG SDFG SDGFD FGSDGFS",
					styles: { display: "flex", borderWidth: "1px", borderColor: "#0c0", borderStyle: "solid", padding: "10px" },
					attrs: {},
					classes: [],
				},
			],
		},
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
