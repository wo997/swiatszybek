/**
 * @typedef {{
 * 	name: string,
 * _data: any,
 * _prev_data?: any,
 * _subscribe_to_arr: SubscribeTo[],
 * }} ObjWithData
 */

/**
 * @type {ObjWithData}
 */
let obj_1 = {
	name: "1",
	_data: undefined,
	_subscribe_to_arr: [],
};

setData(obj_1, {
	a: {
		b: {
			c: 12,
		},
	},
});

/**
 * @type {ObjWithData}
 */
let obj_2 = {
	name: "2",
	_data: undefined,
	_subscribe_to_arr: [],
};

addSubscriber(obj_1, {
	what: obj_2,
	how: (what, _data) => {
		what._data = _data.a;
	},
});

addSubscriber(obj_2, {
	what: obj_1,
	how: (what, _data) => {
		what._data.a = _data;
	},
});

/**
 *
 * @param {ObjWithData} to
 * @param {SubscribeTo} subscribe_to
 */
function addSubscriber(to, subscribe_to) {
	to._subscribe_to_arr.push(subscribe_to);
	setData(to, undefined, { force_propagate: true });
}

/**
 * @type {ObjWithData}
 */
let obj_3 = {
	name: "3",
	_data: undefined,
	_subscribe_to_arr: [],
};

addSubscriber(obj_2, {
	what: obj_3,
	how: (what, _data) => {
		what._data = _data.b;
	},
});

addSubscriber(obj_3, {
	what: obj_2,
	how: (what, _data) => {
		what._data.b = _data;
	},
});

/**
 * @typedef {{
 * how(what: ObjWithData, _data: any)
 * what: ObjWithData
 * }} SubscribeTo
 */

// /**
//  * @typedef {{
//  * force_propagate?: boolean
//  * }} SetDataOptions
//  */

/**
 *
 * @param {ObjWithData} obj
 * @param {*} _data
 * @param {SetDataOptions} options
 */
function setData(obj, _data = undefined, options = {}) {
	if (_data !== undefined) {
		obj._data = _data;
	}

	const equal = isEquivalent(obj._prev_data, obj._data);

	if (!equal) {
		obj._prev_data = cloneObject(obj._data);
	} else {
		if (nonull(options.force_propagate, false) === false) {
			return;
		}
	}

	obj._subscribe_to_arr.forEach((subscribe) => {
		subscribe.how(subscribe.what, cloneObject(obj._data));
		setData(subscribe.what, undefined);
	});
}

//data.a;

//console.log(JSON.stringify(obj_1, null, 3));
//console.log(JSON.stringify(obj_2, null, 3));
console.log(obj_1);
console.log(obj_2);
console.log(obj_3);

console.log("");
console.log("");
console.log("");
