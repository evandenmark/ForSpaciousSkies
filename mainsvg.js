// DEFINE THE MAP
var screenWidth =  screen.width,
	screenHeight = screen.height;


function initialLoad(){
	//loads the initial files and draws the map

	USA_SCALE = 2000;
	USA_TRANSLATE = [screenWidth*0.45,screenHeight*0.5];


	projection = d3.geoAlbersUsa().scale(USA_SCALE).translate(USA_TRANSLATE);

	path = d3.geoPath().projection(projection);

	mapSvg = d3.select("#main-svg").append("svg")
					    .attr("width", screenWidth)
					    .attr("height", screenHeight)

	d3.json("./countryShapeData/us.json").then(function(topology){

		var states = topojson.feature(topology, topology.objects.states);
		mapSvg.selectAll("path")
		      .data(states.features)
		      .enter().append("path")
			      .attr("d", path)
			      .attr("fill", "#efefef")
			      .attr("stroke", "#fff");

		d3.csv("./data/airports.csv").then(function(data){
			airportData = data;
			airportLocationMap = new Map(data.map(d => [d.icao, [d.long, d.lat]]));
			airportStateMap = new Map(data.map(d => [d.icao, d.state]));
			airportCityMap = new Map(data.map(d => [d.icao, d.city]));

			d3.csv("./data/AirportFlightsPerWeek.csv").then(function(data){
				airportFlightsPerWeek = data;
			});
		});

		d3.csv("./data/processed_USflights.csv").then(function(data){
			flightData = data;
			drawRoutes();
		});

		d3.csv("./data/AirlineFlightsPerWeek.csv").then(function(data){
			airlineFlightPerWeek = data;
			setMaxes()
		});

		d3.csv("./data/AirlineFlightsPerWeek2.csv").then(function(data){
			airlineFlightPercentPerWeek = data;
		});

	});
}

function drawScrolly(){
	//draws the scrollytelling blocks

	//main columns
	var scrollySVG = d3.select("#scrolly-column").append("svg")
					    .attr("width", screenWidth)
					    .attr("height", screenHeight*5);


	//main title
	var titleRect = scrollySVG.append('rect')
						.attr("width", "100%")
						.attr("height", screenHeight/5)
					    .attr("transform", 'translate('+0+','+screenHeight/3+')')
					    .attr("fill", "#F0F2FF")
					    .attr("opacity", 0.99);

	var titleBack = scrollySVG.append('rect')
						.attr("width", "100%")
						.attr("height", "100%")
						.attr("fill", "white")
						.attr("opacity", 0.3)

	var title = scrollySVG.append('text')
							.attr("id", 'title')
							.attr("transform", 'translate('+screenWidth*0.5+','+screenHeight*0.42+')')
							.text("For Spacious Skies")

	var subtitle = scrollySVG.append('text')
							.attr("id", 'subtitle')
							.attr("transform", 'translate('+screenWidth*0.5+','+screenHeight*0.46+')')
							.text("How COVID-19 has rocked US domestic flights")

	var name = scrollySVG.append('text')
							.attr("id", 'name')
							.attr("transform", 'translate('+screenWidth*0.5+','+screenHeight*0.5+')')
							.text("By EVAN DENMARK")

	var normalAirport = scrollySVG.append('rect')
						.attr("width", "33%")
						.attr("height", screenHeight/4)
					    .attr("transform", 'translate('+screenWidth*0.15+','+screenHeight*1.2+')')
					    .attr("fill", "#F0F2FF");

	//most popular airports
	var popularRoutes = scrollySVG.append('rect')
						.attr("width", "33%")
						.attr("height", screenHeight)
					    .attr("transform", 'translate('+screenWidth*0.67+','+2*screenHeight+')')
					    .attr("fill", "#F0F2FF");

	// //total flight decline
	var totalFlightsDecline = mapSvg.append("g");
	totalFlightsDecline.append('rect')
						.attr("width", "33%")
						.attr("height", "100%")
						.attr("id", "flightDeclineChart")
					    .attr("transform", 'translate(0,'+0+')')
					    .attr("fill", "#F0F2FF")
					    .attr("opacity", 0);
}



function drawRoutes(){
	//draw flight routes
	console.log(currentWeek);
	routePaths = createRoutePaths(getFlightsInContinentalUS(temporalFilter(flightData, currentWeek)));
	routes = mapSvg.selectAll(".routes")
					.data(routePaths)
					.join(
				    	enter => enter.append("path"),
				    	update => update,
				    	exit => exit.remove()
			    	)
	                .attr("d", path)
	                .attr("class", "routes")
	                .attr("id", function(d){
	                	return d.start+'-'+d.end;
	                })
	                .attr("fill", "none")
	                .attr("stroke", 'blue')
	                .attr("stroke-linecap", 'round')
	                .transition().duration(750)
	                .attr("stroke-width", function(d){return d.weight*0.03})
	                .attr("stroke-opacity", function(d){return d.weight*0.001})
	                .attr("transform", "translate("+currentTranslate+")scale("+currentScale+")")
	                // .on('mouseover', mouseoverPath);

}

function mouseoverPath(d){
	console.log(d =>  d.start + "-" +d.end +' : '+ d.weight + ' flights')
}

function removeRoutes(){
	var routesToRemove = mapSvg.selectAll(".routes")
								.transition()
								.duration(750)
								.attr("stroke-opacity", 0)

}

function drawAirports(){

	filteredAirports = largeAirportsOnly(airportData);

	mapSvg.selectAll(".airportbaseline")
				.data(filteredAirports)
				.join(
			    	enter => enter.append("rect"),
			    	update => update,
			    	exit => exit.remove()
		    	)
		    	.attr("width", 30)
		    	.attr('class', 'airportbaseline')
		    	.attr('id', d=> d.icao)
				.attr('fill', 'black')
				.attr('stroke', "#000000")
				.attr("height", 1.5)
				.attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] ;
					var r = p[0] - 15 ;
					return "translate(" + r +','+q + ")";
				})
				
				.transition().duration(750)
				.attr('opacity', 1);

	mapSvg.selectAll(".airport")
				.data(filteredAirports)
				.join(
			    	enter => enter.append("rect"),
			    	update => update,
			    	exit => exit.remove()
		    	)
		    	.attr("width", 15)
		    	.attr('class', 'airport')
		    	.attr('id', d=> d.icao)
				.attr('fill', 'red')
				.attr('stroke', "#000000")
				.attr("height", function(d){
		    		return getAirportTraffic(d.icao, currentWeek)/75
		    	})
				.attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - this.height.baseVal.value ;
					var r = p[0] - 7 ;
					return "translate(" + r +','+q + ")";
				})
				
				.transition().duration(750)
				.attr('opacity', 0.7);

	mapSvg.selectAll(".airporttext")
				.data(filteredAirports)
				.enter().append('text')
		    	.attr('class', 'airporttext')
		    	.attr('id', d=> d.icao)
				.attr('stroke', "#efefef")
				.attr("stroke-width", 0.1)
				.attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - getAirportTraffic(d.icao, currentWeek)/75 - 10;
					var r = p[0] - 55 ;
					return "translate(" + r +','+q + ")";
				})
				.text(function(d){
					if (majorAirports.indexOf(d.icao) >=0){
						return d.icao.slice(1, d.icao.length)
					}
					return " ";
				});

	mapSvg.selectAll(".airporttextnum")
				.data(filteredAirports)
				.enter().append('text')
		    	.attr('class', 'airporttextnum')
		    	.attr('id', d=> d.icao)
				.attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - getAirportTraffic(d.icao, currentWeek)/75 - 10;
					var r = p[0] -15;
					return "translate(" + r +','+q + ")";
				})
				.text(function(d){
					if (majorAirports.indexOf(d.icao) >=0){
						return getAirportTraffic(d.icao, currentWeek)
					}
					return " ";
				});



}

function removeAirports(){
	// mapSvg.selectAll(".airport").remove();

	var airportsToRemove = mapSvg.selectAll(".airport, .airportbaseline, .airporttext, .airporttextnum")
								.transition()
								.duration(750)
								.attr("opacity", 0)
								.attr("stroke-opacity", 0);
}


function createRoutePaths(data){
	links = Array();
	for(var i=0, len=data.length; i<len; i++){
		links.push({
            type: "LineString",
            coordinates: [
                 airportLocationMap.get(data[i].startCode),
                 airportLocationMap.get(data[i].destCode)
            ],
            weight: data[i].amount,
            start: data[i].startCode,
            end: data[i].destCode
        });
	}
	return links;
}

function setMaxes(){
	airlineFlightPerWeek.forEach(function(a){
		airlineMaxes.set(a.airline, Math.max(a.week9, a.week10, a.week11, a.week12, a.week13, a.week14, a.week15, a.week16, a.week17, a.week18))
	})
}

function highlightNormalPopRoutes(){
	allRoutes = mapSvg.selectAll(".routes")
	allRoutes.attr("stroke-opacity", function(d){return 0.005})


	specialRoutes = mapSvg.selectAll("#KSFO-KLAX, #KLAX-KLAS, #KLAX-KJFK")
	specialRoutes.attr("stroke-opacity", function(d){return 0.8})
					.attr("stroke-width", 10)

	textGroup = mapSvg.append('g').attr("class", "LAX-textgroup")

	textGroup.append("text")
			.attr("class", 'LAX-text')
			.attr("transform", 'translate('+screenWidth*0.18+','+screenHeight*0.55+')')
			.text("LAX-SFO")

	textGroup.append("text")
			.attr("class", 'LAX-text')
			.attr("transform", 'translate('+screenWidth*0.32+','+screenHeight*0.6+')')
			.text("LAX-LAS")

	textGroup.append("text")
			.attr("class", 'LAX-text')
			.attr("transform", 'translate('+screenWidth*0.39+','+screenHeight*0.68+')')
			.text("LAX-JFK")

	textGroup.append("text")
			.attr("class", 'LAX-textflights')
			.attr("transform", 'translate('+screenWidth*0.155+','+screenHeight*0.39+')')
			.text("flights")

	textGroup.append("text")
			.attr("class", 'LAX-textflights')
			.attr("transform", 'translate('+screenWidth*0.39+','+screenHeight*0.55+')')
			.text("flights")

	textGroup.append("text")
			.attr("class", 'LAX-textflights')
			.attr("transform", 'translate('+screenWidth*0.4925+','+screenHeight*0.69+')')
			.text("flights")

	textGroup.append("text")
			.attr("class", 'LAX-textnum')
			.attr("transform", 'translate('+screenWidth*0.12+','+screenHeight*0.37+')')
			.text("646")

	textGroup.append("text")
			.attr("class", 'LAX-textnum')
			.attr("transform", 'translate('+screenWidth*0.365+','+screenHeight*0.53+')')
			.text("451")

	textGroup.append("text")
			.attr("class", 'LAX-textnum')
			.attr("transform", 'translate('+screenWidth*0.47+','+screenHeight*0.67+')')
			.text("421")


}

function unhighlightRoutes(){
	allRoutes = mapSvg.selectAll(".routes")
	allRoutes.attr("stroke-opacity", function(d){return 0.1})

	latextGroup = mapSvg.selectAll(".LAX-textgroup").remove();

}

function highlightHighImpactAirports(){
	airports = airportData.filter(d => d.icao == "KEWR" || d.icao == "KSDF");
	drawAirportCircles(airports);
	drawSDFandEWRChart(airports);
}

function removeHighlightAirports(){
	charts = mapSvg.selectAll('.airportCharts');
	charts.transition().duration(750)
					.attr("opacity", 0);

	circles = mapSvg.selectAll('.airportCircles');
	circles.transition().duration(750)
					.attr("opacity", 0);

	charts.remove();
	circles.remove();
}

function drawSDFandEWRChart(airports){
	EWR = [airports[0]]
	SDF = [airports[1]]

	ewrChartBase = mapSvg.selectAll("#ewrChart")
				.data(EWR)
				.join(
			    	enter => enter.append("g"),
			    	update => update,
			    	exit => exit.remove()
		    	).attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - screenHeight*0.25;
					var r = p[0] - screenWidth*0.1;
					return "translate(" + r +','+q + ")";
				})
				.attr("class", "airportCharts")
				.attr("id", d => "ewrChart") 

	sdfChartBase = mapSvg.selectAll("#sdfChart")
				.data(SDF)
				.join(
			    	enter => enter.append("g"),
			    	update => update,
			    	exit => exit.remove()
		    	).attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - screenHeight*0.25;
					var r = p[0] - screenWidth*0.15;
					return "translate(" + r +','+q + ")";
				})
				.attr("class", "airportCharts")
				.attr("id", d => "sdfChart") 

	var chartWidth = screenWidth*0.2;
	var chartHeight = screenHeight/5;
	margin = 5;

	ewrChartBase.append("rect")
				.attr("width", chartWidth*1.15)
		    	.attr("height", chartHeight)
		    	.attr("fill", 'white')
		    	.transition().duration(750)
		    	.attr("opacity", 0.9);

	sdfChartBase.append("rect")
				.attr("width", chartWidth*1.15)
		    	.attr("height", chartHeight)
		    	.attr("fill", 'white')
		    	.transition().duration(750)
		    	.attr("opacity", 0.9)
				.attr("transform", "translate("+ -1*chartWidth/2 +",0)");


	ewrData = airportFlightsPerWeek.filter(x => x.airport == EWR[0].icao)[0];
	ewrYdata = [parseInt(ewrData.week9), parseInt(ewrData.week10), parseInt(ewrData.week11), parseInt(ewrData.week12), parseInt(ewrData.week13), parseInt(ewrData.week14), parseInt(ewrData.week15), parseInt(ewrData.week16), parseInt(ewrData.week17), parseInt(ewrData.week18)];
	sdfData = airportFlightsPerWeek.filter(x => x.airport == SDF[0].icao)[0];
	sdfYdata = [parseInt(sdfData.week9), parseInt(sdfData.week10), parseInt(sdfData.week11), parseInt(sdfData.week12), parseInt(sdfData.week13), parseInt(sdfData.week14), parseInt(sdfData.week15), parseInt(sdfData.week16), parseInt(sdfData.week17), parseInt(sdfData.week18)];

	const xData = [9,10,11,12,13,14,15,16,17,18];

	const xScale = d3.scaleLinear()
						.range ([0, chartWidth - 2*margin])
						.domain([d3.min(xData),d3.max(xData)])

    const yScaleEWR = d3.scaleLinear()
        				.range ([chartHeight - 2*margin, 0])
        				.domain([0, d3.max(ewrYdata)]);

    const yScaleSDF = d3.scaleLinear()
        				.range ([chartHeight - 2*margin, 0])
        				.domain([0, d3.max(sdfYdata)]);


    const airportGroupEWR = ewrChartBase.append("g")

    airportGroupEWR.append("g")
         .attr("transform", "translate("+chartWidth/22+"," + (chartHeight - margin) + ")")
         .call(d3.axisBottom(xScale).ticks(3));

    airportGroupEWR.append("g")
         .call(d3.axisLeft(yScaleEWR).ticks(3));


    const airportGroupSDF = sdfChartBase.append("g")
         					.attr("transform", "translate("+ -1*chartWidth/2 +",0)")

    // airportGroupSDF.append("g")
    //      .attr("transform", "translate("+chartWidth/22+"," + (chartHeight - margin) + ")")
    //      .call(d3.axisBottom(xScale).ticks(3));

    airportGroupSDF.append("g")
         .call(d3.axisLeft(yScaleSDF).ticks(3));

    airportGroupEWR.selectAll('rect')
    			.data(ewrYdata).join(
			    	enter => enter.append("rect"),
			    	update => update,
			    	exit => exit.remove()
		    	)
    			.attr('class','bar')
    			.attr("x", function (d,i) {
					return xScale(i+9)+margin;
				})
				.attr("y", function (d) {
					return yScaleEWR(d);
				})
				.attr("width", chartWidth/11)
				.attr("height", d=> chartHeight - yScaleEWR(d) - 2*margin);


	airportGroupSDF.selectAll('.bar')
    			.data(sdfYdata)
    			.enter().append("rect")
    			.attr('class','bar')
    			.attr("x", function (d,i) {
					return xScale(i+9)+margin;
				})
				.attr("y", function (d) {
					return yScaleSDF(d);
				})
				.attr("width", chartWidth/11)
				.attr("height", d=> chartHeight - yScaleSDF(d) - 2*margin)

}

function removeAirportCharts(){
	let charts = mapSvg.selectAll(".airportCharts")
			.transition().duration(750)
			.attr("opacity", 0)

	charts.remove();
}

function drawAirportCharts2(airportFlights){

	chartBase = mapSvg.selectAll(".airportCharts")
				.data(airportFlights)
				.join(
			    	enter => enter.append("g"),
			    	update => update,
			    	exit => exit.remove()
		    	).attr("transform", function(d) {

		    		airport = airportData.filter(k=> k.icao == d.airport)[0]
					var p = projection([airport.long, airport.lat]);
					var q = p[1] - screenHeight*0.25;
					var r = p[0] ;
					return "translate(" + r +','+q + ")";
				})
				.attr("class", "airportCharts")

	var chartWidth = screenWidth*0.2;
	var chartHeight = screenHeight/5;
	chartBase.append("rect")
				.attr("width", chartWidth)
		    	.attr("height", chartHeight)
		    	.attr("fill", 'white')
		    	.transition().duration(750)
		    	.attr("opacity", 0.9);


	margin = 5;
	xData = [9,10,11,12,13,14,15,16,17,18]

	let yData;
	chartBase.data().forEach(function(q, index){

		icao = q.airport;
		margin = 5;
		const xData = [9,10,11,12,13,14,15,16,17,18];
		yData = [parseInt(q.week9), parseInt(q.week10), parseInt(q.week11), parseInt(q.week12), parseInt(q.week13), parseInt(q.week14), parseInt(q.week15), parseInt(q.week16), parseInt(q.week17), parseInt(q.week18)];

		const xScale = d3.scaleLinear()
						.range ([0, chartWidth - 2*margin])
						.domain([d3.min(xData),d3.max(xData)])

		const yScale = d3.scaleLinear()
	    				.range ([chartHeight - 2*margin, 0])
	    				.domain([0, d3.max(yData)]);

	    airportGroup = chartBase.append("g").attr("id", "g-"+icao)

	    airportGroup.append("g")
	         .attr("transform", "translate(0," + (chartHeight - margin) + ")")
	         .call(d3.axisBottom(xScale));

	    airportGroup.append("g")
	         .call(d3.axisLeft(yScale));

	    var prebars = airportGroup.selectAll("#"+icao).data(yData).enter();

	    
	    var selectedBars = airportGroup.selectAll('#'+icao)
			.data(yData)
			.enter().append("rect")
			.attr('class','bar')
			.attr('id', icao)
			.attr("x", function (d,i) {
				return xScale(i+9);
			})
			.attr("y", function (d) {
				return yScale(d);
			})
			.attr("width", chartWidth/11)
			.attr("height", function(d, i){
				return chartHeight - yScale(d) - 2*margin
			})
			.attr("fill", 'red');

	});

	

	// chartBase.append("rect")
	// 			.attr('class','bar')
	// 			.attr('id', z.icao)
	// 			.attr("x", function (d,i) {
	// 				return xScale(i+9);
	// 			})
	// 			.attr("y", function (d) {
	// 				return yScale(d);
	// 			})
	// 			.attr("width", chartWidth/11)
	// 			.attr("height", function(d){
	// 				console.log("-----")
	// 				console.log(chartHeight);
	// 				console.log(yData);
	// 				console.log(yScale(d))
	// 				return chartHeight - yScale(d) - 2*margin
	// 			})
	// 			.attr("fill", 'red');

	// console.log(chartBase._groups[0]);
	// chartBase._groups[0].forEach(function(z,i){
	// 	let filteredFlightsPerWeek = z;
	// 	console.log("FILTERED FLIGHTS");
	// 	console.log(filteredFlightsPerWeek);
	// 	yData = [parseInt(filteredFlightsPerWeek.week9), parseInt(filteredFlightsPerWeek.week10), parseInt(filteredFlightsPerWeek.week11), parseInt(filteredFlightsPerWeek.week12), parseInt(filteredFlightsPerWeek.week13), parseInt(filteredFlightsPerWeek.week14), parseInt(filteredFlightsPerWeek.week15), parseInt(filteredFlightsPerWeek.week16), parseInt(filteredFlightsPerWeek.week17), parseInt(filteredFlightsPerWeek.week18)];
	// 	xData = [9,10,11,12,13,14,15,16,17,18]

	// 	xScale = d3.scaleLinear()
	// 					.range ([0, chartWidth - 2*margin])
	// 					.domain([d3.min(xData),d3.max(xData)])

	//     yScale = d3.scaleLinear()
	//     				.range ([chartHeight - 2*margin, 0])
	//     				.domain([0, d3.max(yData)]);

	//     airportGroup = chartBase.append("g")

	//     airportGroup.append("g")
	//          .attr("transform", "translate(0," + (chartHeight - margin) + ")")
	//          .call(d3.axisBottom(xScale));

	//     airportGroup.append("g")
	//          .call(d3.axisLeft(yScale));

	//     airportGroup.selectAll('#'+z.icao)
	// 			.data(yData)
	// 			.join(
	// 				enter => enter.append("rect"),
	// 		    	update => update,
	// 		    	exit => exit.remove() 
	// 				)
	// 			.attr('class','bar')
	// 			.attr('id', z.icao)
	// 			.attr("x", function (d,i) {
	// 				return xScale(i+9);
	// 			})
	// 			.attr("y", function (d) {
	// 				return yScale(d);
	// 			})
	// 			.attr("width", chartWidth/11)
	// 			.attr("height", function(d){
	// 				console.log("-----")
	// 				console.log(chartHeight);
	// 				console.log(yData);
	// 				console.log(yScale(d))
	// 				return chartHeight - yScale(d) - 2*margin
	// 			})
	// 			.attr("fill", 'red');
	// })	
}


function drawAirportCharts(airports){
	chartBase = mapSvg.selectAll(".airportCharts")
				.data(airports)
				.join(
			    	enter => enter.append("g"),
			    	update => update,
			    	exit => exit.remove()
		    	).attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - screenHeight*0.25;
					var r = p[0] ;
					return "translate(" + r +','+q + ")";
				})
				.attr("class", "airportCharts")

	var chartWidth = screenWidth*0.2;
	var chartHeight = screenHeight/5;
	chartBase.append("rect")
				.attr("width", chartWidth)
		    	.attr("height", chartHeight)
		    	.attr("fill", 'white')
		    	.transition().duration(750)
		    	.attr("opacity", 0.9);


	margin = 5;


	airports.forEach(function(q){
		filteredFlightsPerWeek = airportFlightsPerWeek.filter(x=> x.airport == q.icao)[0]
		const yData = [parseInt(filteredFlightsPerWeek.week9), parseInt(filteredFlightsPerWeek.week10), parseInt(filteredFlightsPerWeek.week11), parseInt(filteredFlightsPerWeek.week12), parseInt(filteredFlightsPerWeek.week13), parseInt(filteredFlightsPerWeek.week14), parseInt(filteredFlightsPerWeek.week15), parseInt(filteredFlightsPerWeek.week16), parseInt(filteredFlightsPerWeek.week17), parseInt(filteredFlightsPerWeek.week18)];
		const xData = [9,10,11,12,13,14,15,16,17,18]

		const xScale = d3.scaleLinear()
						.range ([0, chartWidth - 2*margin])
						.domain([d3.min(xData),d3.max(xData)])

        const yScale = d3.scaleLinear()
        				.range ([chartHeight - 2*margin, 0])
        				.domain([0, d3.max(yData)]);

        const airportGroup = chartBase.append("g")

        airportGroup.append("g")
	         .attr("transform", "translate(0," + (chartHeight - margin) + ")")
	         .call(d3.axisBottom(xScale));

        airportGroup.append("g")
	         .call(d3.axisLeft(yScale));

	    console.log("yData : "+yData);
	    selected = airportGroup.selectAll('#'+q.icao)
    			.data(yData)
    			.enter().append("rect")
    			.attr('class','bar')
    			.attr('id', q.icao)
    			.attr("x", function (d,i) {
					return xScale(i+9);
				})
				.attr("y", function (d) {
					return yScale(d);
				})
				.attr("width", chartWidth/11)
				.attr("height", d=> chartHeight - yScale(d) - 2*margin)
				.attr("fill", 'red');

		console.log(selected);

	})
}

function drawAirportCircles(airports){
	mapSvg.selectAll(".airportCircles")
				.data(airports)
				.join(
			    	enter => enter.append("circle"),
			    	update => update,
			    	exit => exit.remove()
		    	).attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1];
					var r = p[0] ;
					// return "translate(0,0)";
					return "translate(" + r +','+q + ")scale("+currentScale+')';
				})
				.attr("class", "airportCircles")
		    	.attr("r", 10)
		    	.style("fill", 'blue');
}

function removeAirportCircles(){
	let circles = mapSvg.selectAll(".airportCircles")
			.transition().duration(750)
			.attr("opacity", 0);

	circles.remove();
}

function makeAirlineChart(){
	let airlinesChartGroup = mapSvg.append("g")
								   .attr("transform", "translate(" + screenWidth*0.2 + ","+ screenHeight*0.15+")")
								   .attr("class", "airlineGroup");

	chartWidth = screenWidth*0.6;
	chartHeight = screenHeight*0.7;
	airlinesChartGroup.append("rect")
						.attr("id", "airline-background")
						.attr("width", chartWidth)
						.attr("height", chartHeight)
						.attr("fill", "white")
						.attr("opacity", 0.7);

	margin = chartWidth/20;

	const xScale = d3.scaleLinear()
						.range ([margin, chartWidth - margin])
						.domain([9,18])

    const yScale = d3.scaleLinear()
        				.range ([chartHeight - 2*margin, 0])
        				.domain([0, 100]);

    airlinesChartGroup.append("g")
         .attr("transform", "translate(0," + (chartHeight - margin) + ")")
         .call(d3.axisBottom(xScale));

    airlinesChartGroup.append("g")
    	 .attr("transform", "translate("+margin+"," + margin + ")")
         .call(d3.axisLeft(yScale));

    var dataNest = d3.nest()
        .key(function(d) {return d.airline;})
        .entries(filterImportantAirlines(airlineFlightsPerWeek));

     airlinesChartGroup.selectAll(".line")
      .data(dataNest)
      .enter()
      .append("path")
        .attr("fill", "none")
        .attr("stroke", function(d){ return getColorOfAirline(d)})
        .attr("stroke-width", 8)
        .attr("d", function(d,i){
          theLine =  d3.line()
          	// .curve(d3.curveMonotoneX)
            .x(function(d) { return xScale(d.week); })
            .y(function(d) { return yScale(+d.numFlights) + margin})
            (d.values)
          return theLine;
        })
      .on("mouseover", mouseOverLine)
}

function mouseOverLine(d, i){
	console.log("HERE");
	x = d3.select(this).attr({
          stroke: 8
        });
	console.log(x);
}

function getColorOfAirline(x){
	console.log(x.values[0])
	return airlineColor.get(x.values[0].airline)
}

function filterImportantAirlines(){
	// return airlineFlightPercentPerWeek.filter(f => airlineMaxes.get(f.airline) > 2000)
	return airlineFlightPercentPerWeek.filter(function(f){
		
		relevantAirlines = majorAirlines;
		if (true){
			relevantAirlines += budgetAirlines;
			relevantAirlines += deliveryAirlines;
		}
		return relevantAirlines.indexOf(f.airline) >= 0
	})
}

function removeAirlineChart(){
	mapSvg.select(".airlineGroup").remove();
}

function zoomToLA(){
	mapSvg.selectAll('path, .routes, .airport')
			.transition()
    		.duration(750)
    		.attr("transform", "translate(" + screenWidth/8 + ","+ -1*screenHeight/2+")scale(" + 2 + ")")

    currentTranslate = (screenWidth/8 , -1*screenHeight/2);
    currentScale = 2;
}

function zoomToCountry(){
	mapSvg.selectAll('path', '.routes', '.airport')
			.transition()
    		.duration(750)
    		.attr("transform", "translate(" + 0 + ","+ 0+")scale(" + 1 + ")")

    currentTranslate = (0,0);
    currentScale = 1;
}

function zoomToRightSide(){
	mapSvg.selectAll('path', '.routes', '.airport')
			.transition()
    		.duration(750)
    		.attr("transform", "translate(" + screenWidth/3 + ","+ screenHeight/8+")scale(" + 0.7 + ")")

    currentTranslate = (screenWidth/3 , screenHeight/8);
    currentScale = 0.7;
}



//HELPER FUNCTIONS

//flights
function getAirportFlights(flightData, specificAirport){
	return flightData.filter(d => (d.startCode == specificAirport || d.destCode == specificAirport));
}

function temporalFilter(flightData, selectedWeek){
	return flightData.filter(d => d.week == selectedWeek);
}

function getFlightsInContinentalUS(flightData){
	return flightData.filter(d => (airportStateMap.get(d.startCode) !== 'AK' && airportStateMap.get(d.destCode) !== 'AK'));
}


//airports
function getSpecificAirport(airportData, specificAirport){
	x = airportData.filter(d => (d.icao == specificAirport));
	return x;
}

function getUSairports(airportData){
	return airportData.filter(d => d.country == 'US');
}

function getAirportsInState(airportData, specificState){
	return airportData.filter(d => d.state == specificState);
}

function getAirportsExcludingStates(airportData){
	return airportData.filter(d => excludedStates.indexOf(d.state) == -1)
}

function largeAirportsOnly(airportData){
	return airportData.filter(d => (d.maxTraffic > MAJOR_AIRPORT_THRESHOLD))
}

function getAirportCountry(icaoCode){
	return airportData.filter(d => d.icao == icaoCode)[0].country;
}

function getAirportCity(icaoCode){
	return airportData.filter(d => d.icao == icaoCode)[0].city;
}

function getAirportTraffic(icao, week){
	a = airportFlightsPerWeek.filter(d => d.airport == icao)
	eval("q = a[0].week"+week);
	return q;
}


function getScrollDistance() {
    var y, docEl;
    
    if ( typeof window.pageYOffset === 'number' ) {
        y = window.pageYOffset;
    } else {
        docEl = (document.compatMode && document.compatMode === 'CSS1Compat')?
                document.documentElement: document.body;
        y = docEl.scrollTop;
    }
    return y;
}

///MAIN

initialLoad();
drawScrolly();
window.addEventListener('scroll', function(e){

	var distanceFromTop = getScrollDistance();
	// console.log(distanceFromTop/(screenHeight*0.75))
	if (screenHeight*0.5 > distanceFromTop && currentScrollState != scrollyState.TITLE){
		removeAirports();
		drawRoutes();
		currentScrollState = scrollyState.TITLE;
	}
	else 
		if (screenHeight*1.75 > distanceFromTop && distanceFromTop > screenHeight*0.5){
		if (currentScrollState != scrollyState.NORMAL_AIRPORT){
			unhighlightRoutes();
			zoomToCountry();
			currentZoomScope = zoomScope.COUNTRY;
			removeRoutes();
			drawAirports();
			currentScrollState = scrollyState.NORMAL_AIRPORT;
		}

	} else if (screenHeight*2.75 > distanceFromTop && distanceFromTop > screenHeight*1.75){
		//LA most popular flights
		if (currentScrollState != scrollyState.NORMAL_POP_ROUTE){
			removeAirports();
			drawRoutes();

			highlightNormalPopRoutes();
			zoomToLA();
			currentZoomScope = zoomScope.OTHER;
			currentScrollState = scrollyState.NORMAL_POP_ROUTE;

		}
		mapSvg.select("#flightDeclineChart")
				.attr("opacity", 0);

	} else if (screenHeight*3.75 > distanceFromTop && distanceFromTop > screenHeight*2.75){
		//total flights decline chart
		zeroToOne = ((distanceFromTop-screenHeight*2.75)/screenHeight);
		if (currentScrollState != scrollyState.TOTAL_FLIGHTS){
			unhighlightRoutes();
			removeHighlightAirports();
			currentZoomScope = zoomScope.OTHER;
			currentScrollState = scrollyState.TOTAL_FLIGHTS;
		}

		if (Math.round(zeroToOne*8 + 10) != currentWeek){
			currentWeek = Math.min(Math.max(Math.round(zeroToOne*15-3), 0),8) + 10;

			drawRoutes();
			zoomToRightSide();
		}
		
		mapSvg.select("#flightDeclineChart")
				.attr("opacity", Math.min(zeroToOne*5, 1))

		
	}else if (screenHeight*4.75 > distanceFromTop && distanceFromTop > screenHeight*3.75){
		//airport comparison large
		zeroToOne = ((distanceFromTop-screenHeight*3.75)/screenHeight);
		mapSvg.select("#flightDeclineChart")
				.attr("opacity", Math.max(-1*zeroToOne*5 + 1, 0))

		if (currentScrollState != scrollyState.AIRPORT_COMPARE_LARGE){
			currentScrollState = scrollyState.AIRPORT_COMPARE_LARGE;
			removeRoutes();
			removeAirlineChart();
			setTimeout(zoomToCountry, 750);
			currentZoomScope = zoomScope.COUNTRY;
			setTimeout(highlightHighImpactAirports, 1500);
		}

	} else if (screenHeight*5.75 > distanceFromTop && distanceFromTop > screenHeight*4.75){
		//airline comparison large
		
		if (currentScrollState != scrollyState.AIRLINE_COMPARE){
			currentScrollState = scrollyState.AIRLINE_COMPARE;
			removeAirportCharts();
			removeAirportCircles();
			makeAirlineChart();
		}

	}

})
