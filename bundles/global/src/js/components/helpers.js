/* js[global] */

let OPTIMIZE_COMPONENTS = false;

function startComponentsOptimization() {
	OPTIMIZE_COMPONENTS = true;
}
function finishComponentsOptimization() {
	OPTIMIZE_COMPONENTS = true;
	registerForms();
	lazyLoadImages();
}

/**
 *
 * @param {PiepNode} node
 * @returns {PiepNode[]}
 */
function directCompNodes(node, query = "*") {
	return node._children(query).filter((comp) => {
		let p = comp;
		let direct = true;
		while (true) {
			p = p._parent();
			if (!p || p === node) {
				break;
			}
			const n2 = p.tagName.toLocaleLowerCase();
			if (n2.endsWith("-comp")) {
				direct = false;
				break;
			}
		}
		return direct;
	});
}

/**
 *
 * @param {PiepNode} node
 * @returns {PiepNode[]}
 */
function directComps(node) {
	return directCompNodes(node).filter((comp) => {
		let n = comp.tagName.toLocaleLowerCase();
		return n.endsWith("-comp");
	});
}

/**
 * @typedef {{
 * from: number,
 * to: number,
 * }} IndexChange
 *
 * @callback compareKeyCallback
 * @param {any} e
 * @returns {Array}
 */

/**
 *
 * @param {Array} arr_1
 * @param {Array} arr_2
 * @param {compareKeyCallback} getKey
 * @returns {IndexChange[]}
 */
function diffArrays(arr_1, arr_2, getKey) {
	if (!isArray(arr_1)) {
		arr_1 = [];
	}
	if (!isArray(arr_2)) {
		arr_2 = [];
	}

	let any_change = false;

	/** @type {IndexChange[]} */
	let diff = [];

	const keys_1 = arr_1.map(getKey);
	const keys_2 = arr_2.map(getKey);

	let index_1 = -1;
	for (const key_1 of keys_1) {
		index_1++;

		const index_2 = keys_2.indexOf(key_1);
		diff.push({ from: index_1, to: index_2 });
		if (index_1 !== index_2) {
			any_change = true;
		}
	}

	let index_2 = -1;
	for (const key_2 of keys_2) {
		index_2++;

		const index_1 = keys_1.indexOf(key_2);

		if (index_1 === -1) {
			// add
			diff.push({ from: index_1, to: index_2 });
			any_change = true;
		}
	}

	return any_change ? diff : [];
}

// not used
// /**
//  * @typedef {{
//  * added: string[],
//  * changed: string[],
//  * removed: string[],
//  * }} diffObjectResult
//  */

// /**
//  *
//  * @param {Object} obj_1
//  * @param {Object} obj_2
//  * @returns {diffObjectResult}
//  */
// function diffObjects(obj_1, obj_2) {
// 	if (!isObject(obj_1)) {
// 		obj_1 = {};
// 	}
// 	if (!isObject(obj_2)) {
// 		obj_2 = {};
// 	}

// 	/** @type {diffObjectResult} */
// 	let diff = {
// 		added: [],
// 		changed: [],
// 		removed: [],
// 	};

// 	for (const key_1 in obj_1) {
// 		const val_1 = obj_1[key_1];
// 		const val_2 = obj_2[key_1];

// 		if (val_2 === undefined) {
// 			diff.removed.push(key_1);
// 		} else if (val_1 !== val_2) {
// 			diff.changed.push(key_1);
// 		}
// 	}

// 	for (const key_2 in obj_2) {
// 		const val_1 = obj_1[key_2];

// 		if (val_1 === undefined) {
// 			diff.added.push(key_2);
// 		}
// 	}

// 	return diff;
// }
