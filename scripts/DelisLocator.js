let map;
let markers = [];
let infoWindow;
let locationSelect;

function initMap() {
    let Manhattan = {lat: 40.730610, lng: -73.935242};
    map = new google.maps.Map(document.getElementById('map'), {
        center: Manhattan,
        zoom: 11,
        mapTypeId: 'roadmap',
        mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}
    });
    infoWindow = new google.maps.InfoWindow();
    searchDeli();
}

function createMarker(latlng, name, addr, index){
    let html = "<b>" + name + "</b> <br/>" + addr;
    let marker = new google.maps.Marker({
        map: map,
        position: latlng,
        label: `${index+1}`
    });
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    markers.push(marker);
}

function showDeliMarkers(delis) {
    let bounds = new google.maps.LatLngBounds();
    delis.forEach((deli, index)=>{
        let latlng = new google.maps.LatLng(
            deli.geometry.location.lat,
            deli.geometry.location.lng);
        let name = deli.name;
        let address = deli.formatted_address;
        createMarker(latlng, name, address, index);
        bounds.extend(latlng);
    });
    map.fitBounds(bounds);
}

function displayDeli(delis) {
    let deliHtml = '';
    delis.forEach((deli, index)=>{
        deliHtml += `
        <div class="store-container">
                <div id="stores-container-background">
                    <div class="store-info">
                        <div class="address">
                        <span>${deli.formatted_address}</span>
                    </div>
                        <div class="store-phone-number"></div>
                    </div>
                    <div class="store-number-container">
                        <div class="store-number">${index+1}</div>
                    </div>
                </div>
            </div>`
    });
    document.getElementById('stores-list').innerHTML = deliHtml;
}

function deliListener() {
    let deliElements = document.querySelectorAll('.store-container');
    deliElements.forEach((element,index)=>{
        element.addEventListener('click', ()=>{
            new google.maps.event.trigger(markers[index], 'click');
        });
    });
}

function searchDeli(){
    let foundDelis = [];
    let zipCode = document.getElementById('zip-code').value;
    if (zipCode){
        delis.forEach((deli, index)=>{
            if (deli.formatted_address.indexOf(zipCode)!==-1){foundDelis.push(deli)}
        });
    }
    else{
        foundDelis = delis;
    }
    clearLocations();
    displayDeli(foundDelis);
    showDeliMarkers(foundDelis);
    deliListener();
}

function clearLocations() {
    infoWindow.close();
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0;
}