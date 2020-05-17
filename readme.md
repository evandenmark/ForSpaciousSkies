#For Spacious Skies

This is a scrolly-telling narrative designed and developed by Evan Denmark for MIT's 6.894 Data Visualization class. Data is provided by OpenSky Network (www.opensky-network.org) and OurAirports (www.ourairports.com). 

This visualization goes through recently published air traffic data to determine how COVID-19 has affected the airline industry. 

There are three major effected areas to consider: airports, routes, and airlines. 

For the entire visualization, I group flights by week. This way, we avoid bias based on different days of the week. Additionally, because April ends on a Thursday, each "week" begins on a Friday and ends on a Thursday. This way, we can effectively compare each week with little bias. 

In part 1, airports are represented as bars, similar to the NYT visualization (https://www.nytimes.com/interactive/2020/04/06/us/coronavirus-deaths-united-states.html). In order to visually understand where the bar starts, I put a small base bar at the bottom. 

In part 2, we look at the top routes. Routes are shown as point to point paths with their opacity and stroke-weight determined by the number of flights. Although color and opacity comparision is a poor measure of accurate comparision, the purpose of doing this to highlight the popular flights in aggregate. Viewers are not meant to look at any single route, but only the routes together to see the major routes and airports. 


In part 3, we look at how airlines are operating compared to their "normal" traffic. Here I define normal as the 2020 weekly maximum, which for most airlines came the end of February (beginning of spring break). In any given pre-covid week, an airline usually operates within a few percentage points of this 2020 maximum. In this part, I seek to highlight how different airlines' behavior varies over time. Initially, I wanted to put each airline as a small multiple, but found it more effective to put them all on the same graph - it was easier to compare their behaviors. 

Because this is a scrolly-visual, my audience is the general public and therefore, I sought to make each visualization aestheic and entertaining as well as informative. 

