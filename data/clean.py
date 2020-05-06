import csv
import math

#AIRPORTS
airportDB = './airports_2020.csv'
airportFile = "./airports.csv"
airportDict = {}
relevantAirports = []


#FLIGHTS
import csv
flightsFile = './flights_2020.csv'
newFlightsFile = "./allFlights_jan.csv"
processedUSFlightsFile = "./processed_USflights.csv"
flightOrder = []
flightLog = {}
swFlightLog = {}
dlFlightLog = {}
jbFlightLog = {}
uaFlightLog = {}
aaFlightLog = {}
spFlightLog = {}
frFlightLog = {}
deltaFile = "./processed_delta.csv"
southwestFile = "./processed_southwest.csv"
unitedFile = "./processed_united.csv"
jetblueFile = "./processed_jetblue.csv"
americanFile = "./processed_american.csv"
spiritFile = "./processed_spirit.csv"
frontierFile = "./processed_frontier.csv"


#MAX TRAFFIC
maxTrafficAirportFile = "./maxTrafficAirport.csv"
maxTrafficRouteFile = "./maxTrafficRoutes.csv"
maxTrafficAirportDict = {}
maxTrafficRouteDict = {}

jetBlueMaxTrafficAirportFile = "./maxTrafficAirport_jetblue.csv"
jetBlueMaxTrafficRouteFile = "./maxTrafficRoutes_jetblue.csv"
jetBlueMaxTrafficAirportDict = {}
jetBlueMaxTrafficRouteDict = {}

deltaMaxTrafficAirportFile = "./maxTrafficAirport_delta.csv"
deltaMaxTrafficRouteFile = "./maxTrafficRoutes_delta.csv"
deltaMaxTrafficAirportDict = {}
deltaMaxTrafficRouteDict = {}

unitedMaxTrafficAirportFile = "./maxTrafficAirport_united.csv"
unitedMaxTrafficRouteFile = "./maxTrafficRoutes_united.csv"
unitedMaxTrafficAirportDict = {}
unitedMaxTrafficRouteDict = {}

southwestMaxTrafficAirportFile = "./maxTrafficAirport_southwest.csv"
southwestMaxTrafficRouteFile = "./maxTrafficRoutes_southwest.csv"
southwestMaxTrafficAirportDict = {}
southwestMaxTrafficRouteDict = {}

americanMaxTrafficAirportFile = "./maxTrafficAirport_american.csv"
americanMaxTrafficRouteFile = "./maxTrafficRoutes_american.csv"
americanMaxTrafficAirportDict = {}
americanMaxTrafficRouteDict = {}

spiritMaxTrafficAirportFile = "./maxTrafficAirport_spirit.csv"
spiritMaxTrafficRouteFile = "./maxTrafficRoutes_spirit.csv"
spiritMaxTrafficAirportDict = {}
spiritMaxTrafficRouteDict = {}

frontierMaxTrafficAirportFile = "./maxTrafficAirport_frontier.csv"
frontierMaxTrafficRouteFile = "./maxTrafficRoutes_frontier.csv"
frontierMaxTrafficAirportDict = {}
frontierMaxTrafficRouteDict = {}

class Airport:
  def __init__(self, icao, iata, name, city, state, country, latitude, longitude, airportType):
    self.icao = icao
    self.iata = iata
    self.name = name
    self.city = city
    self.state = state
    self.country = country
    self.latitude = latitude
    self.longitude = longitude
    self.airportType = airportType

class Flight:
	def __init__(self, airline, flightNo, aircraftModel, origin, destination, flightLength, departureDate):
	    self.airline = airline
	    self.flightNo = flightNo
	    self.aircraftModel = aircraftModel
	    self.origin = origin
	    self.destination = destination
	    self.flightLength = flightLength
	    self.departureDate = departureDate

def main():

	# #AIRPORTS
	with open(airportDB) as file: 
		csvReader = csv.reader(file)
		csvReader.next()
		for row in csvReader:

			icaoCode = row[1]
			iataCode = row[13]
			airportName = row[3]
			city = row[10]
			country = row[8]
			latitude = round(float(row[4]), 3)
			longitude = round(float(row[5]), 3)
			airportType = row[2]

			state = row[9]
			if '-' in state:
				state = state.split('-')[1]

			newAirport = Airport(icaoCode, iataCode, airportName, city, state, country, latitude, longitude, airportType)
			
			airportDict[icaoCode] = newAirport

############################

	#FLIGHTS
	print("going through flight data")
	with open(flightsFile) as file: 
		csvReader = csv.reader(file)
		csvReader.next()
		for row in csvReader:
			callsign = row[0]
			airline = callsign[:3]
			flightNo = callsign[3:]

			aircraftModel = row[4]
			origin = row[5]
			destination = row[6]

			flightLength = getFlightLength(row[7], row[8])
			deptDate = getDepartureDate(row[7])

			newFlight = Flight(airline, flightNo, aircraftModel, origin, destination, flightLength, deptDate)

			flightOrder.append(newFlight)


	print("processing flights")
	week = 1
	flightLog[week] = {}
	day = 3
	lastDay = None
	for flight in flightOrder:
		#domestic flights
		if  flight.origin in airportDict and airportDict[flight.origin].country == 'US' and \
			flight.destination in airportDict and airportDict[flight.destination].country == 'US'and \
			isLargeAirport(flight.origin) and isLargeAirport(flight.destination) and \
			not isAirForceBase(flight.origin) and not isAirForceBase(flight.destination):

			flightDate = flight.departureDate
			origin = flight.origin
			dest = flight.destination
			airline = flight.airline

			if origin not in relevantAirports:
				relevantAirports.append(origin)
			if dest not in relevantAirports:
				relevantAirports.append(dest)

			if lastDay == None or lastDay != flightDate:
				day+=1
				# print str(day) + "  "+str(flightDate)
				lastDay = flightDate
				if day%7 == 0:
					week+=1
				# print str(day) + "  "+ str(week) + "  "+str(flightDate)

			#global flight log
			if week not in flightLog:
				flightLog[week] = {}

			if origin not in flightLog[week]:
				flightLog[week][origin] ={}

			if dest not in flightLog[week][origin]:
				flightLog[week][origin][dest] = 1
			else:
				flightLog[week][origin][dest] += 1 


	# 		### AIRLINE SPECIFIC

			if airline == "JBU":
				#Jetblue
				if week not in jbFlightLog:
					jbFlightLog[week] = {}

				if origin not in jbFlightLog[week]:
					jbFlightLog[week][origin] ={}

				if dest not in jbFlightLog[week][origin]:
					jbFlightLog[week][origin][dest] = 1
				else:
					jbFlightLog[week][origin][dest] += 1 

			elif airline == "UAL":
				#United
				if week not in uaFlightLog:
					uaFlightLog[week] = {}

				if origin not in uaFlightLog[week]:
					uaFlightLog[week][origin] ={}

				if dest not in uaFlightLog[week][origin]:
					uaFlightLog[week][origin][dest] = 1
				else:
					uaFlightLog[week][origin][dest] += 1 

			elif airline == "DAL":
				#Delta
				if week not in dlFlightLog:
					dlFlightLog[week] = {}

				if origin not in dlFlightLog[week]:
					dlFlightLog[week][origin] ={}

				if dest not in dlFlightLog[week][origin]:
					dlFlightLog[week][origin][dest] = 1
				else:
					dlFlightLog[week][origin][dest] += 1 

			elif airline == "AAL":
				#American
				if week not in aaFlightLog:
					aaFlightLog[week] = {}

				if origin not in aaFlightLog[week]:
					aaFlightLog[week][origin] ={}

				if dest not in aaFlightLog[week][origin]:
					aaFlightLog[week][origin][dest] = 1
				else:
					aaFlightLog[week][origin][dest] += 1 

			elif airline == "SWA":
				#Southwest
				if week not in swFlightLog:
					swFlightLog[week] = {}

				if origin not in swFlightLog[week]:
					swFlightLog[week][origin] ={}

				if dest not in swFlightLog[week][origin]:
					swFlightLog[week][origin][dest] = 1
				else:
					swFlightLog[week][origin][dest] += 1 

			elif airline == "NKS":
				#Spirit
				if week not in spFlightLog:
					spFlightLog[week] = {}

				if origin not in spFlightLog[week]:
					spFlightLog[week][origin] ={}

				if dest not in spFlightLog[week][origin]:
					spFlightLog[week][origin][dest] = 1
				else:
					spFlightLog[week][origin][dest] += 1 

			elif airline == "FFT":
				#Frontier
				if week not in frFlightLog:
					frFlightLog[week] = {}

				if origin not in frFlightLog[week]:
					frFlightLog[week][origin] ={}

				if dest not in frFlightLog[week][origin]:
					frFlightLog[week][origin][dest] = 1
				else:
					frFlightLog[week][origin][dest] += 1 
	# flightLog.pop(0)


	# ##### MAX TRAFFIC
	# #for airports
	for icao in sorted(airportDict):
		maxTrafficAirportDict[icao] = findAirportMaxTraffic(icao, flightLog);
		jetBlueMaxTrafficAirportDict[icao] = findAirportMaxTraffic(icao, jbFlightLog);
		deltaMaxTrafficAirportDict[icao] = findAirportMaxTraffic(icao, dlFlightLog);
		southwestMaxTrafficAirportDict[icao] = findAirportMaxTraffic(icao, swFlightLog);
		unitedMaxTrafficAirportDict[icao] = findAirportMaxTraffic(icao, uaFlightLog);
		americanMaxTrafficAirportDict[icao] = findAirportMaxTraffic(icao, aaFlightLog);
		spiritMaxTrafficAirportDict[icao] = findAirportMaxTraffic(icao, spFlightLog);
		frontierMaxTrafficAirportDict[icao] = findAirportMaxTraffic(icao, frFlightLog);


	# #for routes
	for origin in relevantAirports:
		for dest in relevantAirports:
			originDestPairMax = 0
			originDestPairMax_delta = 0
			originDestPairMax_jetblue = 0
			originDestPairMax_united = 0
			originDestPairMax_southwest = 0
			originDestPairMax_american = 0
			originDestPairMax_spirit = 0
			originDestPairMax_frontier = 0

			for week in flightLog:
				if origin in flightLog[week] and dest in flightLog[week][origin] and \
				flightLog[week][origin][dest] > originDestPairMax:

					originDestPairMax = flightLog[week][origin][dest]

			for week in uaFlightLog:
				if origin in uaFlightLog[week] and dest in uaFlightLog[week][origin] and \
				uaFlightLog[week][origin][dest] > originDestPairMax_united:

					originDestPairMax_united = uaFlightLog[week][origin][dest]

			for week in dlFlightLog:
				if origin in dlFlightLog[week] and dest in dlFlightLog[week][origin] and \
				dlFlightLog[week][origin][dest] > originDestPairMax_delta:

					originDestPairMax_delta = dlFlightLog[week][origin][dest]

			for week in jbFlightLog:
				if origin in jbFlightLog[week] and dest in jbFlightLog[week][origin] and \
				jbFlightLog[week][origin][dest] > originDestPairMax_jetblue:

					originDestPairMax_jetblue = jbFlightLog[week][origin][dest]

			for week in aaFlightLog:
				if origin in aaFlightLog[week] and dest in aaFlightLog[week][origin] and \
				aaFlightLog[week][origin][dest] > originDestPairMax_american:

					originDestPairMax_american = aaFlightLog[week][origin][dest]

			for week in swFlightLog:
				if origin in swFlightLog[week] and dest in swFlightLog[week][origin] and \
				swFlightLog[week][origin][dest] > originDestPairMax_southwest:

					originDestPairMax_southwest = swFlightLog[week][origin][dest]

			for week in spFlightLog:
				if origin in spFlightLog[week] and dest in spFlightLog[week][origin] and \
				spFlightLog[week][origin][dest] > originDestPairMax_spirit:

					originDestPairMax_spirit = spFlightLog[week][origin][dest]

			for week in frFlightLog:
				if origin in frFlightLog[week] and dest in frFlightLog[week][origin] and \
				frFlightLog[week][origin][dest] > originDestPairMax_frontier:

					originDestPairMax_frontier = frFlightLog[week][origin][dest]


			maxTrafficRouteDict[(origin, dest)] = originDestPairMax
			unitedMaxTrafficRouteDict[(origin, dest)] = originDestPairMax_united
			jetBlueMaxTrafficRouteDict[(origin, dest)] = originDestPairMax_jetblue
			deltaMaxTrafficRouteDict[(origin, dest)] = originDestPairMax_delta
			americanMaxTrafficRouteDict[(origin, dest)] = originDestPairMax_american
			southwestMaxTrafficRouteDict[(origin, dest)] = originDestPairMax_southwest
			spiritMaxTrafficRouteDict[(origin, dest)] = originDestPairMax_spirit
			frontierMaxTrafficRouteDict[(origin, dest)] = originDestPairMax_frontier


def isLargeAirport(icaoCode):
	return airportDict[icaoCode].airportType == 'large_airport'

def isAirForceBase(icaoCode):
	return "Air Force" in airportDict[icaoCode].name

def findAirportMaxTraffic(icaoCode, specificDict):
	weekMaximum = 0
	for week in specificDict:
		airportWeekSum = 0
		for origin in specificDict[week]:
			if origin == icaoCode:
				for dest in specificDict[week][origin]:
					airportWeekSum += specificDict[week][origin][dest]
			elif icaoCode in specificDict[week][origin]:
				airportWeekSum += specificDict[week][origin][icaoCode]
		if airportWeekSum > weekMaximum:
			weekMaximum = airportWeekSum
	return weekMaximum

def writeCleanedFiles():
	#airports
	print("WRITING AIRPORT FILE")
	with open(airportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','name','city','state','country','lat','long','airportType'])
		for icao in sorted(airportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([airport.icao, airport.name, airport.city, airport.state, airport.country, airport.latitude, airport.longitude, airport.airportType])

	#flights
	# print("WRITING FLIGHT FILE")
	# file = open(newFlightsFile, 'w')
	# csvWriter = csv.writer(file)
	# count = 0
	# for flight in flightOrder:
	# 	if count == 1521762:
	# 		file.close()
	# 		file = open("./allFlights_feb.csv", 'w')
	# 		csvWriter = csv.writer(file)
	# 	elif count == 2928001:
	# 		file.close()
	# 		file = open("./allFlights_mar.csv", 'w')
	# 		csvWriter = csv.writer(file)

	# 	#only domestic flights
	# 	if flight.origin in airportDict and airportDict[flight.origin].country == 'US' and flight.destination in airportDict and airportDict[flight.destination].country == 'US':
	# 		csvWriter.writerow([flight.airline, flight.flightNo, flight.aircraftModel, flight.origin, flight.destination, int(flight.flightLength[0]), int(flight.flightLength[1]), int(flight.departureDate[0]), int(flight.departureDate[1]), int(flight.departureDate[2])])

	# 	count +=1 

	# file.close()

	#processed flights
	with open(processedUSFlightsFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['week','startCode','destCode','amount'])
		for week in sorted(flightLog):
			for startAirport in sorted(flightLog[week]):
				for endAirport in sorted(flightLog[week][startAirport]):
					amt = flightLog[week][startAirport][endAirport]
					csvWriter.writerow([week,startAirport,endAirport,amt])

	with open(jetblueFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['week','startCode','destCode','amount'])
		for week in sorted(jbFlightLog):
			for startAirport in sorted(jbFlightLog[week]):
				for endAirport in sorted(jbFlightLog[week][startAirport]):
					amt = jbFlightLog[week][startAirport][endAirport]
					csvWriter.writerow([week,startAirport,endAirport,amt])

	with open(unitedFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['week','startCode','destCode','amount'])
		for week in sorted(uaFlightLog):
			for startAirport in sorted(uaFlightLog[week]):
				for endAirport in sorted(uaFlightLog[week][startAirport]):
					amt = uaFlightLog[week][startAirport][endAirport]
					csvWriter.writerow([week,startAirport,endAirport,amt])

	with open(southwestFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['week','startCode','destCode','amount'])
		for week in sorted(swFlightLog):
			for startAirport in sorted(swFlightLog[week]):
				for endAirport in sorted(swFlightLog[week][startAirport]):
					amt = swFlightLog[week][startAirport][endAirport]
					csvWriter.writerow([week,startAirport,endAirport,amt])

	with open(deltaFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['week','startCode','destCode','amount'])
		for week in sorted(dlFlightLog):
			for startAirport in sorted(dlFlightLog[week]):
				for endAirport in sorted(dlFlightLog[week][startAirport]):
					amt = dlFlightLog[week][startAirport][endAirport]
					csvWriter.writerow([week,startAirport,endAirport,amt])

	with open(americanFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['week','startCode','destCode','amount'])
		for week in sorted(aaFlightLog):
			for startAirport in sorted(aaFlightLog[week]):
				for endAirport in sorted(aaFlightLog[week][startAirport]):
					amt = aaFlightLog[week][startAirport][endAirport]
					csvWriter.writerow([week,startAirport,endAirport,amt])

	with open(spiritFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['week','startCode','destCode','amount'])
		for week in sorted(spFlightLog):
			for startAirport in sorted(spFlightLog[week]):
				for endAirport in sorted(spFlightLog[week][startAirport]):
					amt = spFlightLog[week][startAirport][endAirport]
					csvWriter.writerow([week,startAirport,endAirport,amt])

	with open(frontierFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['week','startCode','destCode','amount'])
		for week in sorted(frFlightLog):
			for startAirport in sorted(frFlightLog[week]):
				for endAirport in sorted(frFlightLog[week][startAirport]):
					amt = frFlightLog[week][startAirport][endAirport]
					csvWriter.writerow([week,startAirport,endAirport,amt])


	#max traffic airport
	with open(maxTrafficAirportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','maxTraffic'])
		for icao in sorted(maxTrafficAirportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([icao,maxTrafficAirportDict[icao]])

	with open(jetBlueMaxTrafficAirportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','maxTraffic'])
		for icao in sorted(jetBlueMaxTrafficAirportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([icao,jetBlueMaxTrafficAirportDict[icao]])

	with open(deltaMaxTrafficAirportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','maxTraffic'])
		for icao in sorted(deltaMaxTrafficAirportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([icao,deltaMaxTrafficAirportDict[icao]])
	
	with open(unitedMaxTrafficAirportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','maxTraffic'])
		for icao in sorted(unitedMaxTrafficAirportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([icao,unitedMaxTrafficAirportDict[icao]])

	with open(southwestMaxTrafficAirportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','maxTraffic'])
		for icao in sorted(southwestMaxTrafficAirportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([icao,southwestMaxTrafficAirportDict[icao]])

	with open(americanMaxTrafficAirportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','maxTraffic'])
		for icao in sorted(americanMaxTrafficAirportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([icao,americanMaxTrafficAirportDict[icao]])

	with open(spiritMaxTrafficAirportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','maxTraffic'])
		for icao in sorted(spiritMaxTrafficAirportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([icao,spiritMaxTrafficAirportDict[icao]])

	with open(frontierMaxTrafficAirportFile, 'w') as file:
		csvWriter = csv.writer(file)
		csvWriter.writerow(['icao','maxTraffic'])
		for icao in sorted(frontierMaxTrafficAirportDict):
			airport = airportDict[icao]
			if airport.country == "US" and airport.airportType == "large_airport" and not isAirForceBase(airport.icao):
				csvWriter.writerow([icao,frontierMaxTrafficAirportDict[icao]])

	#max traffic routes
	with open(maxTrafficRouteFile, 'w') as file: 
		csvWriter = csv.writer(file)
		csvWriter.writerow(["routeStart", "routeEnd", "maxTraffic"])
		for pair in sorted(maxTrafficRouteDict): 
			csvWriter.writerow([pair[0], pair[1],maxTrafficRouteDict[pair]])

	with open(unitedMaxTrafficRouteFile, 'w') as file: 
		csvWriter = csv.writer(file)
		csvWriter.writerow(["routeStart", "routeEnd", "maxTraffic"])
		for pair in sorted(unitedMaxTrafficRouteDict): 
			csvWriter.writerow([pair[0], pair[1],unitedMaxTrafficRouteDict[pair]])

	with open(jetBlueMaxTrafficRouteFile, 'w') as file: 
		csvWriter = csv.writer(file)
		csvWriter.writerow(["routeStart", "routeEnd", "maxTraffic"])
		for pair in sorted(jetBlueMaxTrafficRouteDict): 
			csvWriter.writerow([pair[0], pair[1],jetBlueMaxTrafficRouteDict[pair]])

	with open(southwestMaxTrafficRouteFile, 'w') as file: 
		csvWriter = csv.writer(file)
		csvWriter.writerow(["routeStart", "routeEnd", "maxTraffic"])
		for pair in sorted(southwestMaxTrafficRouteDict): 
			csvWriter.writerow([pair[0], pair[1],southwestMaxTrafficRouteDict[pair]])

	with open(americanMaxTrafficRouteFile, 'w') as file: 
		csvWriter = csv.writer(file)
		csvWriter.writerow(["routeStart", "routeEnd", "maxTraffic"])
		for pair in sorted(americanMaxTrafficRouteDict): 
			csvWriter.writerow([pair[0], pair[1],americanMaxTrafficRouteDict[pair]])

	with open(deltaMaxTrafficRouteFile, 'w') as file: 
		csvWriter = csv.writer(file)
		csvWriter.writerow(["routeStart", "routeEnd", "maxTraffic"])
		for pair in sorted(deltaMaxTrafficRouteDict): 
			csvWriter.writerow([pair[0], pair[1],deltaMaxTrafficRouteDict[pair]])

	with open(spiritMaxTrafficRouteFile, 'w') as file: 
		csvWriter = csv.writer(file)
		csvWriter.writerow(["routeStart", "routeEnd", "maxTraffic"])
		for pair in sorted(spiritMaxTrafficRouteDict): 
			csvWriter.writerow([pair[0], pair[1],spiritMaxTrafficRouteDict[pair]])

	with open(frontierMaxTrafficRouteFile, 'w') as file: 
		csvWriter = csv.writer(file)
		csvWriter.writerow(["routeStart", "routeEnd", "maxTraffic"])
		for pair in sorted(frontierMaxTrafficRouteDict): 
			csvWriter.writerow([pair[0], pair[1],frontierMaxTrafficRouteDict[pair]])


def getDepartureDate(a):
	ymd = a.split(' ')[0].split('-')
	year = int(ymd[0])
	month = int(ymd[1])
	day = int(ymd[2])

	return (day, month, year)


def getFlightLength(a, b):
	month_length = {1: 31, 2: 28, 3:31, 4:30, 5:31, 6:30, 7:31, 8:31, 9:30, 10:31, 11:30, 12:31}

	#date 
	departDate = a.split(' ')[0].split('-')
	arrivalDate = b.split(' ')[0].split('-')

	departYear = int(departDate[0])
	departMonth = int(departDate[1])
	departDay = int(departDate[2])

	arrivalYear = int(arrivalDate[0])
	arrivalMonth = int(arrivalDate[1])
	arrivalDay = int(arrivalDate[2])


	#time 
	departTime = a.split(' ')[1].split(":")
	arrivalTime = b.split(' ')[1].split(":")

	departHour = int(departTime[0])
	departMinute = int(departTime[1])

	arrivalHour = int(arrivalTime[0])
	arrivalMinute = int(arrivalTime[1])

	#leap year
	if departYear%4 == 0:
		month_length[2] = 29

	deltaMin = arrivalMinute - departMinute
	deltaHour = arrivalHour - departHour
	deltaDay = arrivalDay - departDay
	deltaMonth = arrivalMonth - departMonth
	deltaYear = arrivalYear - departYear

	if deltaMin < 0:
		deltaHour -=1
	if deltaHour < 0:
		deltaDay -=1
	if deltaDay < 0:
		deltaMonth -=1

	deltaMonth = deltaMonth%12
	deltaDay = deltaDay%month_length[departMonth]
	deltaHour = deltaHour%24 + deltaDay*24
	deltaMin = deltaMin%60

	return (deltaHour, deltaMin)


###tests

def flightLength1():
	a = "2020-01-02 03:04:05+00:00"
	b = "2020-01-02 05:11:13+00:00"

	assert getFlightLength(a,b) == (2,7)


def flightLength2():
	a = "2020-01-02 03:57:05+00:00"
	b = "2020-01-02 16:03:13+00:00"

	assert getFlightLength(a,b) == (12,6)

def flightLength_24hr():
	a = "2020-01-02 03:57:05+00:00"
	b = "2020-01-03 06:03:13+00:00"

	assert getFlightLength(a,b) == (26,6)

def flightLength_nye():
	a = "2019-12-31 22:57:05+00:00"
	b = "2020-01-01 06:25:13+00:00"

	assert getFlightLength(a,b) == (7,28)

def flightLength_februaryLeap_2day():
	a = "2020-01-31 23:57:05+00:00"
	b = "2020-02-02 03:30:13+00:00"

	assert getFlightLength(a,b) == (27,33)

def covid_dist():
	print('starting COVID TEST')
	numEJan = 0
	numLJan = 0
	numEFeb = 0
	numLFeb = 0
	numEMar = 0
	numLMar = 0 
	for flight in flightOrder:
		date = flight.departureDate
		if date[1] == 1:
			if date[0] < 16:
				numEJan +=1
			else:
				numLJan +=1
		elif date[1] == 2:
			if date[0] < 15:
				numEFeb +=1
			else:
				numLFeb +=1
		elif date[1] == 3:
			if date[0] < 16:
				numEMar +=1
			else:
				numLMar +=1

	print numEJan
	print numLJan
	print numEFeb
	print numLFeb
	print numEMar
	print numLMar

def testAFB():
	print "SHAW AFB"
	print isLargeAirport('KSSC')
	print "BOSTON"
	print isAirForceBase("KBOS")

def isDomestic(flight):
	return flight.origin in airportDict and airportDict[flight.origin].country == 'US' and flight.destination in airportDict and airportDict[flight.destination].country == 'US'

totalFlightLog = {}
def printTotalWeeklyFlights():

	week = 1
	totalFlightLog[week] = 0
	day = 0
	lastDay = None
	for flight in flightOrder:

		flightDate = flight.departureDate
		origin = flight.origin
		dest = flight.destination
		airline = flight.airline

		if isDomestic(flight) and isLargeAirport(origin) and isLargeAirport(dest):

			if lastDay == None or lastDay != flightDate:
				day+=1
				lastDay = flightDate
				if day%7 == 0:
					week+=1

			if week not in totalFlightLog:
				totalFlightLog[week] = 0

			if origin != dest:
				totalFlightLog[week]+=1

	print totalFlightLog

def printLeadingAirlines(specificWeek):
	
	week = 1
	airlineDict = {}
	day = 0
	lastDay = None
	for flight in flightOrder:

		flightDate = flight.departureDate
		origin = flight.origin
		dest = flight.destination
		airline = flight.airline


		if lastDay == None or lastDay != flightDate:
			day+=1
			lastDay = flightDate
			if day%7 == 0:
				week+=1

		if week == specificWeek:

			if airline not in airlineDict:
				airlineDict[airline] = 0
			else:
				airlineDict[airline] += 1

	print getTopTen(airlineDict)

def getTopTen(d):
	newDict = {}

	numKeySearched = 0
	tenthMinVal = 100000000000
	tenthMinKey = None
	for key in d:
		if numKeySearched < 10:
			newDict[key] = d[key]
			tenthMinKey = minOfDict(newDict)
			tenthMinVal = newDict[tenthMinKey]
			numKeySearched +=1
		else:
			if d[key] > tenthMinVal:
				newDict.pop(tenthMinKey)
				newDict[key] = d[key]
				tenthMinKey = minOfDict(newDict)
				tenthMinVal = newDict[tenthMinKey]
	return newDict

def minOfDict(d):
	minVal = 1000000000
	minKey = None
	for k in d:
		if d[k] < minVal:
			minKey = k
			minVal = d[k]
	return minKey


def distanceBetweenTwoPoints(loc1, loc2):
	R = 6373.0

	lat1 = math.radians(loc1[0])
	lon1 = math.radians(loc1[1])
	lat2 = math.radians(loc2[0])
	lon2 = math.radians(loc2[1])

	dlon = lon2 - lon1
	dlat = lat2 - lat1

	a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
	c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
	distance = R * c

	return distance*0.621 #in kms


def getMostPopularRoutes():
	top3Routes = {}
	minRoute = None
	minRouteVal = 10000000000000
	for route in maxTrafficRouteDict:
		if len(top3Routes) < 10:
			top3Routes[route] = maxTrafficRouteDict[route]
			if maxTrafficRouteDict[route] < minRouteVal:
				minRouteVal = maxTrafficRouteDict[route]
				minRoute = route
		else:
			if maxTrafficRouteDict[route] > minRouteVal:
				top3Routes.pop(minRoute)
				top3Routes[route] = maxTrafficRouteDict[route]
				minRoute = minOfDict(top3Routes)
				minRouteVal = top3Routes[minRoute]
	print combineKeys(top3Routes)
	return combineKeys(top3Routes)

def combineKeys(d):
	removals = []
	for k in d:
		start = k[0]
		end = k[1]
		if (end, start) in d:
			d[k] += d[(end, start)]
			if (start, end) not in removals:
				removals.append((end,start))
	for r in removals:
		d.pop(r)
	return d

def percentOfFlightsOverXMiles(specificWeek, miles):
	totalFlights = 0
	flightsOverThreshold = 0
	week = 1
	airlineDict = {}
	day = 0
	lastDay = None

	for flight in flightOrder:

		flightDate = flight.departureDate
		origin = flight.origin
		dest = flight.destination
		airline = flight.airline

		if lastDay == None or lastDay != flightDate:
			day+=1
			lastDay = flightDate
			if day%7 == 0:
				week+=1

		if week == specificWeek and isDomestic(flight) and origin != dest:
			totalFlights +=1

			airport1 = airportDict[origin]
			airport2 = airportDict[dest]
			if distanceBetweenTwoPoints([airport1.latitude, airport1.longitude], [airport2.latitude, airport2.longitude]) > miles:
				flightsOverThreshold +=1

	print "PERCENT OVER " + str(miles) + " MILES:"
	print str(100*round(flightsOverThreshold/float(totalFlights), 3)) + " %"

import operator
def getMaxFlightsInWeek(specificWeek):

	top3Routes = {}
	minRoute = None
	minRouteVal = 100000000000
	for origin in flightLog[specificWeek]:
		for dest in flightLog[specificWeek][origin]:
			if len(top3Routes) < 10:
				top3Routes[(origin, dest)] = flightLog[specificWeek][origin][dest]
				if flightLog[specificWeek][origin][dest] < minRouteVal: 
					minRoute = (origin, dest)
					minRouteVal = flightLog[specificWeek][origin][dest]
			else:
				if flightLog[specificWeek][origin][dest] > minRouteVal:
					top3Routes.pop(minOfDict(top3Routes))
					top3Routes[(origin, dest)] = flightLog[specificWeek][origin][dest]
					minRoute = minOfDict(top3Routes)
					minRouteVal = top3Routes[minRoute]
	print sorted(combineKeys(top3Routes).items(), key=operator.itemgetter(1))
	return sorted(combineKeys(top3Routes).items(), key=operator.itemgetter(1))


if __name__ == "__main__":
	main()
	# testAFB()
	writeCleanedFiles()
	# flightLength1()
	# flightLength2()
	# flightLength_24hr()
	# flightLength_nye()
	# flightLength_februaryLeap_2day()
	# covid_dist()
	# print("All tests passed")
	# printTotalWeeklyFlights()
	# printLeadingAirlines(8)
	# printLeadingAirlines(12)
	# printLeadingAirlines(13)
	# printLeadingAirlines(14)
	# getMostPopularRoutes()
	# percentOfFlightsOverXMiles(8, 100)
	# percentOfFlightsOverXMiles(12, 100)
	# percentOfFlightsOverXMiles(13, 100)
	# percentOfFlightsOverXMiles(14, 100)
	getMaxFlightsInWeek(8)
	getMaxFlightsInWeek(10)
	getMaxFlightsInWeek(12)
	getMaxFlightsInWeek(14)
	getMaxFlightsInWeek(16)
	getMaxFlightsInWeek(17)
	# print "DNV PHX w8:    " + str(flightLog[8]['KDEN']['KPHX']) + " + " + str(flightLog[8]['KPHX']['KDEN'])
	# print "SEA PDX w8:    " + str(flightLog[8]['KSEA']['KPDX']) + " + " + str(flightLog[8]['KPDX']['KSEA'])
	# print "LAX SFO w8:    " + str(flightLog[8]['KLAX']['KSFO']) + " + " + str(flightLog[8]['KSFO']['KLAX'])
	# print "LAX SJC w14:    " + str(flightLog[8]['KLAX']['KSJC']) + " + " + str(flightLog[8]['KSJC']['KLAX'])
	# print "DNV PHX w14:    " + str(flightLog[14]['KDEN']['KPHX']) + " + " + str(flightLog[14]['KPHX']['KDEN'])
	# print "SEA PDX w14:    " + str(flightLog[14]['KSEA']['KPDX']) + " + " + str(flightLog[14]['KPDX']['KSEA'])
	# print "LAX SFO w14:    " + str(flightLog[14]['KLAX']['KSFO']) + " + " + str(flightLog[14]['KSFO']['KLAX'])
	# print "LAX SJC w14:    " + str(flightLog[14]['KLAX']['KSJC']) + " + " + str(flightLog[14]['KSJC']['KLAX'])










