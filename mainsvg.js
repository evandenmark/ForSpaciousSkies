// DEFINE THE MAP
var screenWidth =  screen.width,
	screenHeight = screen.height;

// var screenWidth =  window.innerWidth,
// 	screenHeight = window.innerHeight;

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
			airlineFlightsPerWeek = data;
		});

	});
}

function drawScrolly(){
	//draws the scrollytelling blocks

	//main columns
	var leftScrollySVG = d3.select("#left-column").append("svg")
					    .attr("width", screenWidth/3)
					    .attr("height", screenHeight*5);


	var middleScrollySVG = d3.select("#middle-column").append("svg")
					    .attr("width", screenWidth/3)
					    .attr("height", screenHeight*5);

	var rightScrollySVG = d3.select("#right-column").append("svg")
					    .attr("width", screenWidth/3)
					    .attr("height", screenHeight*5);


	//main title
	var titleRect = middleScrollySVG.append('rect')
						.attr("width", "100%")
						.attr("height", screenHeight/5)
					    .attr("transform", 'translate(0,'+screenHeight/3+')')
					    .attr("fill", "green");



	//1st right scrolly
	var popularRoutes = rightScrollySVG.append('rect')
						.attr("width", "100%")
						.attr("height", screenHeight)
					    .attr("transform", 'translate(0,'+2*screenHeight+')')
					    .attr("fill", "green");

	//1st left scrolly
	var totalFlightsDecline = mapSvg.append("g");
	totalFlightsDecline.append('rect')
						.attr("width", "33%")
						.attr("height", "100%")
						.attr("id", "flightDeclineChart")
					    .attr("transform", 'translate(0,'+0+')')
					    .attr("fill", "green")
					    .attr("opacity", 0);
}



function drawRoutes(){
	//draw flight routes
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
	                .transition().duration(750)
	                .attr("stroke-width", 3)
	                .attr("stroke-opacity", function(d){return 0.1})

	routes.attr("transform", "translate("+currentTranslate+")scale("+currentScale+")")
	                
}

function removeRoutes(){
	var routesToRemove = mapSvg.selectAll(".routes")
								.transition()
								.duration(750)
								.attr("stroke-opacity", 0)

}

function drawAirports(){

	filteredAirports = largeAirportsOnly(airportData);

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
				.attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - this.height.baseVal.value ;
					var r = p[0] - 7 ;
					// return "translate(0,0)";
					return "translate(" + r +','+q + ")";
				})
				.attr("height", function(d){
		    		return getAirportTraffic(d.icao, 7)/100
		    	})
				.transition().duration(750)
				.attr('opacity', 0.7);
}

function removeAirports(){
	// mapSvg.selectAll(".airport").remove();

	var airportsToRemove = mapSvg.selectAll(".airport")
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

function highlightNormalPopRoutes(){
	allRoutes = mapSvg.selectAll(".routes")
	allRoutes.attr("stroke-opacity", function(d){return 0.005})


	specialRoutes = mapSvg.selectAll("#KSFO-KLAX, #KLAX-KLAS")
	specialRoutes.attr("stroke-opacity", function(d){return 0.8})
					.attr("stroke-width", 10)
}

function unhighlightRoutes(){
	allRoutes = mapSvg.selectAll(".routes")
	allRoutes.attr("stroke-opacity", function(d){return 0.1})

}

function highlightLargeAirports(){
	airports = airportData.filter(d => d.icao == "KATL" || d.icao == "KLAX" || d.icao == "KORD");
	drawAirportCircles(airports);
	drawAirportCharts(airports);

}

function highlightSmallAirports(){
	airports = airportData.filter(d => d.icao == "KOAK" || d.icao == "KCOS" || d.icao == "KPVD");
	drawAirportCircles(airports);
	drawAirportCharts(airports);

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
		yData = [filteredFlightsPerWeek.week9, filteredFlightsPerWeek.week10, filteredFlightsPerWeek.week11, filteredFlightsPerWeek.week12, filteredFlightsPerWeek.week13, filteredFlightsPerWeek.week14, filteredFlightsPerWeek.week15, filteredFlightsPerWeek.week16, filteredFlightsPerWeek.week17,filteredFlightsPerWeek.week18  ];
		xData = [9,10,11,12,13,14,15,16,17,18]

		console.log("-----");
		console.log(q.icao);
		console.log(yData);

		xScale = d3.scaleLinear()
						.range ([0, chartWidth - 2*margin])
						.domain([d3.min(xData),d3.max(xData)])

        yScale = d3.scaleLinear()
        				.range ([chartHeight - 2*margin, 0])
        				.domain([0, d3.max(yData)]);

        airportGroup = chartBase.append("g")

        chartBase.append("g")
	         .attr("transform", "translate(0," + (chartHeight - margin) + ")")
	         .call(d3.axisBottom(xScale));

        chartBase.append("g")
	         .call(d3.axisLeft(yScale));

	    chartBase.selectAll('.bar,'+'#'+q.icao)
    			.data(yData)
    			.join(
    				enter => enter.append("rect"),
			    	update => update,
			    	exit => exit.remove() 
    				)
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
					return "translate(" + r +','+q + ")";
				})
				.attr("class", "airportCircles")
		    	.attr("r", 10)
		    	.style("fill", 'blue');
}

function zoomToLA(){
	mapSvg.selectAll('path', '.routes', '.airport')
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
			zoomToLA();
			currentZoomScope = zoomScope.OTHER;
			highlightNormalPopRoutes();
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
			currentWeek = Math.round(zeroToOne*8 + 10);
			
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
			setTimeout(zoomToCountry, 750);
			currentZoomScope = zoomScope.COUNTRY;
			removeHighlightAirports();
			setTimeout(highlightLargeAirports, 1500);
		}

	}
	else if (screenHeight*5.75 > distanceFromTop && distanceFromTop > screenHeight*4.75){
		//airport comparison large

		if (currentScrollState != scrollyState.AIRPORT_COMPARE_SMALL){
			currentScrollState = scrollyState.AIRPORT_COMPARE_SMALL;
			currentZoomScope = zoomScope.COUNTRY;

			removeHighlightAirports();
			setTimeout(highlightSmallAirports, 1500);
		}

	}

})
