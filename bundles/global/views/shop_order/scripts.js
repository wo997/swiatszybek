/* js[view] */

domload(() => {
	const payment_method = $(".payment_method");
	if (payment_method) {
		payment_method._set_value("przelewy24");
	}
});
