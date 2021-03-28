/* js[view] */

domload(() => {
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
								id: "total_price",
								type: "linear",
								position: "left",
							},
							{
								id: "count",
								type: "linear",
								position: "right",
							},
						],
					},
					tooltips: {
						mode: "index",
						intersect: false,
					},
					hover: {
						mode: "nearest",
						intersect: true,
					},
				},
			});
		} else {
			chart.data = data;
			chart.update();
		}
	};

	xhr({
		url: STATIC_URLS["ADMIN"] + "/stats/search",
		params: {
			from_date: "2021-03-01",
			to_date: "2021-04-01",
		},
		success: (res) => {
			setChartData({
				labels: res.labels,
				datasets: [
					{
						data: res.count,
						label: "Ilość zamówień",
						backgroundColor: "rgb(0, 255, 132, 0.1)",
						borderColor: "rgb(0, 255, 132)",
						yAxisID: "count",
					},
					{
						data: res.total_price,
						label: "Kwota łączna",
						backgroundColor: "rgba(255, 99, 132, 0.1)",
						borderColor: "rgb(255, 99, 132)",
						yAxisID: "total_price",
					},
				],
			});
		},
	});
});
