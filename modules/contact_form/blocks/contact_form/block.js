/* module_block[contact_form] */
MODULE_BLOCK = {
	title: "Formularz kontaktowy",
	icon: '<i class="far fa-address-card"></i>',
	formOpen: (params, form) => {},
	formClose: (form_data) => {
		return form_data;
	},
	render: (params) => {
		return `Formularz kontaktowy`;
	},
};
