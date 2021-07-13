
  "use strict";

var raster = new ol.layer.Tile({
  source: new ol.source.OSM(),
  name:"osm",
});

//  alternative format example
// var vector = new ol.layer.Vector({
//   source: new ol.source.Vector(),
//   style: new ol.style.Style({
//     fill: new ol.style.Fill({
//       color: 'rgba(255, 255, 255, 0.2)',
//     }),
//     stroke: new ol.style.Stroke({
//       color: '#ffcc33',
//       width: 2,
//     }),
//     image: new ol.style.Circle({
//       radius: 7,
//       fill: new ol.style.Fill({
//         color: '#ffcc33',
//       }),
//     }),
//   }),
// });

//-------------------collapse the OSM watermark ---------------
var attribution = new ol.control.Attribution({
  collapsible: false,
});
attribution.setCollapsible(true);
attribution.setCollapsed(true);
//-------------------------------------------------------------
//-------------------- map and view ---------------------------
var view = new ol.View({
  zoom: 15,
  projection: 'EPSG:4326',
  //center: ol.proj.fromLonLat([2.1833, 41.3833])
});
var map = new ol.Map({
  layers: [raster],
  target: 'map',
  view: view,
  controls: ol.control.defaults({attribution: false}).extend([attribution]),
});

setTimeout(() => map.updateSize(), 1);
// setTimeout(() => {
//   map.setTarget(document.getElementById('map'));
// }, 1000);

//----------- hack to keep yer eyes on the ol load -----------

//alert(typeof(ol));
// var i;
// var theOL;
// while (theOL != "good to go"){
//   try{
//     console.info("ol state: " + typeof(ol));
//     theOL="good to go"
//
//       document.getElementById("map-box").innerHTML="<div id='map' class='map'></div>";
//   }catch(err){
//     theOL = "undefined"
//   }
//   i++
//   document.getElementById("olState").innerHTML= "loops " + i ;
// }
//-------------------------------------------------------------
// var theOL;
// try{
// document.getElementById("olState").innerHTML="ol state: " + typeof(ol);
// console.info("ol state: " + typeof(ol));
//   theOL="good to go"
// }catch(err){
//   theOL = "undefined"
//   console.info("ol state: " + err.message);
//   console.info("ol state: " + typeof(ol));
// }
// console.info("ol state: " + theOL);
//------------------------ end hack --------------------------

//------------------------ geolocate --------------------------
var home=[];

var geolocation = new ol.Geolocation({
  tracking: true,
  projection: view.getProjection()
});

geolocation.on('change', function(evt) {
  var coord = geolocation.getPosition();

  if(home !== coord){
    setHome(coord);
  }
 });

var home;
function setHome(coord,zoom){
  home=coord;
  if(!zoom) {zoom=15;}

  view.setCenter(home);
  // Home marker
  var marker = new ol.Overlay({
    position: coord,
    positioning: 'center-center',
    element: document.getElementById('marker'),
    stopEvent: false,
  });

  map.addOverlay(marker);
  var theMarker=$("#marker");
  if (!theMarker.is(":visible")){
    theMarker.toggle(500);
  }
  view.setZoom(zoom);
}

geolocation.on('error', function (error) {
  //default to NY, NY, baby.
  var info = document.getElementById('info');
    setHome([-73.9664, 40.7817],14);
});
//--------------------- end geo --------------------------

$(document).ready(function(){
// $("#map").attr("style","visibility:visible");

//------------------- show coords ------------------------
map.addControl(new ol.control.MousePosition({
  prefix: 'Lat | Lon:  ',
  separator: ' | ',
  numDigits: 4,
  emptyString:'',//'Click anywhere for Lat | Lon',
  displayProjection: "EPSG:4326",
  coordinateFormat: ol.coordinate.createStringXY(4),
  }));
//----------------------- end ----------------------------

//--------------- click drawmode on --------------------

var drawMode = new Boolean(false);
var j=0;

map.on('singleclick', function(evt) {

  drawMode=true;
  drawMenu(drawMode);

if($( "input:checked" ).length >0){


  var shape=$( "input:checked" ).attr("geometry");
  var feature = map.forEachFeatureAtPixel(evt.pixel,
    function(feature, one){

      feature.set("shape",shape);
      feature.set("id",j);

      console.info("feature id: " +feature.get("id"))

      try{
        feature.set("area",feature.getGeometry().getArea());
      } catch {
        feature.set("area","n/a");
      };

      j++;
    });
  };
});

//--------------- 2x-click exit drawmode --------------------

map.on('dblclick', function(evt) {

  if (drawMode){
    evt.preventDefault();
    drawMode=false
    drawMenu(drawMode);

    try {
      removeDupes();
    }
    catch(err) {
      console.info("removeDupes typerror: " + err.message);
    }
    //deactivate things
  //  draw.setActive(false);
    //map.removeInteraction(draw);
  }
});
//--------------- end 2x-click exit drawmode --------------------

var ExampleModify = {
  init: function () {
    this.select = new ol.interaction.Select();
    map.addInteraction(this.select);

    this.modify = new ol.interaction.Modify({
      features: this.select.getFeatures(),
    });
    map.addInteraction(this.modify);

    this.setEvents();
  },
  setEvents: function () {
    var selectedFeatures = this.select.getFeatures();

    this.select.on('change:active', function () {
      selectedFeatures.forEach(function (each) {
        selectedFeatures.remove(each);
      });
    });
  },
  // getActive: function () {
  //   return this.modify ? this[this.modify].getActive() : false;
  // },
  setActive: function (active) {
    this.select.setActive(active);
    this.modify.setActive(active);
  },
};
ExampleModify.init();

var ExampleLayer = {

  init: function(){
    map.addLayer(this.Point);
    this.Point.setVisible(false);
    map.addLayer(this.LineString);
    this.LineString.setVisible(false);
    map.addLayer(this.Polygon);
    this.Polygon.setVisible(false);
    map.addLayer(this.Circle);
    this.Circle.setVisible(false);

    // list properties of THIS.
    // for(var propt in this){
    //   console.log(propt + ': ' + this[propt]);
    //}

  },
  style: new ol.style.Style({
      fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)',
      }),
      stroke: new ol.style.Stroke({
        color: '#ffcc33',
        width: 2,
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: '#ffcc33',
        }),
      }),
    }),

  Point: new ol.layer.Vector({
    source: new ol.source.Vector(),
    name: "Point",
    style: this.style,
  }),
  LineString: new ol.layer.Vector({
    source: new ol.source.Vector(),
    name: "LineString",
  }),
  Polygon: new ol.layer.Vector({
    source: new ol.source.Vector(),
    name: "Polygon",
  }),

  Circle: new ol.layer.Vector({
    source: new ol.source.Vector(),
    name: "Circle",
  }),

  vecSource: function(theVec){
    for (var i=0;i<map.getLayers().getLength();i++){

      if(map.getLayers().item(i).get("name")==theVec){
        var x = map.getLayers().item(i).get("source");
      }
    }
    return x;
  },

  list: function(){
    try{
    for (var i=0;i<map.getLayers().getLength();i++){
      console.info(i + "  " + map.getLayers().item(i).get("name") +":  "+ map.getLayers().item(i).getVisible());
      console.info(i + "  " + map.getLayers().item(i).getSource());
      }
    } catch(err){
      console.info("exampleLayer.list error " + err.message);
    }

  },

  getActive: function(){
    try{
      for (var i=0;i<map.getLayers().getLength();i++)
        {
          if(map.getLayers().item(i).getVisible()==true){
          var activeLayer=map.getLayers().item(i);
          }
        }
    } catch(err){
      console.info("exampleLayer.getSource error " + err.message);
    }
    //    var activeSource=activeLayer.getSource();
    return activeLayer;
  },

  getFeatures: function(){
    try{
      return this.getActive().getSource().getFeatures();
    }catch(err){
        console.info("ExampleLayer.getFeatures() error: " + err.message);
    }
  },

  removeLast: function(){
    //remove last feature
    var theArray=this.getFeatureArray();
    var lastIndex= theArray.length -1;

    if (lastIndex>-1){
      var lastFeature=theArray[lastIndex];
      var theFeature=this.getFeatures()[lastIndex];

      try{
        this.getActive().getSource().removeFeature(theFeature);
      }catch(err){
        console.info("ExampleLayer.removeLast error: " + err.message);
      }
    return
    }
  },

  getLength: function(length){

    let output;
    var m=length*100000;
    var f=m*3.28084;
    var mi = f/5280;

    if (mi > 1) {
      output = mi.round(2) + ' ' + 'mi';
    } else {
      output = f.round(2) + ' ' + 'ft';
    }
    return output;
  },

  getArea: function(area){
    var m2=area*10000000000;
    var f2=m2*3.28084*3.28084;
    var mi2 = f2/(5280*5280);
    var acre=mi2*640;

    let output;

      if (mi2 > 1) {
        output = mi2.round(2) + ' ' + 'mi<sup>2</sup>';
      } else {
        output = f2.round(2) + ' ' + 'ft<sup>2</sup>';
      }
      acre=acre.round(2) + ' ' + 'acres';
      return [output, acre];
    },

  getFeatureArray: function(){
    //Get the array of features
      var blah="";
      var theArray=[];
      var theFeature={};
      var i=0;

      var features = this.getFeatures();

      // Go through this array and get coordinates of their geometry.
      try{
      features.forEach(function(feature) {

        theFeature.id=i;
        theFeature.shape=feature.get("shape");
        if(theFeature.shape=="LineString"){
          theFeature.length=ExampleLayer.getLength(feature.getGeometry().getLength());
          theFeature.closest_point_to_home=feature.getGeometry().getClosestPoint(home);
        } else {
        }

        if(theFeature.shape=="Polygon"){
          theFeature.coordinates=feature.getGeometry().getCoordinates();
          theFeature.area=ExampleLayer.getArea(feature.getGeometry().getArea());
        } else {
        }

        if(theFeature.shape=="Circle"){
        theFeature.center=feature.getGeometry().getCenter();
        theFeature.radius=ExampleLayer.getLength(feature.getGeometry().getRadius());
        theFeature.area=ExampleLayer.getArea(Math.pow(feature.getGeometry().getRadius(),2)*Math.PI);
        theFeature.closest_point_to_home=feature.getGeometry().getClosestPoint(home);
        } else {
        }

       if(theFeature.shape=="Point"){
        // theFeature.closest_point_to_home="n/a";
        theFeature.coordinates=feature.getGeometry().getCoordinates();
        theFeature.closest_point_to_home=feature.getGeometry().getClosestPoint(home);
       } else {

       }
       theArray.push(JSON.parse(JSON.stringify(theFeature)));

        // console.log("=======" + i + "th feature in the function =======");
        // console.log(theArray[i]);
        // console.log("=======feature=======");

       i++
      });

      }catch(err){
          console.info("ExampleLayer.getFeatureArray() error: " + err.message)
      }
      return theArray;
  },

  getVisible: function () {
    return this.activeName ? this[this.activeName].getVisible() : false;
  },
  setVisible: function (active) {
    var type= $( "input:checked" ).attr("geometry"); //works

    if (active) {
      this.activeName && this[this.activeName].setVisible(false);
      //this[type].setVisible(true);

      try{
        this[type].setVisible(true);
      }catch(err){
        console.info("ExampleLayer.setVisible() error: " + err.message + "; type:  " + type)
      }

      this.activeName = type;
    } else {
      this.activeName && this[this.activeName].setVisible(false);
      this.activeName = null;
    }
      //console.info(this.list());
  },
}
ExampleLayer.init();

var ExampleDraw = {
  init: function () {
    map.addInteraction(this.Point);
    this.Point.setActive(false);
    map.addInteraction(this.LineString);
    this.LineString.setActive(false);
    map.addInteraction(this.Polygon);
    this.Polygon.setActive(false);
    map.addInteraction(this.Circle);
    this.Circle.setActive(false);
  },

  Point: new ol.interaction.Draw({
    source: ExampleLayer.vecSource("Point"),
    type: 'Point',
  }),
  LineString: new ol.interaction.Draw({
    source: ExampleLayer.vecSource("LineString"),
    type: 'LineString',
  }),
  Polygon: new ol.interaction.Draw({
    source: ExampleLayer.vecSource("Polygon"),
    type: 'Polygon',
  }),
  Circle: new ol.interaction.Draw({
  source: ExampleLayer.vecSource("Circle"),
    type: 'Circle',
  }),


  getActive: function () {
    return this.activeType ? this[this.activeType].getActive() : false;
  },
  setActive: function (active) {

    var type= $( "input:checked" ).attr("geometry"); //works

    if (active) {
      this.activeType && this[this.activeType].setActive(false);
      try{
        this[type].setActive(true);
      }catch(err){
        console.info("ExampleDraw.setActive() error: " + err.message + "; type:  " + type)
      }
      this.activeType = type;
    } else {
      this.activeType && this[this.activeType].setActive(false);
      this.activeType = null;
    }
  },

};
ExampleDraw.init();

document.getElementById("leftButtons").onchange = function (e) {
  //a drawing radio button has been pressed...
  //  var value = e.target.value; //it's "on" when pressed
  //Enable Draw & disable Mod
  ExampleDraw.setActive(true);
  ExampleLayer.setVisible(true);

  var geometry= e.target.getAttribute('geometry');
  var interaction=$("#buttonGroup").attr("interaction");
  var modify=$('input[type="checkbox"]').is(":checked");

  console.info("---------- drawMenu onchange ----------")

  console.info("Modify: " + modify);
  console.info("Draw: " +ExampleDraw.getActive());
//  console.info("Modify: " +ExampleModify.getActive());
  console.info("Layer: " +ExampleLayer.getVisible());

  // console.log("geometry: " + geometry );
  // console.log("interaction: " + interaction);
  // console.log("modify: " + modify);
  console.info("---------------------------------------")

  }


//toggle modify state when pressed

  // var btnModify=$("#buttonModify");
  // btnModify.on("click", function(){

  var theCheckbox=$('input[type="checkbox"]');
  theCheckbox.on("click", function(){
  var modify=theCheckbox.is(":checked");


  if( modify) {
      console.log("Checkbox is checked.");
  }
  else if($(this).is(":not(:checked)")){
      console.log("Checkbox is unchecked.");
  }

//  var modify=btnModify.attr("modify")=="true";
//  modify=!modify;
  // btnModify.attr("modify",modify);


    try{
      ExampleDraw.setActive(!modify);
      ExampleModify.setActive(modify);
    }catch(err){
      console.info("Toggle Modify terror: " + err.message);
    }

    console.info("--------------- status ---------------------")
    console.info("Modify: " + modify);
    console.info("Draw: " +ExampleDraw.getActive());
  //  console.info("Modify: " +ExampleModify.getActive());
    console.info("Layer: " +ExampleLayer.getVisible());
    console.info("--------------end status ---------------------")
});


// buttonGroup.onclick = function (e) {
//    var type = e.target.getAttribute('value');
//    var value = e.target.value;
//    $("#buttonGroup").attr("pressed",type);
// //   console.log("type: " + type + "; value:  " + value + " pressed? " + $("#buttonGroup").attr("pressed"));
// };


// optionsForm.onchange = function (e) {
//   var type = e.target.getAttribute('name');
//   var value = e.target.value;
//
//   //ExampleLayer.setVisible(true);
//   ExampleLayer.setVisible(true);
//
//   if (type == 'draw-type') {
//     ExampleDraw.getActive() && ExampleDraw.setActive(true);
//     //make layer(draw-type:value) visible; others invisible;
//
//   } else if (type == 'interaction') {
//     if (value == 'modify') {
//       ExampleDraw.setActive(false);
//       ExampleModify.setActive(true);
//     } else if (value == 'draw') {
//       ExampleDraw.setActive(true);
//       ExampleModify.setActive(false);
//
//     }
//   }
// };

//ExampleDraw.setActive(true);
//ExampleModify.setActive(false);

// The snap interaction must be added after the Modify and Draw interactions
// in order for its map browser event handlers to be fired first. Its handlers
// are responsible of doing the snapping.
// var snap = new ol.interaction.Snap({
//   source: vector.getSource(),
// });
// map.addInteraction(snap);

//--------------- utils -----------------------

  String.prototype.hash = function() {
    var self = this, range = Array(this.length);
      for(var i = 0; i < this.length; i++) {
        range[i] = i;
      }
    return Array.prototype.map.call(range, function(i) {
      return self.charCodeAt(i).toString(16);
    }).join('');
  }

  function removeDupes(){
    var obj ={};
    var index=0;
    var look4Dupes=[];
    var features = vector.getSource().getFeatures();

    //iterate over features on vector layer
    features.forEach(function(feature) {

      console.log(feature.getGeometry().getCoordinates());
      //hash & stash, cuz
      var theHash =feature.getGeometry().getCoordinates().join().hash();
      look4Dupes.push(theHash);
      obj[index]=theHash;
      console.log(index + "  " + obj[index]);
      index++;

    });//end for loop

    var dupe=look4Dupes.filter((e, i, a) => a.indexOf(e) !== i);

    //get key from value
    var key="";
    for(key in obj){
      console.log(key);
      console.log(obj[key]);

      if (obj[key]==dupe){
        console.log("removing: " + key);
        source.removeFeature(features[key]);
      };
    };
  }

  var theFeatures = function(){
  //Get the array of features
    var blah="";
    var theArray=[];
    var theFeature={};
    var i=0;
    var features = vector.getSource().getFeatures();

    // Go through this array and get coordinates of their geometry.
    features.forEach(function(feature) {

      theFeature.id=i;
      theFeature.shape=feature.get("shape");
      theFeature.coordinates=feature.getGeometry().getCoordinates();

      if(theFeature.shape=="LineString"){
       theFeature.length=feature.getGeometry().getLength();
      } else {
       theFeature.length="n/a";
      }

      if(theFeature.shape=="Polygon"){
       theFeature.area=feature.getGeometry().getArea();
      } else {
       theFeature.area="n/a";
      }

     if(theFeature.shape=="Point"){
       theFeature.closest_point_to_home="n/a";
     } else {
       theFeature.closest_point_to_home=feature.getGeometry().getClosestPoint(home);
     }
     theArray.push(JSON.parse(JSON.stringify(theFeature)));

      // console.log("=======" + i + "th feature in the function =======");
      // console.log(theArray[i]);
      // console.log("=======feature=======");

     i++
    });
    return theArray;
  };

  function getInfo(){

//    var f=theFeatures();
    var f=ExampleLayer.getFeatureArray();
    var i = 0;
    for (i=0;i<f.length;i++){
      console.log("i: " +  i+" ; " + JSON.stringify(f[i]));
    };

    //show the output, <pre> tag tells html to leave it unformatted.
    var theInfo;
    if(f.length<1){
      theInfo="No points selected."
    } else {
      theInfo=JSON.stringify(f, null, 1);
    }
    try{
      document.getElementById('info-box').innerHTML="<pre>" + theInfo + "</pre>";
    }catch(err){
      console.info("function getInfo error: " + err.message);
      console.info("<pre>" + theInfo + "</pre>");
    }
  }

  Number.prototype.round = function(places) {
  return +(Math.round(this + "e+" + places)  + "e-" + places);
}
//-------------------------- end utils --------------------------

var captionBox=$("#caption-box");
var drawBox=$("#draw-box");
//var buttonBox=$("#button-toolbar");
var buttonBox=$( "[id*='button-toolbar']" )
function drawMenu(drawMode){
  if(drawMode){
    if (captionBox.is(":visible")){
      buttonBox.toggle(500);
      drawBox.toggle(500);
      captionBox.toggle(500);
    }
  } else {
      captionBox.toggle(500);
      drawBox.toggle(500);
      buttonBox.toggle(500);
    }
}

var buttonInfo=$("#buttonInfo");
var infoBox=$("#info-box");
buttonInfo.click(function(e){

  console.log("clicked buttonInfo");
  $("#modalInfo").fadeToggle(500)

  getInfo();

});


var buttonRefresh=$("#buttonRefresh");
buttonRefresh.click(function(e){
  console.log("clicked buttonRefresh");

  console.info(ExampleLayer.removeLast());

});

var buttonHome=$("#buttonHome");
  buttonHome.click(function(e){

  console.log("clicked buttonHome");

  view.setCenter(home);
  view.setZoom(15);

});

//============== experiment =====================


// let inputx = document.querySelector(".radio-toolbar");
// let buttonx = document.querySelector(".buttonGroup");
//
// buttonx.disabled = true; //setting button state to disabled
// inputx.addEventListener("change", stateHandle);
// function stateHandle() {
//     if (inputx.value === "") {
//         buttonx.disabled = true; //button remains disabled
//     } else {
//         buttonx.disabled = false; //button is enabled
//     }
// }


//============== end experiment ==================



//---------------------- ! event handlers --------------------------

}); //end of jq wrapper
