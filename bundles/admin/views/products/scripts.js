/* js[view] */

domload(() => {
	/** @type {DatatableComp} */
	// @ts-ignore
	const datatable_comp = $("datatable-comp");

	datatableComp(datatable_comp, undefined, {
		search_url: STATIC_URLS["ADMIN"] + "search_products",
		columns: [
			{ label: "Produkt", key: "title", width: "20%", sortable: true, searchable: "string" },
			{ label: "Publiczny", key: "published", width: "20%", sortable: true, searchable: "string" },
			{ label: "W magazynie", key: "stock", width: "20%", sortable: true, searchable: "number" },
			{
				label: "Akcja",
				key: "stock",
				width: "100px",
				render: (data) => {
					return html`<a class="btn subtle small" href="${STATIC_URLS["ADMIN"] + "produkt/" + data.product_id}">
						Edytuj <i class="fas fa-cog"></i>
					</a>`;
				},
			},
		],
		primary_key: "product_id",
		empty_html: html`Brak produktów`,
		label: "<div class='medium'>Produkty</div>",
		after_label: html`<a href="${STATIC_URLS["ADMIN"]}produkt" class="btn important"> Dodaj <i class="fas fa-plus"></i> </a> `,
		selectable: true,
		save_state_name: "products",
	});

	// var tableName = "mytable";
	// createDatatable({
	// 	name: tableName,
	// 	url: STATIC_URLS["ADMIN"] + "search_products",
	// 	db_table: "products",
	// 	primary: "product_id",
	// 	lang: {
	// 		subject: "produktów",
	// 	},
	// 	width: 1100,
	// 	params: () => {},
	// 	definition: [
	// 		{
	// 			title: "Nazwa produktu",
	// 			width: "50%",
	// 			render: (r) => {
	// 				return `
	//           <a class="link text-plus-icon" href="${STATIC_URLS["ADMIN"]}produkt/${r.product_id}">
	//             <span>${escapeHTML(r.title)}</span>
	//             <i class="fas fa-chevron-circle-right"></i>
	//           </a>
	//         `;
	// 			},
	// 			escape: false,
	// 			field: "title",
	// 			searchable: "text",
	// 			sortable: true,
	// 		},
	// 		getPublishedDefinition({
	// 			field: "p.published",
	// 		}),
	// 		{
	// 			title: "W magazynie",
	// 			width: "145px",
	// 			render: (r) => {
	// 				return `${def(r.stock, 0)} szt.`;
	// 			},
	// 			field: "stock",
	// 			sortable: true,
	// 		},
	// 	],
	// 	controlsRight: `
	//     <div class='float-icon space-right'>
	//       <input type="text" placeholder="Szukaj..." data-param="search" class="field inline">
	//       <i class="fas fa-search"></i>
	//     </div>
	//     <button class="btn important" onclick="window.location='${STATIC_URLS["ADMIN"]}produkt'">
	//       Produkt <i class="fas fa-plus-circle"></i>
	//     </button>
	//   `,
	// });
});
