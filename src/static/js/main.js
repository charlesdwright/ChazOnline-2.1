$(document).ready(function(){
  "use strict";

// ---- event handlers ---
// ---- model01  ---
  var box_1 =$("#box-1");
  var model01=$("#modal01");
  box_1.on("click", function(){

    $("#caption-modal01").load("../static/txt/sentiment.txt");

    model01.fadeToggle(500);
  });


// -- !model01 ---

// ---- model02  ---
  var model02=$("#modal02");
  var box_2=$("#box-2");
  box_2.on("click", function(){

    $("#caption-modal02").load("../static/txt/maps.txt");

    //this is THE money line:
    try{

      $('#modal02-body').load("../static/maps.html" ,function(){
      });

    } catch(err) {
      if (e instanceof ReferenceError) {
        console.info("modal02 ReferenceError error: " + err.message);
      }else{
        console.info("modal02 load error: " + err.message);
        }
      }

    model02.fadeToggle(500);

  });
// -- !model02 ---

// ---- model03  (currently unused)---
  var box_3 =$("#box-3");
  var model03=$("#modal03");
  box_3.on("click", function(){

    var captionText = document.getElementById("caption-"+ box_3.attr("data-modal-name"));
    captionText.innerHTML = box_3.attr("alt");

    model03.fadeToggle(500);
  });
// ---- !model03  ---


  $("#btn-modalReset").click(function(){
    document.getElementById("modalForm").reset();
  });

  $( "button[id*='btn-infoClose']" ).click(function(e){
    $("#modalInfo").fadeToggle(500)
  });

  $( "button[id*='btn-sentimentClose']" ).click(function(e){
    $("#modalSentiment").fadeToggle(500)
  });

  var theModal = $( "div[id*='modal0']" )
  var closeModal= $('span[name$="closeModal"]')
  closeModal.on("click", function(){
    location.reload();
    });

  box_1.mouseover(function() {
    swapImage(document.getElementById('box-1'));
  });

$( "input[id*='radioSent']" ).click(function(e){

  swapSentimentImages();

  //update db w/user provide sentiment feedback
  var feedback=$( "input:checked" ).attr("sentiment");
  var subID=$("#modal-modal-radio").attr("submissionID");
  var theURL = "update?feedback="+feedback;
  theURL= theURL + "&subID=" + subID;

  setFeedbackJs(theURL)

  document.getElementById("modalForm").reset();

  setTimeout(function(){
    alert("Thanks!");
    $("#modalInfo").fadeToggle(500);
  }, 500);

});

$("#modalForm").submit(function(){

  var subId = Date.now().toString().hash();
  var theURL = "sentiment?input="+document.getElementsByName("input")[0].value;
  theURL=theURL+"&sentId="+subId;

  getSentimentJs(theURL);

  console.log("submitted sentiment");
  $("#modalInfo").fadeToggle(500);

  //setup the modal popup
  $("#modal-modal-radio").attr("style","display=block");
  $("#modal-modal-radio").attr("align","center");
  $("#modal-modal-radio").attr("submissionID",subId);

  $(".modal-title").text("What say you?");
  $(".modal-text").text("Please choose/confirm the best response. It will help the algo's accuracy:");

  });


// ---- !event handlers ---

function swapImage(element){
  //pick one at random, according to how many are in the folder...
  var x = element.src;
  var y=x;
  while (x==y){
    y = x.replace(/-[0-9].jpg/,"-"+ Math.floor(Math.random() * 2)+".jpg");
  }
  element.src= y;
}

function swapSentimentImages(){
  //console.info("4. begin swapImages: " + Date.now());

  var sentiments=['pos','neg','meh'];
  //figure out which is checked
  var result=$( "input:checked" ).attr("sentiment");
  var theImage="img[id='" + result + "']";
  var imgSelected=$(theImage).attr("src");
  var url = imgSelected.substring(0, imgSelected.lastIndexOf("/") + 1);

  for (var i=0; i<sentiments.length;i++){

    var theImage="img[id='" + sentiments[i] + "']";

    if(sentiments[i] != result){
        $(theImage).attr("src",url+sentiments[i]+"-0.jpg");
        $(theImage).width(125);
        $(theImage).height(125);
      } else{
        $(theImage).attr("src",url+sentiments[i]+"-0-selected.jpg");
        $(theImage).width(150);
        $(theImage).height(150);
      }
  }
//  console.info("5. end swapImages: " + Date.now());
}

//--- http functions ---

function getSentimentJs(theURL) {
  event.preventDefault();
  //console.info("1. begin getSentimentJs: " + Date.now());
  var result;
  //var imgIndex = Math.floor(Math.random() * 3); //for now...

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", theURL, true);

  xhttp.onreadystatechange = function() {

  if (this.readyState == 4 && this.status == 200) {
    //waits for response!

    result=this.responseText;
    console.log("xhttp.responseText: " + result);

    var theQuery="input[type='radio'][sentiment="+result+"]";
    $(theQuery).prop("checked", true);
    //console.info("2. form checked? :" + $(theQuery).prop("checked") + "  result: " + Date.now());
    //console.info("3. calling swapImages: " + Date.now());
    swapSentimentImages();
  } else {
    console.info(xhttp.statusText);
  }
    //console.info("6. after xhttp: " + Date.now());
  };
  xhttp.onerror = function (e) {
    console.error(xhr.statusText);
  };
    //console.info("7. open xhttp: "  + Date.now());

    xhttp.send();
    //console.info("8. end getSentimentJs: " + Date.now());
    return result;
}

function setFeedbackJs(theURL) {
  event.preventDefault();

  var xhttp = new XMLHttpRequest();
  xhttp.open("GET", theURL, true);

  xhttp.onreadystatechange = function() {

    if (this.readyState == 4 && this.status == 200) {
      //stash the submissionID as a form attribute for later retrieval
      console.info(this.responseText)
      $("#modal-modal-radio").attr("submissionStatus",this.responseText);
    } else{
      console.info(this.statusText);
    }
  };

  xhttp.onerror = function (e) {
    console.error(xhttp.statusText);
  };
  xhttp.send();

}

//--- !http functions ---

  String.prototype.hash = function() {
    var self = this, range = Array(this.length);
      for(var i = 0; i < this.length; i++) {
        range[i] = i;
      }
    return Array.prototype.map.call(range, function(i) {
      return self.charCodeAt(i).toString(16);
    }).join('');
  }

  // Change style of navbar on scroll
  window.onscroll = function() {myFunction()};
  function myFunction() {
    var navbar = document.getElementById("myNavbar");
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        navbar.className = "w3-bar" + " w3-card" + " w3-animate-top" + " w3-white";
    } else {
        navbar.className = navbar.className.replace(" w3-card w3-animate-top w3-white", "");
    }
  }

  // Used to toggle the menu on small screens when clicking on the menu button
  function toggleFunction() {
    var x = document.getElementById("navDemo");
    if (x.className.indexOf("w3-show") == -1) {
        x.className += " w3-show";
    } else {
        x.className = x.className.replace(" w3-show", "");
    }
  }



  try{
    $('#txt01').load("../static/txt/sentiment.txt" ,function(){
    });
  } catch(err) {
    if (e instanceof ReferenceError) {
      console.info("modal02 ReferenceError error: " + err.message);
    }else{
      console.info("modal02 load error: " + err.message);
      }
    }

    try{
      $('#txt02').load("../static/txt/maps.txt" ,function(){
      });
    } catch(err) {
      if (e instanceof ReferenceError) {
        console.info("modal02 ReferenceError error: " + err.message);
      }else{
        console.info("modal02 load error: " + err.message);
        }
      }

  // var txtFile = new XMLHttpRequest();
  //     var allText = "file not found";
  //     txtFile.onreadystatechange = function () {
  //         if (txtFile.readyState === XMLHttpRequest.DONE && txtFile.status == 200) {
  //             allText = txtFile.responseText;
  //             allText = allText.split("\n").join("<br>");
  //         }
  //
  //         document.getElementById('txt').innerHTML = allText;
  //     }
  //     txtFile.open("GET", "../static/mywork/yermammy.txt", true);
  //     txtFile.send(null);



}); //! javascript wrapper

//deprecated but potentially useful below
/*
  function clockImage(element){

  //  alert("in clockImage");
      //clearInterval(blah);
      alert(i);
      var x = element.src;
      var i = 0;
        function animationLoop(){
            element.src=x.replace(/[01]?\d\.jpg/, i+".jpg");
          i++;
          if(i==12){
            i=0;
          }
        }
        let blah = setInterval(animationLoop,50);
  }

  function loopImage(element){
    //pick one at random, according to how many are in the folder..."n.jpg"
  //  alert("in loopImage");

      var x = element.src;
      var i = 0;
            function animationLoop(){

              y = x.replace(/[01]?\d\.jpg/, Math.floor(Math.random() * 11)+".jpg");
            element.src= y;
        i++;
        if(i==10){
          clearInterval(blah);
          alert(i);
        }
        }
        let blah = setInterval(animationLoop,2000);
      }
*/
