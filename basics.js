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
var currentWeek = 9;
var currentTranslate = (0,0);
var currentScale = 1; 


var airportLocationMap;
var airportStateMap;
var airportCityMap;

const majorAirports = ['KATL', 'KLAX', 'KORD', 'KBOS', 'KDEN', 'KDFW', 'KSEA']
let excludedStates = ['AK', 'HI'];
var airlineMaxes = new Map();

const majorAirlines = ['SWA', 'DAL', 'AAL', 'UAL', 'JBU', 'SKW'];
const budgetAirlines = ['FFT', 'NKS', 'SCX','AAY'];
const deliveryAirlines = ['UPS', 'FDX'];

const airlineCategoryMap = new Map([ ['budget', 'blue' ],
									 ['major', 'orange' ],
									 ['delivery', 'purple']])

let airlineColor = new Map([['DAL', '#E3132C'], 
									['JBU', '#003876'], 
									['UAL', '#cccccc'], 
									['SWA', '#F9B612'], 
									['AAL', '#0a92cc'], 
									['NKS', '#fcff2c'], 
									['FFT', '#248168'],
									['UPS', '#644117'],
									['FDX', '#4D148C'],
									['SCX', '#F58232'],
									['AAY', '#02569B'],
									['SKW', '#003896']]);


//SCROLLY
const scrollyState = {
	TITLE : 'title',
	NORMAL_AIRPORT: 'normal_airport',
	ABNORMAL_AIRPORT: 'abnormal_airport',
	NORMAL_POP_ROUTE: 'normal_pop_route',
	TOTAL_FLIGHTS: 'total_flights',
	AIRPORT_COMPARE_LARGE: 'airport_compare_large',
	AIRPORT_COMPARE_SMALL: 'airport_compare_small',
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