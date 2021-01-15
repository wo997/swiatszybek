/* js[global] */

function kodPocztowyChange(src) {
	xhr({
		url: `/kod_pocztowy_api`,
		params: {
			kod: src.value,
		},
		success: (res) => {
			var list = "";
			try {
				var items = [];
				for (i = 0; i < res.length; i++) {
					items.push(res[i].miejscowosc);
				}

				var dups = {};
				items = items.filter(function (el) {
					var hash = el.valueOf();
					var isDup = dups[hash];
					dups[hash] = true;
					return !isDup;
				});

				for (i = 0; i < items.length; i++) {
					var miejscowosc = items[i];
					list += `<div onclick='chooseMiejscowosc(this)'>${miejscowosc}</div>`;
				}
			} catch (e) {}

			var targetList = getMiejscowoscPickerList(src);
			if (!targetList) return;
			targetList.innerHTML = list;
		},
	});
}

function getMiejscowoscPickerTarget(obj) {
	if (!obj) return;
	obj = $(obj);
	var wrapper = obj._parent(".miejscowosc-picker-wrapper");
	if (!wrapper) {
		console.warn("miejscowosc picker wrapper missing");
		return;
	}
	var target = wrapper.find(".miejscowosc-picker-target");
	if (!target) {
		console.warn("miejscowosc picker target missing");
		return;
	}
	return target;
}

function getMiejscowoscPickerList(obj) {
	if (!obj) return;
	obj = $(obj);
	var wrapper = obj._parent(".miejscowosc-picker-wrapper");
	if (!wrapper) {
		console.warn("miejscowosc picker wrapper missing");
		return;
	}
	var list = wrapper.find(".miejscowosc-picker-list");
	if (!list) {
		console.warn("miejscowosc picker list missing");
		return;
	}
	return list;
}

function chooseMiejscowosc(obj) {
	var target = getMiejscowoscPickerTarget(obj);
	if (!target) return;
	target.value = obj.textContent;
}
