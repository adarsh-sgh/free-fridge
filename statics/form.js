function getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      alert( "Geolocation is not supported by this browser.")
    }
  }
  
  function showPosition(position) {
      let latInput=document.getElementById('latitude')
      let lonInput=document.getElementById('longitude')
    latInput.value =   position.coords.latitude 
    lonInput.value= position.coords.longitude;
  }
  setTimeout(getLocation, 100);
  function checkBox() {
    let latInput=document.getElementById('latitude')
    let lonInput=document.getElementById('longitude')
      cb=document.getElementById('cb')
      if(cb.checked==true){
          latInput.removeAttribute("readonly")
          lonInput.removeAttribute("readonly")
        }else{
            latInput.setAttribute('readonly','')
            lonInput.setAttribute("readonly",'')
        }
     
  }

