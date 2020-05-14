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
			      .attr('class', 'mappath')
			      .attr("fill", "#efefef")
			      .attr("stroke", "#fff");

		d3.csv("./data/airports.csv").then(function(data){
			airportData = data;
			airportLocationMap = new Map(data.map(d => [d.icao, [d.long, d.lat]]));
			airportStateMap = new Map(data.map(d => [d.icao, d.state]));
			airportCityMap = new Map(data.map(d => [d.icao, d.city]));

			d3.csv("./data/AirportFlightsPerWeek.csv").then(function(data){
				airportFlightsPerWeek = data;
				drawScrolly();
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

 function wrap(text, width) {
	  text.each(function() {
	    var text = d3.select(this),
	        words = text.text().split(/\s+/).reverse(),
	        word,
	        line = [],
	        lineNumber = 0,
	        lineHeight = 1.2, // ems
	        y = text.attr("y"),
	        dy = parseFloat(text.attr("dy")),
	        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
	    while (word = words.pop()) {
	      line.push(word);
	      tspan.text(line.join(" "));
	      if (tspan.node().getComputedTextLength() > width) {
	        line.pop();
	        tspan.text(line.join(" "));
	        line = [word];
	        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy",lineHeight  + "em").text(word);
	      }
	    }
	  });
}

function drawScrolly(){
	//draws the scrollytelling blocks

	//main columns
	scrollySVG = d3.select("#scrolly-column").append("svg")
					    .attr("width", screenWidth)
					    .attr("height", screenHeight*8.5);


	//main title
	var titleGroup = scrollySVG.append('g')
								.attr("transform", 'translate('+screenWidth/2+','+screenHeight/2+')')

	var titleHeight = screenHeight/5;						
	var titleRect = titleGroup.append('rect')
						.attr("width", "100%")
						.attr("height", screenHeight/5)
						.attr('transform', 'translate('+ -screenWidth/2 +','+ -0.75*titleHeight+')')
					    .attr("fill", "#F0F2FF")
					    .attr("opacity", 0.99);

	var titleBack = scrollySVG.append('rect')
						.attr("width", "100%")
						.attr("height", "100%")
						.attr("fill", "white")
						.attr("opacity", 0.3)

	var title = titleGroup.append('text')
							.attr("id", 'title')
							.attr("transform", 'translate('+0+','+ -0.38*titleHeight+')')
							.text("For Spacious Skies")

	var subtitle = titleGroup.append('text')
							.attr("id", 'subtitle')
							.attr("transform", 'translate('+0+','+ -0.16*titleHeight+')')
							.text("How COVID-19 has rocked US domestic flights")

	var name = titleGroup.append('text')
							.attr("id", 'name')
							.text("By EVAN DENMARK ")

	var twitter = titleGroup.append('text')
							.attr("id", 'twitter')
							.attr("transform", 'translate('+0+','+ 0.1*titleHeight+')')
							.text("@EvDenmark")

	//normal airport
	var margin = 10;
	var rectWidth = 0.33*screenWidth;
	var normalAirportGroup = scrollySVG.append('g')
							.attr("transform", 'translate('+screenWidth*0.15+','+screenHeight*1.2+')')

	var normalAirport = normalAirportGroup.append('rect')
						.attr("width", rectWidth)
						.attr("height", screenHeight/5)
					    .attr("fill", "#F0F2FF");

	var normalAirportTitle = normalAirportGroup.append('text')
								.text("The Typical Week")
								.attr("class", 'boxTitle')
								.attr('transform', 'translate('+margin+','+3*margin+')');

	var normalAirportText = normalAirportGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+margin+','+6*margin+')')
								.text("In a normal week, there are roughly 100,000 domestic flights in the US, with \
										nearly 22% going through America's big three: Atlanta (ATL), Chicago O'Hare (ORD), and Los Angeles (LAX).")
								.call(wrap, rectWidth - 2*margin)

	//abnormal airports week 18
	var abNormalAirportGroup = scrollySVG.append('g')
							.attr("transform", 'translate('+screenWidth*0.15+','+screenHeight*2.2+')')

	var abNormalAirport = abNormalAirportGroup.append('rect')
						.attr("width", rectWidth)
						.attr("height", screenHeight/3)
					    .attr("fill", "#F0F2FF");

	var abNormalAirportTitle = abNormalAirportGroup.append('text')
								.text("Enter COVID...")
								.attr("class", 'boxTitle')
								.attr('transform', 'translate('+margin+','+3*margin+')');

	var abNormalAirportText = abNormalAirportGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+margin+','+6*margin+')')
								.text("In the last seven days of April, US domestic flights were down to 28,054 - about 27% of the average week in February. ")
								.call(wrap, rectWidth-2*margin)

	var abNormalAirportText2 = abNormalAirportGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+margin+','+12*margin+')')
								.text("Of the US's major airports, New York Laguardia (LGA) was the hit the hardest, reducing its traffic to only 4.6% of its weekly normal. New York, the pandemic epicenter, reduced its weekly domestic traffic by 11,444 flights as a city.")
								.call(wrap, rectWidth-2*margin)

	var abNormalAirportText3 = abNormalAirportGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+margin+','+24*margin+')')
								.text("Airports in more rural cities saw less of a decrease, like Louisville, KY (SDF), which shrunk to only 71% of its weekly normal.")
								.call(wrap, rectWidth-2*margin)

	//most popular airports
	var normalPopRoutesGroup = scrollySVG.append('g')
							.attr("transform", 'translate('+screenWidth*0.67+','+screenHeight*3+')')

	var normalPopRoutesRect = normalPopRoutesGroup.append('rect')
						.attr("width", screenWidth/2)
						.attr("height", screenHeight/2)
					    .attr("fill", "#F0F2FF");

	var normalPopRoutesTitle = normalPopRoutesGroup.append('text')
								.text("Hot Routes")
								.attr("class", 'boxTitle')
								.attr('transform', 'translate('+margin+','+3*margin+')');

	var normalPopRoutesText = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+margin+','+6*margin+')')
								.text("In a normal 2020 week, the three most popular routes go through LAX. From February 21-27, there were 618 flights between LAX and SFO.")
								.call(wrap, rectWidth-2*margin)

	var normalPopRoutesText2 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+margin+','+15*margin+')')
								.text("At the end of February, the top 10 routes were:")
								.call(wrap, rectWidth-2*margin)

	var top10_1 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+18*margin+')')
								.text("1.  LAX-SFO: 618")
								.call(wrap, rectWidth-2*margin)

	var top10_2 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+21*margin+')')
								.text("2. LAX-JFK: 485")
								.call(wrap, rectWidth-2*margin)

	var top10_3 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+24*margin+')')
								.text("3. LAX-LAS: 450")
								.call(wrap, rectWidth-2*margin)

	var top10_4 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+27*margin+')')
								.text("4. DCA-BOS: 396")
								.call(wrap, rectWidth-2*margin)

	var top10_5 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+30*margin+')')
								.text("5. LAX-SJC: 368")
								.call(wrap, rectWidth-2*margin)

	var top10_6 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+33*margin+')')
								.text("6. LAX-SEA: 360")
								.call(wrap, rectWidth-2*margin)

	var top10_7 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+36*margin+')')
								.text("7. ATL-FLL: 343")
								.call(wrap, rectWidth-2*margin)

	var top10_8 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+39*margin+')')
								.text("8. SFO-SEA: 317")
								.call(wrap, rectWidth-2*margin)

	var top10_9 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+42*margin+')')
								.text("9. BOS-PHL: 313")
								.call(wrap, rectWidth-2*margin)

	var top10_10 = normalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+45*margin+')')
								.text("10. SEA-PDX: 183")
								.call(wrap, rectWidth-2*margin)

	

	//most popular airports
	var abNormalPopRoutesGroup = scrollySVG.append('g')
							.attr("transform", 'translate('+screenWidth*0.67+','+screenHeight*3.9+')')

	var abNormalPopRoutesRect = abNormalPopRoutesGroup.append('rect')
						.attr("width", screenWidth/2)
						.attr("height", screenHeight/2)
					    .attr("fill", "#F0F2FF");

	var abNormalPopRoutesTitle = abNormalPopRoutesGroup.append('text')
								.text("Cooling Down")
								.attr("class", 'boxTitle')
								.attr('transform', 'translate('+margin+','+3*margin+')');

	var abNormalPopRoutesText = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+margin+','+6*margin+')')
								.text("Ten weeks later, the top route remained, but shrunk to 22% of its February capacity. In general, the top tier routes decreased significantly")
								.call(wrap, rectWidth-2*margin)

	var abNormalPopRoutesText2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+margin+','+15*margin+')')
								.text("At the end of April, the top 10 routes were:")
								.call(wrap, rectWidth-2*margin)

	var top10_1_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+18*margin+')')
								.text("1.  LAX-SFO: 139")
								.call(wrap, rectWidth-2*margin)

	var top10_2_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+21*margin+')')
								.text("2. SEA-PDX: 104")
								.call(wrap, rectWidth-2*margin)

	var top10_3_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+24*margin+')')
								.text("3. ANC-ORD: 87")
								.call(wrap, rectWidth-2*margin)

	var top10_4_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+27*margin+')')
								.text("4. ANC-SEA: 85")
								.call(wrap, rectWidth-2*margin)

	var top10_5_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+30*margin+')')
								.text("5. ORD-DFW: 83")
								.call(wrap, rectWidth-2*margin)

	var top10_6_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+33*margin+')')
								.text("6. DTW-ORD: 50")
								.call(wrap, rectWidth-2*margin)

	var top10_7_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+36*margin+')')
								.text("7. PHX-DEN: 48")
								.call(wrap, rectWidth-2*margin)

	var top10_8_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+39*margin+')')
								.text("8. IAH-ORD: 46")
								.call(wrap, rectWidth-2*margin)

	var top10_9_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+42*margin+')')
								.text("9. LAX-LAS: 46")
								.call(wrap, rectWidth-2*margin)

	var top10_10_2 = abNormalPopRoutesGroup.append('text')
								.attr("class", 'boxText')
								.attr('transform', 'translate('+3*margin+','+45*margin+')')
								.text("10. DFW-SDF: 43")
								.call(wrap, rectWidth-2*margin)


	//EWR and SDF comparison
	// var ewrsdfGroup = scrollySVG.append('g')
	// 						.attr("transform", 'translate('+0+','+6.2*screenHeight+')')
	// 						.attr("id", "ewrsdfGroup")
	// 						.attr("opacity", 1);

	// var ewrsdfRect = ewrsdfGroup.append('rect')
	// 					.attr("width", rectWidth)
	// 					.attr("height", screenHeight/4)
	// 					.attr("id", "ewrsdfRect")
	// 				    .attr("fill", "#F0F2FF")
	// 				    .attr("opacity", 1);

	// //total flight decline
	var totalFlightsDecline = mapSvg.append("g")
					   		 .attr("transform", 'translate('+0+','+0+')')
							 .attr("id", "flightDeclineChart")
					   		 .attr("opacity", 0)

	totalFlightsDecline.append('rect')
						.attr("width", "33%")
						.attr("height", screenHeight)
						.attr("id", "flightDeclineRect")
					    .attr("fill", "#F0F2FF");

	makeFlightDeclineChart(totalFlightsDecline);

	makeAirlineChart(scrollySVG);


	theEndGroup = scrollySVG.append('g')
					   		 .attr("transform", 'translate('+0+','+screenHeight*7.75+')')


	theEndGroup.append('rect')
						.attr("width", screenWidth)
						.attr("height", screenHeight/3)
					    .attr("fill", "#F0F2FF");


	theEndGroup.append('text')
							.attr("class", 'theend')
							.attr("transform", 'translate('+screenWidth/2+','+ screenHeight*0.07+')')
							.text("Open source flight data provided by OpenSky Network at www.opensky-network.org")
							.call(wrap, screenWidth/2)

	theEndGroup.append('text')
							.attr("class", 'theend')
							.attr("transform", 'translate('+screenWidth/2+','+ screenHeight*0.12+')')
							.text('Matthias SchÃ¤fer, Martin Strohmeier, Vincent Lenders, Ivan Martinovic and Matthias Wilhelm.\
									"Bringing Up OpenSky: A Large-scale ADS-B Sensor Network for Research".\
									In Proceedings of the 13th IEEE/ACM International Symposium on Information Processing in Sensor Networks (IPSN), pages 83-94, April 2014.')

							.call(wrap, screenWidth/2)

	theEndGroup.append('text')
							.attr("class", 'theend')
							.attr("transform", 'translate('+screenWidth/2+','+ screenHeight*0.22+')')
							.text('Xavier Olive.\
									"traffic, a toolbox for processing and analysing air traffic data."\
									Journal of Open Source Software 4(39), July 2019')

							.call(wrap, screenWidth/2)

	theEndGroup.append('text')
							.attr("class", 'theend')
							.attr("transform", 'translate('+screenWidth/2+','+ screenHeight*0.29+')')
							.text('Airport location data provided by OurAirports at www.ourairports.com')

							.call(wrap, screenWidth/2)



}

function makeFlightDeclineChart(chartGroup){
	const xData = [9,10,11,12,13,14,15,16,17,18];
	const f = airportFlightsPerWeek.filter(x => x.airport == 'total')[0];
	const yData = [parseInt(f.week9), parseInt(f.week10), parseInt(f.week11), parseInt(f.week12), parseInt(f.week13), parseInt(f.week14), parseInt(f.week15), parseInt(f.week16), parseInt(f.week17), parseInt(f.week18)];
	
	chartRect = mapSvg.select("#flightDeclineRect");
	chartWidth = parseInt(chartRect.attr('width').slice(0, -1))*screenWidth/100;
	chartHeight = screenHeight/2;
	margin = chartWidth/20;

	const xScale = d3.scaleLinear()
						.range ([-margin, chartWidth+margin])
						.domain([0, xData.length])

    const yScale = d3.scaleLinear()
        				.range ([chartHeight - 2*margin, 0])
        				.domain([0, d3.max(yData)]);

    // chartGroup.append("g")
    //      .attr("transform", "translate("+0+','+(chartHeight-margin)+ ")")
    //      .call(d3.axisBottom(xScale).ticks(10));

    // chartGroup.append("g")
    //      .attr("transform", "translate("+2*margin+','+margin+ ")")
    //      .call(d3.axisLeft(yScale).ticks(3));

    var line = d3.line()
    			.x(function(d,i) { return xScale(i); })
				.y(function(d) {  return yScale(d); })
				.curve(d3.curveMonotoneX)

	actualLine = chartGroup.append("path")
      	.attr("class", "lineTotal")
        .attr("fill", "none")
        .attr("stroke", function(d){ return "blue"})
        .attr("stroke-width", 8)
        .attr("transform", "translate("+margin+','+margin+ ")")
        .attr("d", line(yData))

    //hiding rect
    chartGroup.append('rect')
    			.attr('transform', 'translate('+0+','+0+')')
    			.attr('fill', '#F0F2FF')
    			.attr('height', chartHeight)
    			.attr('width', chartWidth)
    			.attr('id', 'declineHidingRect')


    //dashed lines
    chartGroup.append("line")
      					.attr("stroke", 'black')
      					.attr("x1", 0)     
					    .attr("y1", yScale(100000)+margin)      
					    .attr("x2", chartWidth)     
					    .attr("y2", yScale(100000)+margin)
					    .attr("stroke-width", 4)
					    .attr("stroke-opacity", 0.15)
					    .attr("stroke-dasharray", "10,10"); 

	chartGroup.append("line")
      					.attr("stroke", 'black')
      					.attr("x1", 0)     
					    .attr("y1", yScale(28054)+margin) 
					    .attr("x2", chartWidth)     
					    .attr("y2", yScale(28054)+margin)
					    .attr("stroke-width", 4)
					    .attr("stroke-opacity", 0.15)
					    .attr("stroke-dasharray", "10,10"); 

	chartGroup.append("line")
      					.attr("stroke", 'black')
      					.attr("x1", 0)     
					    .attr("y1", yScale(0)+margin) 
					    .attr("x2", chartWidth)     
					    .attr("y2", yScale(0)+margin)
					    .attr("stroke-width", 4)
					    .attr("stroke-opacity", 0.15)
					    .attr("stroke-dasharray", "10,10");

	textOffsetY = 8;
	textOffsetX = chartWidth/100;
	chartGroup.append("text")
	  					.attr('transform', 'translate('+ textOffsetX + ', '+ (yScale(100000)+margin - textOffsetY)+ ')')
	  					.attr('class', 'label')
	  					.text("100,000 flights")

	chartGroup.append("text")
	  					.attr('transform', 'translate('+ textOffsetX + ', '+ (yScale(28054)+margin - textOffsetY)+ ')')
	  					.attr('class', 'label')
	  					.text("28,054 flights")

	// chartGroup.append("text")
	//   					.attr('transform', 'translate('+ textOffsetX + ', '+ (yScale(0)+margin - textOffsetY)+ ')')
	//   					.attr('class', 'label')
	//   					.text("Empty Skies")


    //text
    declineTitle = chartGroup.append('text')
    							.text("Decrease in Flights")
    							.attr('class', 'boxTitle')
								.attr('transform', 'translate('+margin+','+chartHeight*1.2+')');

    declineText = chartGroup.append('text')
							.text("Beginning the week of March 16, the total number of US domestic flights took a nosedive for four straight weeks before leveling off around April 19. The last two weeks in April saw approximately 27% of 2020's busiest week. ")
							.attr('class', 'boxText')
							.attr('transform', 'translate('+margin+','+chartHeight*1.3+')')
							.call(wrap, screenWidth*0.3);


	  strokeWidth = 2;
	  //feb
	  chartGroup.append('rect')
	 		 			.attr('transform', 'translate('+ 0 + ', '+ chartHeight+ ')')
	  					.attr('width', chartWidth*0.15)
	  					.attr("rx", 3)
	  					.attr("ry", 3)
	  					.attr('height', 20)
	  					.attr("opacity", 0.3)
	  					.attr("fill", '#E7E7E7')
	  					.attr("stroke", "#3B3B3B")
	  					.attr("stroke-opacity", 0.8)
	  					.attr('stroke-width', strokeWidth)


	  chartGroup.append('text')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.002)+ ', '+  (chartHeight+ 15)+ ')')
	 		 			.attr("class", 'calendar')
	 		 			.text('Feb');

	  //march
	  chartGroup.append('rect')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.15 + strokeWidth) + ', '+ chartHeight+ ')')
	  					.attr('width', chartWidth*0.4)
	  					.attr("rx", 3)
	  					.attr("ry", 3)
	  					.attr('height', 20)
	  					.attr("opacity", 0.3)
	  					.attr("fill", '#E7E7E7')
	  					.attr("stroke", "#3B3B3B")
	  					.attr("stroke-opacity", 0.8)
	  					.attr('stroke-width', strokeWidth)

	  chartGroup.append('text')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.152 + strokeWidth) + ', '+  (chartHeight+ 15)+ ')')
	 		 			.attr("class", 'calendar')
	 		 			.text('Mar');

	  //april
	  chartGroup.append('rect')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.55 + strokeWidth) + ', '+ chartHeight+ ')')
	  					.attr('width', chartWidth*0.44)
	  					.attr("rx", 3)
	  					.attr("ry", 3)
	  					.attr('height', 20)
	  					.attr("opacity", 0.3)
	  					.attr("fill", '#E7E7E7')
	  					.attr("stroke", "#3B3B3B")
	  					.attr("stroke-opacity", 0.8)
	  					.attr('stroke-width', strokeWidth)

	  chartGroup.append('text')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.552 + 2*strokeWidth) + ', '+ (chartHeight+ 15)+ ')')
	 		 			.attr("class", 'calendar')
	 		 			.text('Apr');


	 //marker
	 chartGroup.append('rect')
	 		 			.attr('transform', 'translate('+ 0 + ', '+ chartHeight+ ')')
	  					.attr('width', chartWidth*0.1)
	  					.attr('height', 20)
	  					.attr('id', 'timelineMarkerDecline')
	  					.attr('fill', '#F08600')
	  					.attr('opacity', 0.5)




}


function drawRoutes(){
	//draw flight routes
	console.log("DRAWING ROUTES");

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
	                .attr("stroke-width", 0)
	                .attr("stroke-opacity", 0)
	                .attr('transform', 'translate('+currentTranslate[0]+','+currentTranslate[1]+'),scale('+currentScale+')')
	                .attr("stroke-width", function(d){
	                	if (currentScrollState == scrollyState.TOTAL_FLIGHTS){
	                		return d.weight*0.05
	                	}
	                	return d.weight*0.03})
	                .attr("stroke-opacity", function(d){
	                	if (currentScrollState == scrollyState.TOTAL_FLIGHTS){
	                		return d.weight*0.003
	                	}return d.weight*0.001
	                });

}

function mouseoverPath(d){
	console.log(d =>  d.start + "-" +d.end +' : '+ d.weight + ' flights')
}

function removeRoutes(){
	var routesToRemove = mapSvg.selectAll(".routes")
								.transition()
								.duration(750)
								.attr("stroke-opacity", 0)


	setTimeout(removeRoutesWait, 750);

}

function removeRoutesWait(){
	mapSvg.selectAll(".routes").remove();
}

function drawAirports(){

	filteredAirports = largeAirportsOnly(airportData);

	mapSvg.selectAll(".airportbaseline")
				.data(filteredAirports)
				.join(
			    	enter => enter.append("rect"),
			    	update => update,
			    	exit => exit.remove()
		    	).attr("transform", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] ;
					var r = p[0] - 15 ;
					return "translate(" + r +','+q + ")";
				})
		    	.attr("width", 30)
		    	.attr('class', 'airportbaseline')
		    	.attr('id', d=> d.icao)
				.attr('fill', 'black')
				.attr('stroke', "#000000")
				.attr("height", 1.5)
				
				.transition().duration(750)
				.attr('opacity', 1);

	airportBar = mapSvg.selectAll(".airport")
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
		    	.attr('x', function(d) {
					var p = projection([d.long, d.lat]);
					var r = p[0] - 7 ;
					return r;
				})
				.attr('y', function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1];
					return q;
				})
				.attr("height", 0)
				.transition().duration(750)
				.attr('opacity', 0.7)
				.attr("height", function(d){
		    		return getAirportTraffic(d.icao, currentWeek)/75
		    	})
		    	.attr('y', function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - getAirportTraffic(d.icao, currentWeek)/75;
					return q;
				})

	mapSvg.selectAll(".airporttext")
				.data(filteredAirports)
				.join(
			    	enter => enter.append("text"),
			    	update => update,
			    	exit => exit.remove()
		    	)
		    	.attr('class', 'airporttext')
		    	.attr('id', d=> d.icao)
		    	.attr("x", function(d) {
					var p = projection([d.long, d.lat]);
					var r = p[0] -55;
					return r;
				})
				.attr("y", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - 10;
					return q;
				})
				.attr('stroke', "#efefef")
				.attr("stroke-width", 0.1)
				
				.text(function(d){
					if (majorAirports.indexOf(d.icao) >=0){
						return d.icao.slice(1, d.icao.length)
					}
					return " ";
				})
				.transition().duration(750)
				.attr("y", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - getAirportTraffic(d.icao, currentWeek)/75 - 10;
					return q;
				})


	mapSvg.selectAll(".airporttextnum")
				.data(filteredAirports)
				.join(
			    	enter => enter.append("text"),
			    	update => update,
			    	exit => exit.remove()
		    	)
		    	.attr('class', 'airporttextnum')
		    	.attr('id', d=> d.icao)
		    	.attr("x", function(d) {
					var p = projection([d.long, d.lat]);
					var r = p[0] -15;
					return r;
				})
				.attr("y", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - 10;
					return q;
				})
				.text(function(d){
					if (majorAirports.indexOf(d.icao) >=0){
						return getAirportTraffic(d.icao, currentWeek);
					}
					return " ";
				})
				.transition().duration(750)
				.attr("y", function(d) {
					var p = projection([d.long, d.lat]);
					var q = p[1] - getAirportTraffic(d.icao, currentWeek)/75 - 10;
					return q;
				});



}

function removeAirports(){
	// mapSvg.selectAll(".airport").remove();

	var airportsToRemove = mapSvg.selectAll(".airport, .airportbaseline, .airporttext, .airporttextnum").remove();
	// 							.transition()
	// 							.duration(750)
	// 							.attr("opacity", 0)
	// 							.attr("stroke-opacity", 0);

	// setTimeout(removeAirportWait, 750, airportsToRemove);
}

function removeAirportWait(a){
	a.transition().duration(750).remove();
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
	specialRoutes.attr("stroke-width", function(d){return d.weight*0.06})
	                .attr("stroke-opacity", function(d){return d.weight*0.0025})

	flightNumData = [618, 450, 485];
	if (currentScrollState == scrollyState.ABNORMAL_POP_ROUTE){
		flightNumData = [139,46,38]
	}

	xyz = mapSvg.selectAll(".LAX-textgroup");
	xyz.remove();

	textGroup = mapSvg.append('g')
						.data([flightNumData])
						.attr("class", "LAX-textgroup")

	
	textGroup.append('text')
			.attr("class", 'LAX-text')
			.attr("transform", 'translate('+screenWidth*0.18+','+screenHeight*0.55+')')
			.text("LAX-SFO")

	textGroup.append('text')
			.attr("class", 'LAX-text')
			.attr("transform", 'translate('+screenWidth*0.32+','+screenHeight*0.6+')')
			.text("LAX-LAS")

	textGroup.append('text')
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

	textGroup.append('text')
			.attr("class", 'LAX-textnum')
			.attr("id", 'LAX-SFOnum')
			.attr("transform", 'translate('+screenWidth*0.12+','+screenHeight*0.37+')')
			.text(function(d){return d[0]})

	textGroup.append('text')
			.attr("class", 'LAX-textnum')
			.attr("id", 'LAX-LASnum')
			.attr("transform", 'translate('+screenWidth*0.365+','+screenHeight*0.53+')')
			.text(function(d){return d[1]})

	textGroup.append('text')
			.attr("class", 'LAX-textnum')
			.attr("id", 'LAX-JFKnum')
			.attr("transform", 'translate('+screenWidth*0.47+','+screenHeight*0.67+')')
			.text(function(d){return d[2]})


}

function unhighlightRoutes(){
	allRoutes = mapSvg.selectAll(".routes")
	allRoutes.attr("stroke-opacity", function(d){return d.weight*0.001})
	allRoutes.attr("stroke-width", function(d){return d.weight*0.03})


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
					var q = p[1] - screenHeight*0.3;
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
					var q = p[1] - screenHeight*0.43;
					var r = p[0] - screenWidth*0.15;
					return "translate(" + r +','+q + ")";
				})
				.attr("class", "airportCharts")
				.attr("id", d => "sdfChart") 

	var chartWidth = screenWidth*0.2;
	var chartHeight = screenHeight*0.25;
	margin = 5;

	ewrChartBase.append("rect")
				.attr("width", chartWidth*1.3)
		    	.attr("height", chartHeight)
		    	.attr("fill", 'white')
		    	.transition().duration(750)
		    	.attr("opacity", 0.9);

	sdfChartBase.append("rect")
				.attr("width", chartWidth*1.3)
		    	.attr("height", chartHeight*1.2)
		    	.attr("fill", 'white')
		    	.transition().duration(750)
		    	.attr("opacity", 0.9)
				.attr("transform", "translate("+ -1*chartWidth/2 +","+ -chartHeight*0.2+")");


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
        				.domain([0, d3.max(ewrYdata)]);


    const airportGroupEWR = ewrChartBase.append("g")

    airportGroupEWR.append("g")
         .attr("transform", "translate("+chartWidth/22+"," + (chartHeight - margin) + ")")
         .call(d3.axisBottom(xScale).ticks(10).tickFormat(function(d){return dateMap.get(d) || " "}));

    airportGroupEWR.append("g")
         .call(d3.axisLeft(yScaleEWR).ticks(3));


    const airportGroupSDF = sdfChartBase.append("g")
         					.attr("transform", "translate("+ -1*chartWidth/2 +",0)")

    airportGroupSDF.append("g")
         .attr("transform", "translate("+chartWidth/22+"," + (chartHeight - margin) + ")")
         .call(d3.axisBottom(xScale).ticks(10).tickFormat(function(d){return dateMap.get(d) || " "}));

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
				.attr("fill", 'red')
				.attr("opacity", 0.7)
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
				.attr("fill", 'red')
				.attr("opacity", 0.7)
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

function makeAirlineChart(scrollySVG){
	let airlinesChartGroup = scrollySVG.append("g")
								   .attr("transform", "translate(" + 0 + ","+ screenHeight*6.3+")")
								   .attr("class", "airlineGroup");

	chartWidth = screenWidth*0.99;
	chartHeight = screenHeight;
	margin = chartHeight/20;
	airlinesChartGroup.append("rect")
						.attr("id", "airline-background")
						.attr("width", screenWidth)
						.attr("height", screenHeight + margin)
						.attr("fill", "white")
						.attr('transform', 'translate('+0+','+ - margin+')')
						.attr("opacity", 1);


	const xScale = d3.scaleLinear()
						.range ([0, chartWidth])
						.domain([9,18])

    const yScale = d3.scaleLinear()
        				.range ([(chartHeight - 2*margin) , margin])
        				.domain([0, 100]);

    // airlinesChartGroup.append("g")
    //      .attr("transform", "translate("+0+"," + (chartHeight + margin) + ")")
    //      .call(d3.axisBottom(xScale).tickFormat(function(d){return dateMap.get(d) || " "}));

    // airlinesChartGroup.append("g")
    // 	 .attr("transform", "translate("+margin+"," + margin + ")")
    //      .call(d3.axisLeft(yScale));

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
          	.curve(d3.curveMonotoneX)
            .x(function(d) { return xScale(d.week); })
            .y(function(d) { return yScale(+d.numFlights) })
            (d.values)
          return theLine;
        })

    //100 and 0 zero lines
      airlinesChartGroup.append("line")
      					.attr("stroke", 'black')
      					.attr("x1", 0)     
					    .attr("y1", margin)      
					    .attr("x2", chartWidth)     
					    .attr("y2", margin)
					    .attr("stroke-width", 4)
					    .attr("stroke-opacity", 0.15)
					    .attr("stroke-dasharray", "10,10"); 

	  airlinesChartGroup.append("line")
      					.attr("stroke", 'black')
      					.attr("x1", 0)     
					    .attr("y1", (chartHeight- 2* margin)) 
					    .attr("x2", chartWidth)     
					    .attr("y2", (chartHeight- 2*margin))
					    .attr("stroke-width", 4)
					    .attr("stroke-opacity", 0.15)
					    .attr("stroke-dasharray", "10,10"); 


     hidingRect = airlinesChartGroup.append("rect")
      					.attr('width', screenWidth)
      					.attr('height', screenHeight)
      					.attr('fill', 'white')
      					.attr("id", "hiding-rect")
      					.attr("transform", "translate(0,0)")

     

	  textOffsetY = 8;
	  textOffsetX = chartWidth/100;
	  airlinesChartGroup.append("text")
	  					.attr('transform', 'translate('+ textOffsetX + ', '+ (margin - textOffsetY)+ ')')
	  					.attr('class', 'label')
	  					.text("100%")

	  airlinesChartGroup.append("text")
	  					.attr('transform', 'translate('+textOffsetX+','+(chartHeight- 2*margin -textOffsetY) + ')')
	  					.attr('class', 'label')
	  					.text("0%")

	  // airlinesChartGroup.append("text")
	  // 					.attr('transform', 'translate('+ 2.1*textOffsetX + ', '+ (margin - textOffsetY)+ ')')
	  // 					.attr('class', 'buttonText')
	  // 					.text("of 2020 Weekly Maximum")

	  //add calendar

	  strokeWidth = 2;
	  //feb
	  airlinesChartGroup.append('rect')
	 		 			.attr('transform', 'translate('+ chartWidth*0.25 + ', '+ 0+ ')')
	  					.attr('width', chartWidth*0.075)
	  					.attr("rx", 3)
	  					.attr("ry", 3)
	  					.attr('height', 20)
	  					.attr("opacity", 0.3)
	  					.attr("fill", '#E7E7E7')
	  					.attr("stroke", "#3B3B3B")
	  					.attr("stroke-opacity", 0.8)
	  					.attr('stroke-width', strokeWidth)


	  airlinesChartGroup.append('text')
	 		 			.attr('transform', 'translate('+ chartWidth*0.252 + ', '+ 15+ ')')
	 		 			.attr("class", 'calendar')
	 		 			.text('Feb');

	  //march
	  airlinesChartGroup.append('rect')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.325 + strokeWidth) + ', '+ 0+ ')')
	  					.attr('width', chartWidth*0.2)
	  					.attr("rx", 3)
	  					.attr("ry", 3)
	  					.attr('height', 20)
	  					.attr("opacity", 0.3)
	  					.attr("fill", '#E7E7E7')
	  					.attr("stroke", "#3B3B3B")
	  					.attr("stroke-opacity", 0.8)
	  					.attr('stroke-width', strokeWidth)

	  airlinesChartGroup.append('text')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.327 + strokeWidth) + ', '+ 15+ ')')
	 		 			.attr("class", 'calendar')
	 		 			.text('Mar');

	  //april
	  airlinesChartGroup.append('rect')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.525 + 2*strokeWidth) + ', '+ 0+ ')')
	  					.attr('width', chartWidth*0.225)
	  					.attr("rx", 3)
	  					.attr("ry", 3)
	  					.attr('height', 20)
	  					.attr("opacity", 0.3)
	  					.attr("fill", '#E7E7E7')
	  					.attr("stroke", "#3B3B3B")
	  					.attr("stroke-opacity", 0.8)
	  					.attr('stroke-width', strokeWidth)

	  airlinesChartGroup.append('text')
	 		 			.attr('transform', 'translate('+ (chartWidth*0.527 + 2*strokeWidth) + ', '+ 15+ ')')
	 		 			.attr("class", 'calendar')
	 		 			.text('Apr');


	  //current time marker

	airlinesChartGroup.append('rect')
	 		 			.attr('transform', 'translate('+ chartWidth*0.25 + ', '+ 0+ ')')
	  					.attr('width', chartWidth*0.05)
	  					.attr('height', 20)
	  					.attr('id', 'timelineMarker')
	  					.attr('fill', '#F08600')
	  					.attr('opacity', 0.5)


	airlineTextTitle = airlinesChartGroup.append('text')
			  					.text("Percent of Normal Operation")
			  					.attr('class', 'boxTitle')
			  					.attr('transform', 'translate('+2*margin+','+(chartHeight*0.25)+')');

	airlineText = airlinesChartGroup.append('text')
			  					.text("Different types of airlines saw different types of traffic behavior.")
			  					.attr('class', 'boxText')
			  					.attr('transform', 'translate('+2*margin+','+(chartHeight*0.3)+')')
			  					.call(wrap, chartWidth*0.25);

	airlineText2 = airlinesChartGroup.append('text')
			  					.text("Budget airlines - Frontier, Spirit, Sun Country, and Allegiant - cut a much larger percentage (90-99%) of their flights than the other major airlines.")
			  					.attr('class', 'boxText')
			  					.attr('transform', 'translate('+2*margin+','+(chartHeight*0.38)+')')
			  					.call(wrap, chartWidth*0.25);

	airlineText3 = airlinesChartGroup.append('text')
			  					.text("The nation's largest carrier - Southwest - slashed its operations by 69% over the ten week span.")
			  					.attr('class', 'boxText')
			  					.attr('transform', 'translate('+2*margin+','+(chartHeight*0.5)+')')
			  					.call(wrap, chartWidth*0.25);

	airlineText4 = airlinesChartGroup.append('text')
			  					.text("By contrast, Denver-based Frontier Airlines saw the most damage - operating only 11 nationwide flights in the last seven days of April compared to its 2020 weekly maximum of 1282 (< 1%).")
			  					.attr('class', 'boxText')
			  					.attr('transform', 'translate('+2*margin+','+(chartHeight*0.6)+')')
			  					.call(wrap, chartWidth*0.25);

	airlineText5 = airlinesChartGroup.append('text')
			  					.text("Delivery airlines like UPS and FedEx operated at nearly constant levels. ")
			  					.attr('class', 'boxText')
			  					.attr('transform', 'translate('+2*margin+','+(chartHeight*0.72)+')')
			  					.call(wrap, chartWidth*0.25);





	//add circles

	// airlinesChartGroup.selectAll('.airlineCircles')
	// 					.data(dataNest)
	// 					.enter()
	// 					.append('circle')
	// 						.attr("r", 25)
	// 						.attr('cx', function(d){
	// 							return xScale(d.values.filter(x => x.week == 9)[0].week)
	// 						})
	// 						.attr('cy', function(d){
	// 							h = chartHeight*parseInt(d.values.filter(x => x.week == 9)[0].numFlights)/100
	// 							return (chartHeight - h + margin )
	// 						})
	// 						.attr('fill', 'blue')
	// 						.attr('class', 'airlineCircles')




      //add text
      airlinesChartGroup.selectAll(".airlineLabel")
      	.data(dataNest)
      	.enter()
      	.append("text")
      	.attr('class', "airlineLabel")
      	.attr('transform', function(d){
      		h = chartHeight*parseInt(d.values.filter(x => x.week == 18)[0].numFlights)/100
      		bonus = 0;
      		// if (d.values[0].airline == "AAY" || d.values[0].airline == "FDX" ){
      		// 	bonus = chartWidth*0.12
      		// }else if (d.values[0].airline == "JBU" ){
      		// 	bonus = chartWidth*0.21
      		// }

      		return 'translate('+06+','+ (chartHeight - h + margin ) +')'})
      	.text(d => airlineNameMap.get(d.values[0].airline))

}

function mouseOverLine(d, i){
	console.log("HERE");
	x = d3.select(this).attr({
          stroke: 8
        });
	console.log(x);
}

function getColorOfAirline(x){
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
	mapSvg.selectAll('.mappath, .routes, .airport')
			.transition()
    		.duration(750)
    		.attr("transform", "translate(" + screenWidth/8 + ","+ -1*screenHeight/2+")scale(" + 2 + ")")

    currentTranslate = [screenWidth/8 , -1*screenHeight/2];
    currentScale = 2;
    currentZoomScope = zoomScope.LAX;
}

function zoomToCountry(){
	mapSvg.selectAll('.mappath', '.routes', '.airport')
			.transition()
    		.duration(750)
    		.attr("transform", "translate(" + 0 + ","+ 0+")scale(" + 1 + ")")

    currentTranslate = [0,0];
    currentScale = 1;
    currentZoomScope = zoomScope.COUNTRY;
}

function zoomToRightSide(){
	mapSvg.selectAll('.mappath', '.routes', '.airport')
			.transition()
    		.duration(750)
    		.attr("transform", "translate(" + screenWidth/3 + ","+ screenHeight/8+")scale(" + 0.7 + ")")

    currentTranslate = [screenWidth/3 , screenHeight/8];
    currentScale = 0.7;
    setTimeout(function(){currentZoomScope = zoomScope.RIGHT_SIDE;}, 100)
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