// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth,createUserWithEmailAndPassword,signInWithEmailAndPassword, onAuthStateChanged, setPersistence, browserLocalPersistence, signOut } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getDatabase, ref, set, child, get, onValue, remove} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";

//Firebase config
const firebaseConfig = {
    apiKey: window._env_.FIREBASE_API_KEY,
    authDomain: window._env_.FIREBASE_AUTH_DOMAIN,
    databaseURL: window._env_.FIREBASE_DATABASE_URL,
    projectId: window._env_.FIREBASE_PROJECT_ID,
    storageBucket: window._env_.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window._env_.FIREBASE_MESSAGING_SENDER_ID,
    appId: window._env_.FIREBASE_APP_ID,
    measurementId: window._env_.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db=getDatabase(app);
var user;
var userDoc;
//var otherString;
// Email/Password Signup

//questions -- how do
const $ = document.querySelector.bind(document);
$("#loginLink").addEventListener('click', openLoginScreen);
$("#signupLink").addEventListener('click', openSignUpScreen);
$("#signup-btn").addEventListener('click', signup);
$("#login-btn").addEventListener('click', login);
$("#track-btn").addEventListener('click',track);
$("#logout-btn").addEventListener('click',logout); 
$("#find-btn").addEventListener('click',getLocation);
$("#stopTracking-btn").addEventListener('click',stopTracking);
$("#stopSharing-btn").addEventListener('click',deleteLocData);
$("#navLogoutLink").addEventListener('click', logoutScreen);
$("#stopSharing-btn").addEventListener('click',stopSharingScreen);
$("#navTrackPeople").addEventListener('click',findScreen);
$("#navShareLoc").addEventListener('click',openHomeScreen);





//detects change to the auth state, but the session is restored via local persistence
onAuthStateChanged(auth, auth=>{
    console.log('this is the authenticated person rn', auth)
    if(auth){
        // Signed in 
        user = auth;
        console.log('logged in',user);
        //console.log('thu',auth.uid);
        showError(error);
        const dbRef = ref(getDatabase());   //this is for reference for the root of the database
        get(child(dbRef, `users/${user.uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
            userDoc=snapshot.val();
            console.log(userDoc);
            openHomeScreen()
        } else {
            console.log("No data available");
            //initialScreen();
        }


        }).catch((error) => {
            console.error(error);
        });

        
        
    }else{
        console.log('executing this line');
        initialScreen()
        document.getElementById('app').style.display = 'block'; // show app

    }
})





function initialScreen(){
    $("#loginScreen").classList.add("hidden");
    $("#registerScreen").classList.add("hidden");
    $('#trackingScreen').classList.add('hidden');
    $("#mainScreen").classList.add("hidden");
    $("#topNav").classList.add("hidden");
    $("#logoutScreen").classList.add("hidden");

    $("#initialScreen").classList.remove("hidden");
}

function openSignUpScreen(){
    $("#loginScreen").classList.add("hidden");
    $("#initialScreen").classList.add("hidden");
    $("#topNav").classList.add("hidden");
    $("#logoutScreen").classList.add("hidden");

    resetInputs();
    showError('');
    $("#registerScreen").classList.remove("hidden");
}
function openLoginScreen(){
    // hide other screens, clear inputs, clear error
   $("#registerScreen").classList.add("hidden");
    $("#initialScreen").classList.add("hidden");
    $("#topNav").classList.add("hidden");
    $("#logoutScreen").classList.add("hidden");

    resetInputs();
    showError('');
    // reveal login screen
    $("#loginScreen").classList.remove("hidden");
}

function stopSharingScreen(){
    $("#trackingScreen").classList.add("hidden");

    $("#afterStop-btn").classList.remove("hidden");
    $("#map2").classList.remove("hidden");

}

//logout
function logout(){

    console.log('logged out of ',user.email);
    signOut(auth)
    .then(() => 
        initialScreen())
    .catch((error) => {
        showError(error)
    });
}

function logoutScreen() {
    $("#initialScreen")?.classList.add("hidden");
    $("#loginScreen")?.classList.add("hidden");
    $("#registerScreen")?.classList.add("hidden");
    $("#mainScreen")?.classList.add("hidden");
    $("#trackingScreen").classList.add("hidden");
    $("#topNav").classList.add("hidden");
    $("#afterStop-btn").classList.add('hidden');
    $("#share").classList.add('hidden');
    $("#map2").classList.add("hidden");

    $("#logoutScreen").classList.remove("hidden");
  };

$("#cancelLogout-btn").addEventListener("click", () => {

    $("#logoutScreen").classList.add("hidden");
    $("#trackingScreen").classList.add('hidden');
    $("#mainScreen").classList.add('hidden');
    $("#afterStop-btn").classList.add('hidden');
    $("#share").classList.add('hidden');

    $("#mainScreen").classList.remove("hidden");
    $("#topNav").classList.remove("hidden");
  });
  
  

// function openMainFrame(){
//     console.log('switching to mainframe');
//     $("#loginScreen").classList.add("hidden");
//    // $("#registerScreen").classList.add("hidden");
//     // resetInputs();
//     // showError('');
//     $("#mainFrame").classList.remove("hidden");
// }

function openHomeScreen(){
    // hide other screens, clear inputs, clear error
    $('#loginScreen').classList.add('hidden');
    $('#registerScreen').classList.add('hidden');
    $("#initialScreen")?.classList.add("hidden");
    $("#share").classList.add('hidden');
    resetInputs();
    showError('');
    // reveal home screen
    $("#map2").classList.remove("hidden");
    $('#mainScreen').classList.remove('hidden');
    $("#topNav").classList.remove("hidden");
    $('#nameScreen').innerText = userDoc?.name;
    console.log('this is user doc', userDoc);
    
}

function track(){
    $('#loginScreen').classList.add('hidden');
    $('#registerScreen').classList.add('hidden');
    $('#mainScreen').classList.add('hidden');
    $('#share').classList.add('hidden');
    showError('');
    $('#trackingScreen').classList.remove('hidden');
    $("#topNav").classList.remove("hidden");
    $("#map2").classList.remove("hidden");
    //currentLocation();
    onAuthStateChanged(auth, (authUser) => {
        if (authUser) {
            user = authUser;
            currentLocation(user.uid);
        } else {
            showError("You must be logged in to track location.");
        }
    });
    if (!map2) {
        map2 = L.map('map2', {
          center: [40.846409, -74.28254],
          zoom: 13
        });
    
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap'
        }).addTo(map2);
    
        map2.on('click', onMapClick);
    }else {
        // Refreshes size if the map is already created but was hidden
        map2.invalidateSize();
    }
}

function findScreen(){
    $("#initialScreen")?.classList.add("hidden");
    $("#loginScreen")?.classList.add("hidden");
    $("#registerScreen")?.classList.add("hidden");
    $("#mainScreen")?.classList.add("hidden");
    $("#trackingScreen").classList.add("hidden");
    $("#afterStop-btn").classList.add("hidden");

    $("#share").classList.remove('hidden');
    $("#map2").classList.remove("hidden");
}

$("#find-btn").addEventListener('click',()=>{
    $("#find-btn").classList.add('hidden');
    $("#trackingScreen").classList.add("hidden");
    $("#afterStop-btn").classList.add("hidden");
    $("#pg").classList.add('hidden');
    $("#HTMLuserString").classList.add('hidden');
    resetInputs();
    $("#map2").classList.remove("hidden");
    $("#stopTracking-btn").classList.remove('hidden');
})

$("#stopTracking-btn").addEventListener('click',()=>{
    $("#stopTracking-btn").classList.add('hidden');
    
    $("#welcome-track").classList.add('hidden');
    $("#welcome-track").classList.add('hidden');
    $("#pg").classList.remove('hidden');
    $("#HTMLuserString").classList.remove('hidden');
    resetInputs();
    $("#find-btn").classList.remove('hidden');
    $("#map2").classList.remove("hidden");
    $("#stopMsg").textContent = 'Stopped Tracking Location';


})


function signup(){
    const email=$('#signupEmail').value;
    const password=$('#signPassword').value;
    const name=$('#name').value;
    const confirmpass=$('#confirm-password').value;

    //test for string to find users
    //const userString=$('#myString').value;

    if (password!=confirmpass){
        showError("Passwords do not match");
        return;
    }
    if(!email || !password || !confirmpass || !name){
        showError('Missing Fields')
        resetInputs();
    }
    createUserWithEmailAndPassword(auth,email,password)
    .then((userCredential)=>{
        user=userCredential.user;
        console.log('Signed up as');
        showError('');
        resetInputs();
        
        openHomeScreen()
        // save user info in db
        set(ref(db,'/users/'+user.uid),{
            name,email,userString
        });
    })
    .catch ((error)=>{
        showError(error.message);
        resetInputs();
    });
  
}


function login(){

    const email=$('#email').value;
    const password=$('#password').value;
    // const userName=$('#username').value;

    //setPersistence "local" controls whether the session 
    // is remembered after refresh or browser close
    setPersistence(auth,browserLocalPersistence)
    .then(()=>{

    return signInWithEmailAndPassword(auth, email, password);
    })
    .then((userCredential) => {

        console.log(user);
        user=userCredential.user;
        console.log("signed in");
        
        

    })
    .then(()=>
        openHomeScreen())
    .catch((error) => {
        showError(error);
    });

}


function showError(err){
    $('#error').innerText=err;

}
function resetInputs(){
    var inputs = document.getElementsByTagName("input");
    for(var input of inputs){
        input.value='';
    }
}

function getURL(params){
    let url=new URL(window.location);
    url.hash=url.search='';
    for(let param in params){
      url.searchParams.append(param,params[param]);
    }
    return url.href;
  }
  
function copyLink(params){
    navigator.clipboard.writeText(getURL(params));
    alert('URL link copied to clipboard.')
}
$("#sessionPass").addEventListener("click",()=>{

    copyLink({session:$('#sessionPass').textContent});
})
  
  //Sample use:
  // copyLink({session:'12345'})



var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(e.target);
}


// var map2 = L.map('map2', {
//     center: [40.846409 , -74.28254],
//     zoom: 13
// });

// L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//     maxZoom: 19,
//     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//     }).addTo(map2);

// map2.on('click', onMapClick);
let map2;
// document.addEventListener('DOMContentLoaded', () => {
//     const mapContainer = document.getElementById('map2');
//     if (!mapContainer) return; 

//     map2 = L.map('map2', {
//         center: [40.846409, -74.28254],
//         zoom: 13
//     });
//     //console.log(map2 instanceof L.Map); 


//     L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         maxZoom: 19,
//         attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//     }).addTo(map2);

//     map2.on('click', onMapClick);
// });


const EARTH_RADIUS = 6378137; // Earth's radius in meters
const DEGREES_PER_METER = 1 / (EARTH_RADIUS * Math.PI / 180);
    
function metersToLatitude(meters) {
    return meters * DEGREES_PER_METER;
}
function metersToLongitude(meters, latitude) {
    return meters * DEGREES_PER_METER / Math.cos(latitude * Math.PI / 180);
}

//L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map2);
 
let mapCircle;
function drawCircle(lat,lng,accuracy=5){
           // recenter/rezoom based on lat/lng/accuracy
    let latErr=metersToLatitude(accuracy);
    let lngErr=metersToLongitude(accuracy,lat);
    map2.fitBounds([
        [lat-latErr, lng-lngErr],
        [lat+latErr, lng+lngErr]
    ]);

   // add accuracy circle
   if(mapCircle){
    mapCircle.setLatLng(new L.LatLng(lat, lng));
    mapCircle.setRadius(accuracy)
   }else{
   mapCircle=L.circle([lat,lng],{radius:accuracy}).addTo(map2);
   }

}


//random string for password every session
function generateRandomStringWithTime(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const now = new Date().getTime().toString(36); 
  
    for (let i = 0; i < length - now.length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    result += now;
    return result;
}

//current loc
let watch;
let firstLocationUpdate = true;

function currentLocation(uid) {
  if (!navigator.geolocation) {
    alert("Geolocation not supported.");
    return;
  }

  console.log('started watching');
  const sessionPassword = generateRandomStringWithTime(16);
  document.getElementById('sessionPass').innerHTML = sessionPassword;

  watch = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      if (firstLocationUpdate) {
        console.log('setting map view');
        map2.setView([latitude, longitude], 16);
        firstLocationUpdate = false;
      }

      drawCircle(latitude, longitude);

      console.log('Constantly updated position: ', user.uid, latitude, longitude);
      set(ref(getDatabase(), 'locations/' + sessionPassword), {
        lat: latitude,
        lng: longitude
      });
    },
    (error) => {
      console.error("Location error:", error.message);
    },
    {
      maximumAge: 100,
      timeout: 50000,
      enableHighAccuracy: true
    }
  );
}


function deleteLocData() {
    console.log('stop sharing data');
    const otherUserPass = document.getElementById('HTMLuserString').value;
    const deleteLoc = ref(db, `locations/${otherUserPass}`);

    if (watch !== undefined) {
        navigator.geolocation.clearWatch(watch);
        //watch = undefined;
        console.log('stopped sending location');
    } 
    if (mapCircle) {
        map2.removeLayer(mapCircle);
        mapCircle = null;
    }
    remove(deleteLoc)
        .then(() => {
            console.log('Deleted location data from database');
        })
        .catch((error) => {
            showError(error);
        });
}


var locationRefDB;
var stopListening;
var hasCentered = false; // <- NEW FLAG

function getLocation() {
    const otherUser = document.getElementById('HTMLuserString').value;
    console.log(otherUser);
    
    locationRefDB = ref(db, `locations/${otherUser}`);
    stopListening = onValue(locationRefDB, (snapshot) => {
        const childData = snapshot.val();
        if (!childData) return;

        console.log('this is the location for ', childData);
        $("#welcome-track").innerHTML = `Here's the location of the requested user:<br>Lat: ${childData.lat}<br>Lng: ${childData.lng}`;

        const timestamp = new Date().getTime();
        const date = new Date(timestamp);
        console.log(date);

        // Only center the first time
        if (!hasCentered) {
            map2.setView([childData.lat, childData.lng], 16);
            hasCentered = true;
        }

        drawCircle(childData.lat, childData.lng);
    });
}


function stopTracking(){
    console.log("stop Tracking func");
    stopListening();
    if (mapCircle) {
        map2.removeLayer(mapCircle);
        mapCircle = null;
    }

}






//use userId to give back name
// function shareLocation(){
//     const otherUser = document.getElementById('HTMLuserString').value;
//     //const dbRef = ref(getDatabase());

//     // console.log('user.uid:', user?.uid);
//     // console.log('otherUser:', otherUser);
//     //error because user.uid gives out my uid not otheruser's

//     //first taking the value aka friend's string from the box and checking if that string exists
//     const usersRef = ref(getDatabase(), 'users');

//     const queryRef = query(usersRef, orderByChild('userString'), equalTo(otherUser)); //add .indexon in rules to access the data faster
//     // console.log('this is', queryRef);
//     // console.log(typeof queryRef);
//     onValue(queryRef, (snapshot) => { //getting info about the user with this string
//         if (snapshot.exists()) {
//             snapshot.forEach((childSnapshot) => {
//                 const otherUid = childSnapshot.key; 
//                 const otherData = childSnapshot.val();

//                 //console.log('other UID:', otherUid);
//                 console.log('This is', otherData.name,"'s live location.");
                
//                 //if the string exists then we share the location

//                 //problem is the location is not being updated constantly 
//                 //question difference between db=getDatabase(app) and db=ref(getDatabase()) -- why no parameters?, is it initilaizing with the parameter?
//                 function getLocation(otherUid){
//                     //const locRef=ref(getDatabase());
//                     const locRef=ref(db,`locations/${otherUid}`);

//                     onValue(locRef,(snapshot)=>{
//                             snapshot.forEach((childSnapshot)=>{
//                                 const childKey=childSnapshot.key;
//                                 const childData=childSnapshot.val();
//                                 console.log(childData)
//                             })
//                         });

//                     // const stopBtn = document.querySelector('#stopTracking-btn');
//                     // stopBtn.onclick = () => {
//                     //     off(locRef, locationFriend);
//                     //     console.log('Stopped tracking.');

//                           //  };   
//                         //off("value", listener);
//             }
//             getLocation(otherUid);

//             });
                
                
//         }else{
//             console.log('There is no location for',{otherUser}, "user string") //why is other user in json? shouldn't it be a string
//         }
//     }

// )};




//next to do: track time constantly/ update time constantly


// function updateLoc(uid,loc){
//     set(ref(db,`locations/${uid}`),loc)
// }
// function updateLoc(uid,loc){

//     set(ref(getDatabase(),`locations/${uid}`),loc)}

// function userLocUpdate(){
//     navigator.geolocation
// }

// const keepUpdating=setInterval(()=>{
//     const coords=shareLocation();
//     updateLoc(uid,{
//         lat:coords.lat,
//         lng:coords.lng
//     })
// },1000)

// window.stop=function(){
//     clearInterval(keepUpdating)
// }





    ///map tracking
// const db = getDatabase();

// function updateLoc(userId,loc){
//     set(ref(db,`/users/${userId}/currentLoc`),loc)
// }

// const userId = 'abhatarai'
// const keepUpdating = setInterval(()=>{
//     updateLoc(userId,{
//         lat:Math.floor(Math.random()*20),
//         lng:Math.floor(Math.random()*20),
//         acc:Math.floor(Math.random()*20)
//     })
// },1000)

// window.stop=function(){
//     clearInterval(keepUpdating)
// }



// const otherUserLocRef = ref(db, 'users/' + userId + '/currentLoc');
// onValue(otherUserLocRef, (snapshot) => {
//     const data = snapshot.val();
//     console.log( data )
// });

///use for friends part
// function friendUID(callback){
//         const friendUser = document.getElementById('friendName').value;
//         //const dbRef = ref(getDatabase());
    
//         // console.log('user.uid:', user?.uid);
//         // console.log('otherUser:', otherUser);
//         //error because user.uid gives out my uid not otheruser's
    
//         //first taking the value aka friend's string from the box and checking if that string exists
//         const usersRef = ref(getDatabase(), 'users');
    
//         const queryRef = query(usersRef, orderByChild('name'), equalTo(friendUser)); //add .indexon in rules to access the data faster
//         // console.log('this is', queryRef);
//         // console.log(typeof queryRef);
//         onValue(queryRef, (snapshot) => { //getting info about the user with this name
//             if (snapshot.exists()) {
//                 snapshot.forEach((childSnapshot) => {
//                     const friendUid = childSnapshot.key; 
//                     callback(friendUid);
//             });
//         }else{
//             console.log('user not found');
//         }
//     })
