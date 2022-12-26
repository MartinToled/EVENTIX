var page = 0;

function getCoords(object){
  console.log(object);
    let Locs = [];
    let coordinates = [];
    let events = object._embedded.events;

    // Iterate through events
    events.forEach(e => {
        let venues = e._embedded.venues;

        // Iterates through venues
        venues.forEach(venue => {
            let coordinate = {
                lat: venue.location.latitude,
                lng: venue.location.longitude
            }
            const coords = coordinate.results;

            let Loc = {
              name: events[0].name,
              city: venue.city.name,
              ven: venue.name,
              address: venue.address.line1,
              timing: events[0].dates.start.dateTime
            }

            let markerOptions = {
              position: new google.maps.LatLng(coordinate.lat, coordinate.lng),
              content: new google.maps.InfoWindow(Loc.city),
              title:  "Click for Event Location"
            }

            let map = new google.maps.Map(document.getElementById("map"), {
              zoom: 13,
              center: new google.maps.LatLng(coordinate.lat, coordinate.lng),
            });

            let marker = new google.maps.Marker(markerOptions);
            marker.setMap(map);
            for (venue in coords){
                let marker = new google.maps.Marker({
                  position: coordinate,
                  map: map,
              })

            }

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

  $('#events-panel').show();
  $('#attraction-panel').hide();

  if (page < 0) {
    page = 0;
    return;
  }
  if (page > 0) {
    if (page > getEvents.json.page.totalPages-1) {
      page=0;
    }
  }
  
  $.ajax({
    type:"GET",
    url:"https://app.ticketmaster.com/discovery/v2/events?apikey=A2GDug9iXaR78A1N9rHla8rSwNED8lFF&classificationName=sport&sort=date,asc&locale=*&size=1&countryCode=AU&page="+page,
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

function showEvents(json) {
    getCoords(json)
  var items = $('#events .list-group-item');
  items.hide();
  var events = json._embedded.events;
  var item = items.first();
  for (var i=0;i<events.length;i++) {
    item.children('.list-group-item-heading').text(events[i].name);
    item.children('.list-group-item-text').text(events[i].dates.start.localDate);
    try {
      item.children('.venue').text(events[i]._embedded.venues[0].name + " in " + events[i]._embedded.venues[0].city.name);
    } catch (err) {
      console.log(err);
    }
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

$('#prev').click(function() {
  getEvents(--page);
});

$('#next').click(function() {
  getEvents(++page);
});

function getAttraction(id) {
  $.ajax({
    type:"GET",
    url:"https://app.ticketmaster.com/discovery/v2/attractions/"+id+".json?apikey=A2GDug9iXaR78A1N9rHla8rSwNED8lFF&locale=*&countryCode=AU",
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

function showAttraction(json) {
  $('#attraction-panel').show();
  
  $('#attraction-panel').click(function() {
    getEvents(page);
  });
  
  $('#attraction .list-group-item-heading').first().text(json.name);
  $('#attraction img').first().attr('src',json.images[2].url);
  $('#classification').text(json.classifications[0].segment.name + " - " + json.classifications[0].genre.name + " - " + json.classifications[0].subGenre.name);
}

getEvents(page);