/* js[view] */

domload(() => {
	const admin_chat_container = $(".admin_chat_container");
	const clients_wrapper = admin_chat_container._child(".clients_wrapper");
	xhr({
		url: `${STATIC_URLS["ADMIN"]}/chat/get_clients`,
		success: (res) => {
			let clients_html = "";

			res.clients.forEach((client) => {
				clients_html += html`<div class="chat_client" data-client_id="${client.client_id}">
					<div class="flex">
						<div class="sent_at mr1">${client.sent_at.substring(0, 16)}</div>
						<div class="mra semi_bold">(${client.count})</div>
						${client.receiver_id === null
							? html`<i class="fas fa-envelope text_important"></i>`
							: html`<i class="fas fa-check-circle"></i>`}
					</div>
					<div class="message">${client.message}</div>
				</div>`;

				// client_id: 499
				// count: 7
				// //message: "dzień dobry"
				// //receiver_id: null
				// sender_id: 499
				// //sent_at: "2021-07-09 15:44:52"
			});

			clients_wrapper._set_content(clients_html);

			if (!client_id) {
				const first_client = clients_wrapper._direct_children()[0];
				if (first_client) {
					first_client.click();
				}
			}
		},
	});

	/** @type {number} */
	let client_id;

	admin_chat_container.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const chat_client = target._parent(".chat_client");
		if (chat_client) {
			removeClasses(".active", ["active"], clients_wrapper);
			chat_client.classList.add("active");
			let client_id = +chat_client.dataset.client_id;
		}
	});
});
