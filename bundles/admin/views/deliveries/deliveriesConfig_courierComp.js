/* js[admin] */

/**
 * @typedef {{
 * courier_id: number
 * name: string
 * delivery_time_days: number
 * tracking_url_prefix: string
 * expanded: boolean
 * } & ListCompRowData} DeliveriesConfig_CourierCompData
 *
 * @typedef {{
 * _data: DeliveriesConfig_CourierCompData
 * _set_data(data?: DeliveriesConfig_CourierCompData, options?: SetCompDataOptions)
 * _nodes: {
 *  expand_btn: PiepNode
 *  expand: PiepNode
 * }
 * } & BaseComp} DeliveriesConfig_CourierComp
 */

/**
 * @param {DeliveriesConfig_CourierComp} comp
 * @param {*} parent
 * @param {DeliveriesConfig_CourierCompData} data
 */
function deliveriesConfig_courierComp(comp, parent, data = undefined) {
	if (data === undefined) {
		data = { courier_id: -1, name: "", tracking_url_prefix: "", delivery_time_days: 0, expanded: false };
	}

	comp._set_data = (data, options = {}) => {
		setCompData(comp, data, {
			...options,
			render: () => {
				expand(comp._nodes.expand, comp._data.expanded);
				comp._child(".fa-chevron-right").classList.toggle("open", data.expanded);
			},
		});
	};

	createComp(comp, parent, data, {
		template: html`
			<div style="display:flex;align-items:center">
				<div class="semi_bold medium clickable_label" html="{${data.row_index + 1 + ". " + data.name}}"></div>
				<div style="margin-left:auto">
					<button class="btn primary small" data-node="{${comp._nodes.expand_btn}}" data-tooltip="{${data.expanded ? "Zwiń" : "Rozwiń"}}">
						<i class="fas fa-chevron-right"></i>
					</button>
					<p-batch-trait data-trait="list_controls"></p-batch-trait>
				</div>
			</div>
			<div style="flex-grow:1">
				<div class="expand_y hidden animate_hidden" data-node="{${comp._nodes.expand}}">
					<hr style="margin:10px 0" />
					<div class="label first">Nazwa kuriera</div>
					<input class="field small" data-bind="{${data.name}}" />

					<div class="label">Czas doręczenia (dni robocze)</div>
					<input class="field small" data-bind="{${data.delivery_time_days}}" />

					<div class="label">Link do śledzenia paczki (prefix)</div>
					<input class="field small" data-bind="{${data.tracking_url_prefix}}" />
				</div>
			</div>
		`,
		initialize: () => {
			const toggle_expand = () => {
				comp._data.expanded = !comp._data.expanded;
				comp._render();
			};

			comp._child(".clickable_label").addEventListener("click", () => {
				toggle_expand();
			});

			comp._nodes.expand_btn.addEventListener("click", () => {
				toggle_expand();
			});
		},
	});
}
