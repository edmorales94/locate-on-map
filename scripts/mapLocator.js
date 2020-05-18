let map;//Will be initialized by Google Maps
let markers = [];
let infoWindow;//Will be initialized by Google Maps
let locations = [];//Will get initialized depending on the services the user needs
let serviceButtons = document.querySelectorAll('div.button');
let defaultMap = true;//This helps us know when to show the locationsLists

function initMap() {
    let Manhattan = {lat: 40.730610, lng: -73.935242};
    map = new google.maps.Map(document.getElementById('map'), {
        center: Manhattan,
        zoom: 12,
        mapTypeId: 'roadmap'
        //mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}
    });
    infoWindow = new google.maps.InfoWindow();
    showUserPosition(infoWindow);//asks the user's location and shows it in the map
    buttonsListener();
    searchDeli();//shows the locationsLists and search bar
}

function clearLocations() {
    infoWindow.close();//close all windows if they're open
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);//Delete the markers' info from Google maps
    }
    markers.length = 0;//reset the locationsLists
}

function displayDeli(locations) {
    let locationHtml = '';//We'll add html content here
    locations.forEach((location, index)=>{//get each location from the list
        locationHtml += `
        <div class="store-container">
                <div id="stores-container-background">
                    <div class="store-info">
                        <div class="address">
                        <span>${location.formatted_address}</span>
                    </div>
                        <div class="store-phone-number"></div><!--Need to find phone numbers-->
                    </div>
                    <div class="store-number-container">
                        <div class="store-number">${index+1}</div><!--The number that's next to the location on the list-->
                    </div>
                </div>
            </div>`
    });
    document.getElementById('locations-list').innerHTML = locationHtml;//Add the elements to the page
}

function createMarker(latLng, name, addr, index){ //This is used in the showLocationsMarkers function
    let html = "<b>" + name + "</b> <br/>" + addr;//displays the Name and address of the location
    let marker = new google.maps.Marker({//marker for the location
        map: map,
        position: latLng,
        label: `${index+1}`
    });

    google.maps.event.addListener(marker, 'click', function() {//when the marker if clicked
        infoWindow.setContent(html);//set the info on the marker
        infoWindow.open(map, marker);//open the info
    });
    markers.push(marker);//add the marker to be shown
}

function showLocationsMarkers(locations) {
    let bounds = new google.maps.LatLngBounds();//We'll zoom depending on the locationsLists

    //if the locationsLists list is not empty
    if (locations.length!==1){
        locations.forEach((location, index)=>{//get each location
            //get its coordinates and info
            let latlng = new google.maps.LatLng(
                location.geometry.location.lat,
                location.geometry.location.lng);
            let name = location.name;
            let address = location.formatted_address;
            createMarker(latlng, name, address, index);
            bounds.extend(latlng);//increase the windows bound the more place the have
        });
        map.fitBounds(bounds);//zoom in/out depending on the number of places
    }

    //if only one place was found with the requested zip code
    else if (locations.length===1 && !defaultMap){
        //get all the info
        let latlng = new google.maps.LatLng(
            locations[0].geometry.location.lat,
                locations[0].geometry.location.lng);
        let name = locations[0].name;
        let address = locations[0].formatted_address;
        createMarker(latlng, name, address, 0);
        bounds.extend(latlng);
        map.fitBounds(bounds);
    }

    //This is the default location - Manhattan as the center of the map
    else{
        let latlng = new google.maps.LatLng( // Getting Manhattan's location
            locations[0].geometry.location.lat,
            locations[0].geometry.location.lng);

        let marker = new google.maps.Marker({// Manhattan's marker
            map: map,
            position: latlng
        });
        let html = "<b>Manhattan</b>";// Title for the marker
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(html);
            infoWindow.open(map, marker);
        });
        markers.push(marker);//add the marker to be shown
        map.center = latlng;//move the map to show Manhattan at the center
    }
}

function locationsListener() {
    let locations = document.querySelectorAll('.store-container');//Get all the locationsLists shown
    locations.forEach((location,index)=>{
        location.addEventListener('click', ()=>{ //When a location is clicked on the list
            new google.maps.event.trigger(markers[index], 'click');//Show its marker on the map with its info
        });
    });
}

function searchDeli(){
    let foundDelis = [];//When the user inputs a zip code, the locationsLists in that area will be placed here
    let zipCode = document.getElementById('zip-code').value;//get the input
    if (zipCode){//if the input is not empty
        locations.forEach((deli, index)=>{//get each location
            if (deli.formatted_address.indexOf(zipCode)!==-1){foundDelis.push(deli)}//get locationsLists with that zip code
        });
        if (foundDelis.length ===0){//if no locationsLists are found with that zip code
            foundDelis = locations;//show the services the user was looking for
            alert('No Locations were found in that zip code area');
        }
    }
    //The user just loaded the page for the first time so get Manhattan's location
    else if (!zipCode && defaultMap){foundDelis = defaultList;}

    //The user just clicked a service button so show that list
    else{foundDelis = locations;}

    clearLocations();
    displayDeli(foundDelis);
    showLocationsMarkers(foundDelis);
    locationsListener();
}

function showUserPosition(infoWindow) {
    //if the user allowed to access their location
    if(navigator.geolocation){
        //get the coordinates
        navigator.geolocation.getCurrentPosition((position)=>{
            let pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            //create a costume marker
            let userMarker = new google.maps.Marker({
                map: map,
                position: pos,
                icon: 'http://maps.google.com/mapfiles/kml/paddle/blu-circle.png'
            });

            //display info when the marker is clicked
            let html = "<b>You are here.</b>";
            google.maps.event.addListener(userMarker, 'click', function() {
                infoWindow.setContent(html);
                infoWindow.open(map, userMarker);
            });

        })
    }
}

function buttonsListener() {
    serviceButtons.forEach((button)=>{ //get all the buttons
        button.addEventListener('click', ()=>{//when a button is clicked
            //Make the containers visible again
            document.getElementById('search-container').style.visibility = 'visible';
            document.getElementById('locations-container').style.visibility = 'visible';
            document.getElementById('service-type').innerText = button.id;
            defaultMap = false;//we no longer have to show Manhattan as the center of the map
            switch (button.id) { //Get what button was clicked
                //initialize the list with its corresponding locationsLists
                case 'hospital':
                    locations = hospitals;
                    break;
                case 'deli':
                    locations = delis;
                    break;
                case 'restaurant':
                    locations = restaurants;
                    break;
                case 'bar':
                    locations = bars;
                    break;
                case 'gas':
                    locations = gas;
                    break;
                case 'toilet':
                    locations = bathrooms;
                    break;
                default:
                    locations = defaultList;//initial map
            }
            searchDeli();//contains all the necessary functions
        })
    });
}
