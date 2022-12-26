var page = 0; //contains the page value

//created a function to get the coordiantes, and information about the the venue and timings
function getCoords(object){
    //created an array for the location and information of the event
    let Locs = [];
    let coordinates = [];
    let events = object._embedded.events;

    // Iterate through events
    events.forEach(e => {
        let venues = e._embedded.venues;

        // Iterates through venues latitude and longitude
        venues.forEach(venue => {
            let coordinate = {
                lat: venue.location.latitude,
                lng: venue.location.longitude
            }
            const coords = coordinate.results;
             // Iterates through venues name, city, timing, etc.
            let Loc = {
              name: events[0].name,
              city: venue.city.name,
              ven: venue.name,
              address: venue.address.line1,
              timing: events[0].dates.start.dateTime
            }
            /*---------------------------------------------------------*/
            
            // USING GOOGLE MAPS API ↓

           // Marker data/content
            let markerOptions = {
              position: new google.maps.LatLng(coordinate.lat, coordinate.lng),
              title:  "Click for Event Location" // A text that will show up when marker is hovered upon the marker
            }
            // used google maps api and displayed it on the webpage
            let map = new google.maps.Map(document.getElementById("map"), {
              zoom: 13, // made the view of the map closer
              center: new google.maps.LatLng(coordinate.lat, coordinate.lng), // makes the coordinates of the event the center of the map
            });
            // Creates a marker using the latitude and longitude of the event venue
            let marker = new google.maps.Marker(markerOptions);
            marker.setMap(map);
            for (venue in coords){
                let marker = new google.maps.Marker({
                  position: coordinate,
                  map: map,
              })

            }
            // When marker is clicked, the data/content will be shown in a popup box
            let infowindow = new google.maps.InfoWindow({
              content: Loc.name + "<br><br>" + Loc.city + "<br>" + Loc.address + "<br>" + Loc.ven + "<br><br>" + "Date & Time: <br>" + Loc.timing
            })
            marker.addListener("click", () => {
              infowindow.open(map, marker);
            });
            
            Locs.push(Loc);
            coordinates.push(coordinate);

        })
    });
    console.log(Locs)
    console.log(coordinates)
  }

window.getCoords = getCoords;

function getEvents(page) {

  $('#events-panel').show(); //shows the event panel contents
  $('#attraction-panel').hide(); //hides the event panel contents until clicked

  if (page < 0) {
    page = 0;
    return;
  }
  if (page > 0) {
    if (page > getEvents.json.page.totalPages-1) {
      page=0;
    }
  }
  
  // Gets events information from Ticketmaster API
  $.ajax({
    type:"GET",
    url:"https://app.ticketmaster.com/discovery/v2/events?apikey=A2GDug9iXaR78A1N9rHla8rSwNED8lFF&locale=*&size=1&sort=date,asc&countryCode=US&classificationName=pop,%20r&b,%20hip-hop,%20rock,%20jazz,%20country&page="+page,
    async:true,
    dataType: "json",
    success: function(json) {
          getEvents.json = json;
  			  showEvents(json);
  		   },
    error: function(xhr, status, err) {
  			  console.log(err);
  		   }
  });
}
// Function to show the events information from Ticketmaster's API
function showEvents(json) {
  getCoords(json) // calls the getCoords function
  var items = $('#events .list-group-item'); //stores items into events id and list-group-item class
  items.hide(); // hides item
  var events = json._embedded.events; //creates a shortcut for the dircetory of the needed information
  var item = items.first();
  for (var i=0;i<events.length;i++) {
    item.children('.list-group-item-heading').text(events[i].name);
    item.children('.list-group-item-text').text(events[i].dates.start.localDate);
    try {
      item.children('.venue').text(events[i]._embedded.venues[0].name + " in " + events[i]._embedded.venues[0].city.name);
    } catch (err) {
      console.log(err);
    }
    // shows items on click
    item.show();
    item.off("click");
    item.click(events[i], function(eventObject) {
      console.log(eventObject.data);
      try {
        getAttraction(eventObject.data._embedded.attractions[0].id);
      } catch (err) {
      console.log(err);
      }
    });
    item=item.next();
  }
}

// Next and Previous page buttons
$('#prev').click(function() {
  getEvents(--page);
});

$('#next').click(function() {
  getEvents(++page);
});

// Gets the attraction detail of the event from Ticketmaster API
function getAttraction(id) {
  $.ajax({
    type:"GET",
    url:"https://app.ticketmaster.com/discovery/v2/attractions/"+id+".json?apikey=A2GDug9iXaR78A1N9rHla8rSwNED8lFF&locale=*&countryCode=US",
    async:true,
    dataType: "json",
    success: function(json) {
          showAttraction(json);
  		   },
    error: function(xhr, status, err) {
  			  console.log(err);
  		   }
  });
}

// Shows attraction on click of the event
function showAttraction(json) {
  $('#attraction-panel').show();
  
  $('#attraction-panel').click(function() {
    getEvents(page);
  });
  
  // The details thatt will be show in when the event is clicked
  $('#attraction .list-group-item-heading').first().text(json.name);
  $('#attraction img').first().attr('src',json.images[2].url);
  $('#classification').text(json.classifications[0].segment.name + " - " + json.classifications[0].genre.name + " - " + json.classifications[0].subGenre.name);
}

getEvents(page);