/* js[!piep_cms_dependencies] */

class PiepCMSManager {
	constructor() {
		/** @type {cmsEditableProp[]} */
		this.blc_props = [];

		/** @type {cmsFloatingEditableProp[]} */
		this.floating_blc_props = [];

		/** @type {BlockSchema[]} */
		this.blcs_schema = [];
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
	 * @param {cmsFloatingEditableProp} floating_blc_prop
	 */
	registerFloatingProp(floating_blc_prop) {
		this.floating_blc_props.push(floating_blc_prop);
	}

	/**
	 *
	 * @param {BlockSchema} blc_schema
	 */
	registerBlcSchema(blc_schema) {
		this.blcs_schema.push(blc_schema);
	}
}

const piep_cms_manager = new PiepCMSManager();
