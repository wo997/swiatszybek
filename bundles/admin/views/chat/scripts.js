/* js[view] */

domload(() => {
	const chat_container = $(".admin_chat_container");
	const clients_wrapper = chat_container._child(".clients_wrapper");
	const message_input = chat_container._child(".message_input");
	const close_btn = chat_container._child(".close_btn");
	const send_message_btn = chat_container._child(".send_message_btn");
	const messages_wrapper = chat_container._child(".messages_wrapper");

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

	chat_container.addEventListener("click", (ev) => {
		const target = $(ev.target);
		const chat_client = target._parent(".chat_client");
		if (chat_client) {
			removeClasses(".active", ["active"], clients_wrapper);
			chat_client.classList.add("active");
			client_id = +chat_client.dataset.client_id;
			clientSet();
		}
	});

	const getOursMessageHTML = (message) => {
		return html`<div class="message ours new">
			<div class="message_content">${message.message}</div>
			<img data-src="${admin_img}" class="wo997_img chatter_img" data-tooltip="Wysłano ${message.sent_at}" />
		</div>`;
	};

	const getOthersMessageHTML = (message) => {
		return html`<div class="message others new">
			<img src="/src/img/core/chat/user.svg" class="chatter_img" data-tooltip="Wysłano ${message.sent_at}" />
			<div class="message_content">${message.message}</div>
		</div>`;
	};

	const appendMessages = (messages) => {
		let add_html = "";
		messages.forEach((message) => {
			if (!message.receiver_id) {
				add_html += getOthersMessageHTML(message);
			} else {
				add_html += getOursMessageHTML(message);
			}
		});
		all_messages.push(...messages);
		messages_wrapper.insertAdjacentHTML("beforeend", add_html);
		onMessagesRendered();
	};

	const onMessagesRendered = () => {
		lazyLoadImages();
	};

	let all_messages = [];

	const clientSet = () => {
		xhr({
			url: STATIC_URLS["ADMIN"] + "/chat/message/fetch",
			params: {
				client_id,
			},
			success: (res) => {
				all_messages = [];
				appendMessages(res.messages);
				// getNewMessageNodes(); // keep it!
				// chat_messages_scroll.scrollTop = chat_messages_scroll.scrollHeight;
			},
		});
	};
});
