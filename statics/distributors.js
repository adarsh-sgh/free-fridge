var slider = document.getElementById("dist");
var output = document.getElementById("disval");
output.innerHTML = slider.value;

slider.oninput = function() {
  output.innerHTML = this.value;
}
//popup
function popup(id) {
    var popup = document.getElementById(id+'1');
    popup.classList.toggle("show");
  }

  function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert( "Geolocation is not supported by this browser.")
    }
  }
  function showPosition(position) {
    let latInput=document.getElementById('lat')
    let lonInput=document.getElementById('lon')
  latInput.value =   position.coords.latitude 
  lonInput.value= position.coords.longitude;
}
setTimeout(getLocation, 100);
let userLat
let userLong
let dis
function postForm() {
  dis = document.getElementById("dist").value;
  userLat = document.getElementById("lat").value;
  userLong = document.getElementById("lon").value;
  let a = { lat: userLat, lon: userLong, dist: dis };
  $.post("/distributors", a, (d) => {
    console.log(d);
    if(d.length==0){
      document.getElementById("notfood").style.visibility='visible'
    }
    display(d)
  });
}

function display(dataArray) {
  let ht='';
  dataArray.forEach((e,i) => {
      let amount=e["amount"];
      let contact=e["mob"];
      let note=e["note"]
      let id=e["_id"]
      let name=e["name"]
      let mapLink=`https://www.google.com/maps/search/?api=1&query=${e['latitude']},${e['longitude']}`
      //let dis=getDistance(userLat,userLong,e["latitude"],e["longitude"])
       ht+=`<div class="data">
      <!--<div class="dis"><b>Distance:</b>&nbsp;<span>!!!!km</span></div>-->
      <div class="quantity"><b>Food for:</b>${amount} People</div>
      <div>Contact at <b>${contact}<br>Donor: ${name}</b></div>
      <div class="popup" id="popup${i}" onclick="popup(this.id)">
        More Info.
        <span class="popuptext"  id="popup${i}1">${note}</span
        ><br>
        <a href="${mapLink}" target="_blank"><button  type="button" >View In MAP</button></a>
      </div>
      <button id='${id}' type="button" onclick="deleteData(this.id)">Mark Collected</button>
      </div>`  
  });
  
  document.getElementById("container-data").innerHTML=ht;
}

function deleteData(id) {
  let idObj={"id":id}
  $.post("/delete",idObj , () => {
    console.log("data removed from database")
    document.getElementById(id).innerHTML="Removed"
  });
}
function notify(id) {
  let mail=prompt('Where should We Mail you');
  let precisionLength=dis;
  let precisionlat = precisionLength / 111.32;
    precisionLong =precisionLength / ((400075 * Math.cos((+userLat * 2 * Math.PI) / 360)) / 360);
    let latmin = +userLat - precisionlat;
    let longmin = +userLong - precisionLong;
    let latmax = +userLat + precisionlat;
    let longmax = +userLong + precisionLong;
let notifObj={mail,latmin,latmax,longmin,longmax}
$.post("/notify",notifObj , () => {
    console.log("Notification Set")
    document.getElementById(id).innerHTML="🔔 Set"
  });
}