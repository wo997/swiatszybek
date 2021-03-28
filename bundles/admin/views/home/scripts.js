/* js[view] */

domload(() => {
	// @ts-ignore
	const ctx = $("#myChart").getContext("2d");
	// @ts-ignore
	const chart = new Chart(ctx, {
		type: "line",
		data: {
			labels: ["January", "February", "March", "April", "May", "June", "July"],
			datasets: [
				{
					data: [20, 50, 100, 75, 25, 0],
					label: "Kwota łączna",
					backgroundColor: "rgba(255, 99, 132, 0.1)",
					borderColor: "rgb(255, 99, 132)",
					yAxisID: "total_price",
				},
				{
					data: [0.1, 0.5, 1.0, 2.0, 1.5, 0],
					label: "Ilość",
					backgroundColor: "rgb(0, 255, 132, 0.1)",
					borderColor: "rgb(0, 255, 132)",
					yAxisID: "count",
				},
			],
		},

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

	xhr({
		url: STATIC_URLS["ADMIN"] + "/stats/search",
		params: {
			from_date: "2021-03-01",
			to_date: "2021-04-01",
		},
		success: (res) => {
			console.log(res);
		},
	});
});
