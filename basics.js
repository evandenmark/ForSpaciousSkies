//GLOBAL CONSTANTS
MAJOR_AIRPORT_THRESHOLD = 2000;

//GLOBAL INITIALIZED VARIABLES
var airportData;
var flightData;
var airlineFlightsPerWeek;
var airportFlightsPerWeek;
var mapSvg;
var mainG;
var path;
var projection;
var currentWeek = 5;
var currentTranslate = (0,0);
var currentScale = 1; 


var airportLocationMap;
var airportStateMap;
var airportCityMap;

let excludedStates = ['AK', 'HI'];

//SCROLLY
const scrollyState = {
	TITLE : 'title',
	NORMAL_AIRPORT: 'normal_airport',
	NORMAL_POP_ROUTE: 'normal_pop_route',
	TOTAL_FLIGHTS: 'total_flights',
	AIRPORT_COMPARE: 'airport_compare',
	AIRLINE_COMPARE: 'airline_compare'
} 

let currentScrollState = scrollyState.TITLE;
window.scrollTo(0,0);

//zoom
const zoomScope = {
	COUNTRY : 'country',
	OTHER: 'other'
} 
let currentZoomScope = zoomScope.COUNTRY;