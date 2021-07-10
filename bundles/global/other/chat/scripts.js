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
				<div class="chat_messages flex_stretch">
					<div class="scroll_panel scroll_shadow">
						<div class="messages_wrapper"></div>
					</div>
					<div class="chatter_is_typing"></div>
					<button class="btn success small new_messages_btn">
						Nowe wiadomości (<span class="new_messages_count"></span>) <i class="fas fa-angle-double-down"></i>
					</button>
				</div>
				<div class="chat_footer">
					<textarea class="field message_input focus_inside spiky" placeholder="Napisz wiadomość..."></textarea>
					<button class="btn primary spiky send_message_btn spinner_wrapper">
						<i class="fas fa-paper-plane"></i>
						<div class="spinner overlay white"></div>
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
	const chatter_is_typing = chat_container._child(".chatter_is_typing");
	const chat_messages = chat_container._child(".chat_messages");
	const chat_messages_scroll = chat_messages._child(".scroll_panel");
	const new_messages_btn = chat_container._child(".new_messages_btn");
	const new_messages_count_node = chat_container._child(".new_messages_count");

	chatter_is_typing.classList.add("visible");

	new_messages_btn.addEventListener("click", () => {
		scrollIntoView(messages_wrapper._child(".message:last-child"));
	});

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
		chat_messages_scroll.scrollTop = chat_messages_scroll.scrollHeight;
	});

	close_btn.addEventListener("click", () => {
		chat_visible = false;
		chat_container.classList.remove("visible");
		open_chat_btn.classList.remove("opened");
	});

	const sendMessage = () => {
		const message = message_input._get_value();
		if (message.trim() === "") {
			return showNotification("Pusta wiadomość", { type: "error", one_line: true });
		}
		message_input._set_value("", { quiet: true });
		send_message_btn.classList.add("spinning");
		chat_messages_scroll.scrollTop = chat_messages_scroll.scrollHeight;
		xhr({
			url: "/chat/message/send",
			params: {
				message,
			},
			success: (res) => {
				// console.log(res);
				// do nothing ;) long polling is here to save you buddy
			},
		});
		set_h();
	};

	let last_typing = null;
	let typing_interval;
	const sendTyping = () => {
		const message = message_input._get_value();
		xhr({
			url: "/chat/message/typing",
			params: {
				message,
			},
			success: (res) => {},
		});
	};

	const sendTypingLoop = () => {
		if (typing_interval) {
			return;
		}
		sendTyping();
		typing_interval = setInterval(() => {
			const message = message_input._get_value();
			if (message === last_typing) {
				clearInterval(typing_interval);
				typing_interval = undefined;
				return;
			}
			last_typing = message;
			sendTyping();
		}, 1500);
	};

	message_input.addEventListener("input", sendTypingLoop);
	message_input.addEventListener("change", sendTypingLoop);

	message_input.addEventListener("keydown", (ev) => {
		if (ev.key == "Enter" && !ev.shiftKey) {
			sendMessage();
			ev.preventDefault();
		}
	});
	send_message_btn.addEventListener("click", sendMessage);

	const getOursMessageHTML = (message) => {
		return html`<div class="message ours new">
			<div class="message_content">${message.message}</div>
			<img src="/src/img/core/chat/user.svg" class="chatter_img" data-tooltip="Wysłano ${message.sent_at}" />
		</div>`;
	};

	const getOthersMessageHTML = (message) => {
		return html`<div class="message others new">
			<img data-src="${admin_img}" class="wo997_img chatter_img" data-tooltip="Wysłano ${message.sent_at}" />
			<div class="message_content">${message.message}</div>
		</div>`;
	};

	const appendMessages = (messages) => {
		let add_html = "";
		messages.forEach((message) => {
			if (!message.receiver_id) {
				add_html += getOursMessageHTML(message);
			} else {
				add_html += getOthersMessageHTML(message);
			}
		});
		all_messages.push(...messages);
		messages_wrapper.insertAdjacentHTML("beforeend", add_html);
		onMessagesRendered();
	};

	const onMessagesRendered = () => {
		lazyLoadImages();
	};

	let scrolled_to_bottom = false;
	let sees_bottom = false;
	const checkScroll = () => {
		const bottom = chat_messages_scroll.scrollHeight - chat_messages_scroll.clientHeight;
		scrolled_to_bottom = chat_messages_scroll.scrollTop >= bottom - 1;
		sees_bottom = chat_messages_scroll.scrollTop >= bottom - 20;

		if (sees_bottom) {
			setNewMessagesCount(0);
		}
	};
	chat_messages_scroll.addEventListener("scroll", checkScroll, { passive: true });

	let admin_img = "";
	xhr({
		url: "/chat/init",
		success: (res) => {
			admin_img = res.admin_img;
			chatter_label._set_content(res.chatter_label);
			chatter_is_typing._set_content(html`${res.chatter_label} pisze <span class="dot-flashing"></span>`);
			initialFetch();
		},
	});

	const all_messages = [];
	let new_messages_count;
	const setNewMessagesCount = (cnt) => {
		if (new_messages_count === cnt) {
			return;
		}
		new_messages_count = cnt;
		new_messages_btn.classList.toggle("visible", !!cnt);
		if (new_messages_count) {
			new_messages_count_node._set_content(new_messages_count);
		}
	};
	setNewMessagesCount(0);

	const getNewMessageNodes = () => {
		const message_nodes = messages_wrapper._children(".message.new");
		message_nodes.forEach((e) => e.classList.remove("new"));
		return message_nodes;
	};

	const initialFetch = () => {
		xhr({
			url: "/chat/message/fetch",
			success: (res) => {
				appendMessages(res.messages);
				getNewMessageNodes(); // keep it!
				longPolling();
			},
		});
	};

	const longPolling = () => {
		const last_message = getLast(all_messages);
		const params = {
			long_polling: true,
			from_chat_message_id: last_message ? last_message.chat_message_id : null,
		};

		xhr({
			url: "/chat/message/fetch",
			params,
			success: (res) => {
				const messages = res.messages;
				appendMessages(messages);

				const anything = messages.length > 0;
				if (anything) {
					removeClasses(".spinning", ["spinning"], chat_container);

					getNewMessageNodes().forEach((e) => {
						e.style.animation = "show 0.35s";
					});
				}

				if (scrolled_to_bottom) {
					const bottom = chat_messages_scroll.scrollHeight - chat_messages_scroll.clientHeight;
					const diff = bottom - chat_messages_scroll.scrollTop;
					chat_messages_scroll.scrollTop = bottom;

					if (anything) {
						messages_wrapper._animate(`0% { transform: translateY(${diff}px) } 100% { transform: translateY(0px) }`, 200, {
							callback: checkScroll,
						});
					}
				}
				if (!sees_bottom && anything) {
					// say that new messages are on the bottom? lol
					setNewMessagesCount(new_messages_count + messages.length);
				}

				longPolling();
			},
		});
	};
});
