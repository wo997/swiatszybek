/* js[!piep_cms_dependencies] */

class PiepCMSPropsHandler {
	constructor() {
		/** @type {cmsEditableProp[]} */
		this.blc_props = [];

		/** @type {cmsFloatingEditableProp[]} */
		this.blc_floating_props = [];
	}

	/**
	 *
	 * @param {cmsEditableProp} blc_prop
	 */
	registerProp(blc_prop) {
		this.blc_props.push(blc_prop);
	}

	/**
	 *
	 * @param {cmsFloatingEditableProp} blc_prop
	 */
	registerFloatingProp(blc_prop) {
		this.blc_floating_props.push(blc_prop);
	}
}

const piep_cms_props_handler = new PiepCMSPropsHandler();
