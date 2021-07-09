/* js[view] */

domload(() => {
	const choose_period = $(".choose_period");
	const case_any_period = $(".case_any_period");
	const daterangepicker = case_any_period._child(".default_daterangepicker");
	const from_datepicker = daterangepicker._child(".from");
	const to_datepicker = daterangepicker._child(".to");

	let searching_stats = false;
	const search_stats = () => {
		if (searching_stats) {
			return;
		}
		searching_stats = true;
		const period = choose_period._get_value();

		const today = new Date();
		const today_day = today.getDay();
		// today case
		let from_date = new Date();
		let to_date = new Date();
		if (period === "this_week") {
			const diff = today.getDate() - today_day + (today_day == 0 ? -6 : 1);
			const monday = new Date();
			monday.setDate(diff);
			monday.setHours(0, 0, 0, 0);
			from_date = monday;
		} else if (period === "yesterday") {
			from_date.setDate(from_date.getDate() - 1);
			to_date.setDate(to_date.getDate() - 1);
		} else if (period === "last_7_days") {
			from_date.setDate(from_date.getDate() - 6);
		} else if (period === "last_30_days") {
			from_date.setDate(from_date.getDate() - 29);
		} else if (period === "any_period") {
			from_date = new Date(from_datepicker._get_value() + "T00:00:00");
			to_date = new Date(to_datepicker._get_value() + "T00:00:00");
		}

		from_date.setHours(0, 0, 0, 0);
		to_date.setHours(0, 0, 0, 0);
		to_date.setDate(to_date.getDate() + 1);

		xhr({
			url: STATIC_URLS["ADMIN"] + "/stats/search",
			params: {
				from_date: dateToString(from_date),
				to_date: dateToString(to_date),
			},
			success: (res) => {
				searching_stats = false;
				setChartData({
					labels: res.labels,
					datasets: [
						{
							data: res.count,
							label: "Ilość zamówień",
							backgroundColor: "#07e1",
							borderColor: "#47d",
							yAxisID: "count",
						},
						{
							data: res.total_price,
							label: "Łączna kwota",
							backgroundColor: "#0e41",
							borderColor: "#3d4",
							yAxisID: "total_price",
						},
					],
				});
			},
		});
	};
	choose_period.addEventListener("change", () => {
		const period = choose_period._get_value();
		expand(case_any_period, period === "any_period");

		search_stats();
	});

	const today_str = dateToString(new Date());
	from_datepicker._set_value(today_str);
	from_datepicker._set_value(today_str);

	from_datepicker.addEventListener("change", () => {
		search_stats();
	});
	to_datepicker.addEventListener("change", () => {
		search_stats();
	});

	// @ts-ignore
	const ctx = $("#myChart").getContext("2d");
	let chart;
	const setChartData = (data) => {
		if (!chart) {
			// @ts-ignore
			chart = new Chart(ctx, {
				type: "line",
				data,
				options: {
					scales: {
						yAxes: [
							{
								id: "count",
								type: "linear",
								position: "right",
							},
							{
								id: "total_price",
								type: "linear",
								position: "left",
							},
						],
					},
					tooltips: {
						mode: "index",
						intersect: false,
						callbacks: {
							label: (item) => {
								if (item.datasetIndex === 0) {
									return `${item.yLabel} zamówień`;
								}
								if (item.datasetIndex === 1) {
									return `${item.yLabel} zł`;
								}
								return `${item.yLabel}`;
							},
						},
					},
					hover: {
						mode: "nearest",
						intersect: true,
					},
					aspectRatio: 2.5,
					legend: {
						labels: {
							boxWidth: 7,
							usePointStyle: true,
						},
					},
				},
			});
		} else {
			// that's actually dumb but ok
			// chart.data.datasets[0].data = data.datasets[0].data;
			// chart.data.datasets[1].data = data.datasets[1].data;
			// chart.data.labels = data.labels;

			chart.data = data;
			chart.update();
		}
	};

	choose_period._set_value("this_week");
});
