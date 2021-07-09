/* js[wo997_chat] */

domload(() => {
	document.body.insertAdjacentHTML(
		"beforeend",
		html`
			<div class="chat_container separate_scroll">
				<div class="chat_header">
					<div class="chatter_label"></div>
					<button class="btn transparent close_btn">
						<i class="fas fa-times"></i>
					</button>
				</div>
				<div class="scroll_panel scroll_shadow chat_messages">
					<div class="messages_wrapper"></div>
				</div>
				<div class="chat_footer">
					<textarea class="field message_input focus_inside spiky" placeholder="Napisz wiadomość..."></textarea>
					<button class="btn primary spiky send_message_btn">
						<i class="fas fa-paper-plane"></i>
					</button>
				</div>
			</div>

			<div class="open_chat_btn" data-tooltip="Otwórz czat" data-tooltip_position="left">
				<i class="fas fa-envelope"></i>
			</div>
		`
	);

	let chat_visible = false;

	const chat_container = $(".chat_container");
	const open_chat_btn = $(".open_chat_btn");
	const message_input = chat_container._child(".message_input");
	const close_btn = chat_container._child(".close_btn");
	const send_message_btn = chat_container._child(".send_message_btn");
	const messages_wrapper = chat_container._child(".messages_wrapper");
	const chatter_label = chat_container._child(".chatter_label");

	const set_h = () => {
		autoHeight(message_input);
	};
	message_input.addEventListener("input", set_h);
	message_input.addEventListener("change", set_h);
	set_h();

	open_chat_btn.addEventListener("click", () => {
		chat_visible = true;
		chat_container.classList.add("visible");
		open_chat_btn.classList.add("opened");
		message_input.click();
		message_input.focus();
	});

	close_btn.addEventListener("click", () => {
		chat_visible = false;
		chat_container.classList.remove("visible");
		open_chat_btn.classList.remove("opened");
	});

	const sendMessage = () => {
		const message = message_input._get_value();
		message_input._set_value("", { quiet: true });
		xhr({
			url: "/chat/message/send",
			params: {
				message,
			},
			success: (res) => {
				console.log(res);
			},
		});
		set_h();
	};

	message_input.addEventListener("keydown", (ev) => {
		if (ev.key == "Enter" && !ev.shiftKey) {
			sendMessage();
			ev.preventDefault();
		}
	});
	send_message_btn.addEventListener("click", sendMessage);

	const getOursMessageHTML = (message) => {
		return html`<div class="message ours">
			<div class="message_content">${message.message}</div>
			<img data-src="/uploads/-/2021-06-23-21-45_860x900.png" class="wo997_img chatter_img" data-tooltip="Wysłano ${message.sent_at}" />
		</div>`;
	};

	const getOthersMessageHTML = (message) => {
		return html`<div class="message others">
			<img data-src="${admin_img}" class="wo997_img chatter_img" data-tooltip="Wysłano ${message.sent_at}" />
			<div class="message_content">${message.message}</div>
		</div>`;
	};

	let admin_img = "";
	xhr({
		url: "/chat/init",
		success: (res) => {
			admin_img = res.admin_img;
			chatter_label._set_content(res.chatter_label);
			xhr({
				url: "/chat/message/fetch",
				success: (res) => {
					let add_html = "";
					res.forEach((message) => {
						if (!message.receiver_id) {
							add_html = getOursMessageHTML(message) + add_html;
						} else {
							add_html = getOthersMessageHTML(message) + add_html;
						}
					});
					messages_wrapper.insertAdjacentHTML("beforeend", add_html);
				},
			});
		},
	});
});
