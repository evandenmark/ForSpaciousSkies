


///MAIN

initialLoad();
window.addEventListener('scroll', function(e){

	var distanceFromTop = getScrollDistance();
	console.log(distanceFromTop + " --- " + distanceFromTop/screenHeight)
	// console.log(distanceFromTop/(screenHeight*0.75))
	if (screenHeight*0.5 > distanceFromTop && currentScrollState != scrollyState.TITLE){
		currentScrollState = scrollyState.TITLE;
		removeAirports();
		drawRoutes();
	}
	else 
		if (screenHeight*1.75 >= distanceFromTop && distanceFromTop > screenHeight*0.5){
		if (currentScrollState != scrollyState.NORMAL_AIRPORT){
			currentWeek=9
			currentScrollState = scrollyState.NORMAL_AIRPORT;
			zoomToCountry();
			removeRoutes();
			drawAirports();
		}

	} else if (screenHeight*2.25 >= distanceFromTop && distanceFromTop > screenHeight*1.75){
		//abnormal airports
		if (currentScrollState != scrollyState.ABNORMAL_AIRPORT){
			currentWeek = 18
			currentScrollState = scrollyState.ABNORMAL_AIRPORT;
			unhighlightRoutes();
			zoomToCountry();
			removeRoutes();
			drawAirports();
		}

	}

	else if (screenHeight*3.2 >= distanceFromTop && distanceFromTop > screenHeight*2.25){
		//LA most popular flights week 9
		if (currentScrollState != scrollyState.NORMAL_POP_ROUTE){
			currentScrollState = scrollyState.NORMAL_POP_ROUTE;
			currentWeek = 9;
			removeAirports();
			drawRoutes();
			highlightNormalPopRoutes();
			zoomToLA();

		}
		mapSvg.select("#flightDeclineChart")
				.attr("opacity", 0);

	}else if (screenHeight*4.25 >= distanceFromTop && distanceFromTop > screenHeight*3.2){
		//LA most popular flights week 18
		if (currentScrollState != scrollyState.ABNORMAL_POP_ROUTE){
			currentScrollState = scrollyState.ABNORMAL_POP_ROUTE;
			currentWeek = 18;
			removeAirports();
			drawRoutes();

			highlightNormalPopRoutes();
			zoomToLA();

		}
		mapSvg.select("#flightDeclineChart")
				.attr("opacity", 0);

	} 
	else if (screenHeight*5.65 >= distanceFromTop && distanceFromTop > screenHeight*4.25){
		//total flights decline chart
		zeroToOne = ((distanceFromTop-screenHeight*4.25)/screenHeight);
		if (currentScrollState != scrollyState.TOTAL_FLIGHTS){
			currentWeek = 9
			unhighlightRoutes();
			removeHighlightAirports();
			currentScrollState = scrollyState.TOTAL_FLIGHTS;
			setTimeout(zoomToRightSide, 250);
		}

		if (Math.round(zeroToOne*9)+9 != currentWeek && currentZoomScope == zoomScope.RIGHT_SIDE){
			currentWeek = Math.round(zeroToOne*8)+10;
			console.log("current week: " + currentWeek);
			drawRoutes();
		}
		
		mapSvg.select("#flightDeclineChart")
				.attr("opacity", Math.min(zeroToOne*5, 1))

		mapSvg.select("#declineHidingRect")
				.attr('width', Math.max(0,(1-zeroToOne)*screenWidth*0.33))
				.attr('transform', 'translate('+(zeroToOne*screenWidth*0.33)+','+0+')')

		timelinePlaceDecline =  Math.min(zeroToOne*screenWidth*0.33, screenWidth*0.3)
		mapSvg.select("#timelineMarkerDecline")
					.attr('transform', 'translate('+timelinePlaceDecline+','+screenHeight/2+')')

		
	}
	 if (screenHeight*6.4 > distanceFromTop && distanceFromTop > screenHeight*5.4){
		//airline comparison large
		zeroToOne = ((distanceFromTop-screenHeight*5.4)/screenHeight)*1.0;

		currentWeek = Math.round((zeroToOne*9)+9)
		if (currentScrollState != scrollyState.AIRLINE_COMPARE){
			currentScrollState = scrollyState.AIRLINE_COMPARE;
			removeAirportCharts();
			removeAirportCircles();
		}

		hidingRect.attr("transform", "translate(" + (zeroToOne*screenWidth) + ",0)");


		timelinePlace = Math.max(Math.min(( chartWidth*0.2 + zeroToOne*screenWidth*0.5), chartWidth*0.7), chartWidth*0.25)
		scrollySVG.select("#timelineMarker")
					.attr('transform', 'translate('+timelinePlace+','+0+')')

		const xScale = d3.scaleLinear()
						.range ([0, chartWidth])
						.domain([9,18])


    	const yScale = d3.scaleLinear()
        				.range ([(chartHeight - 2*margin) , margin])
        				.domain([0, 100]);

		chartHeight = screenHeight*0.99;
		chartWidth = screenWidth*0.99;
	    margin = chartHeight*0.05;

	    scrollySVG.selectAll('.airlineLabel')
	    			.attr("transform", function(d) {

	    				return 'translate('+(zeroToOne*chartWidth-55)+','+(yScale(parseInt(d.values.filter(x => x.week == currentWeek)[0].numFlights))-10)+')'
	    			})

	}
	 if (screenHeight*6.4 > distanceFromTop && distanceFromTop > screenHeight*6.2){
		//airline comparison large
		if (currentWeek != 9){
			currentWeek = 16
			zoomToCountry();

			mapSvg.select("#flightDeclineChart")
					.attr("opacity", 0);
			drawRoutes()
		}

	}

})
