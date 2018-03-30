var dataUrl = "https://docs.google.com/spreadsheets/u/1/d/e/2PACX-1vTHxUSR_hDbpjeD0ASqp5xC6ElYtfcXBodDK-PqVKTN1AQsCJedniBZ9-8IlNzTuVGrRqX84ntho1Oa/pub?gid=0&single=true&output=csv";

var options = ["test", "test", "test", "test", "test", "test", "test"];

var startAngle = 0;
var arc = null;
var spinTimeout = null;

var spinArcStart = 10;
var spinTime = 0;
var spinTimeTotal = 0;

var ctx;

initData(options);

function initData(result) {
  options = result;
  arc = Math.PI / (options.length / 2);
}


document.getElementById("spin").addEventListener("click", spin);
document.getElementById("sheet").addEventListener("click", sheet);

function byte2Hex(n) {
  var nybHexString = "0123456789ABCDEF";
  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
}

function RGB2Color(r,g,b) {
  return '#' + byte2Hex(r) + byte2Hex(g) + byte2Hex(b);
}

function getColor(item, maxitem) {
  var phase = 0;
  var center = 128;
  var width = 127;
  var frequency = Math.PI*2/maxitem;
  
  red   = Math.sin(frequency*item+2+phase) * width + center;
  green = Math.sin(frequency*item+0+phase) * width + center;
  blue  = Math.sin(frequency*item+4+phase) * width + center;
  
  return RGB2Color(red,green,blue);
}

function drawRouletteWheel() {
  var canvas = document.getElementById("canvas");
  if (canvas.getContext) {
    var outsideRadius = 300;
    var textRadius = 180;
    var insideRadius = 125;

    ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,900,900);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    ctx.font = '12px Helvetica, Arial';

    for(var i = 0; i < options.length; i++) {
      var angle = startAngle + i * arc;
      //ctx.fillStyle = colors[i];
      ctx.fillStyle = getColor(i, options.length);

      ctx.beginPath();
      ctx.arc(402, 320, outsideRadius, angle, angle + arc, false);
      ctx.arc(402, 320, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      ctx.save();
      ctx.shadowOffsetX = -1;
      ctx.shadowOffsetY = -1;
      ctx.shadowBlur    = 0;
      ctx.shadowColor   = "rgb(220,220,220)";
      ctx.fillStyle = "black";
      ctx.translate(402 + Math.cos(angle + arc / 2) * textRadius, 
      320 + Math.sin(angle + arc / 2) * textRadius);
      ctx.rotate(angle + arc + 15 / 2 + Math.PI / 2);
      var text = options[i];
      ctx.fillText(text, -ctx.measureText(text).width / 2, 0);
      ctx.restore();
    } 

    //Arrow
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(402 - 4, 320 - (outsideRadius + 5));
    ctx.lineTo(402 + 4, 320 - (outsideRadius + 5));
    ctx.lineTo(402 + 4, 320 - (outsideRadius - 5));
    ctx.lineTo(402 + 9, 320 - (outsideRadius - 5));
    ctx.lineTo(402 + 0, 320 - (outsideRadius - 13));
    ctx.lineTo(402 - 9, 320 - (outsideRadius - 5));
    ctx.lineTo(402 - 4, 320 - (outsideRadius - 5));
    ctx.lineTo(402 - 4, 320 - (outsideRadius + 5));
    ctx.fill();
  }
}

function spin() {
  var spinButton = document.getElementById("spin");
  spinButton.disabled = true;
  spinButton.innerHTML = "C'est parti !";
  $("#cf7 #canvas").removeClass("opaque");
  $("#cf7 #philippe").addClass("opaque");
  setTimeout(function(){
    $("#cf7 #philippe").removeClass("opaque");  
    $("#cf7 #canvas").addClass("opaque");

    spinAngleStart = Math.random() * 10 + 10;
    spinTime = 0;
    spinTimeTotal = Math.random() * 3 + 4 * 2000;
    rotateWheel();
  }, 2000);
  
}

function sheet() {
  var win = window.open("https://docs.google.com/spreadsheets/d/1lzoxzRKcmdeLPCZA4MqYw5GFX7QJGK2oTaN-O0dVK_0/edit", '_blank');
  win.focus();
}

function rotateWheel() {
  spinTime += 30;
  if(spinTime >= spinTimeTotal) {
    stopRotateWheel();
    return;
  }
  var spinAngle = spinAngleStart - easeOut(spinTime, 0, spinAngleStart, spinTimeTotal);
  startAngle += (spinAngle * Math.PI / 180);
  drawRouletteWheel();
  spinTimeout = setTimeout('rotateWheel()', 30);
}

function stopRotateWheel() {
  clearTimeout(spinTimeout);
  var degrees = startAngle * 180 / Math.PI + 90;
  var arcd = arc * 180 / Math.PI;
  var index = Math.floor((360 - degrees % 360) / arcd);
  ctx.save();
  ctx.font = 'bold 30px Helvetica, Arial';
  var text = options[index]
  ctx.fillText(text, 402 - ctx.measureText(text).width / 2, 320 + 10);
  ctx.restore();
  var spinButton = document.getElementById("spin");
  spinButton.disabled = false;
  spinButton.innerHTML = "J'AI FAIM !";
}

function easeOut(t, b, c, d) {
  var ts = (t/=d)*t;
  var tc = ts*t;
  return b+c*(tc + -3*ts + 3*t);
}

function httpGet(theUrl)
{
    if (window.XMLHttpRequest)
    {// code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp=new XMLHttpRequest();
    }
    else
    {// code for IE6, IE5
        xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange=function()
    {
        if (xmlhttp.readyState==4 && xmlhttp.status==200)
        {
            console.log("response " + xmlhttp.responseText);
            var arrayOfLines = xmlhttp.responseText.match(/[^\r\n]+/g);
            initData(arrayOfLines);
            drawRouletteWheel();
        }
    }
    xmlhttp.open("GET", theUrl, false );
    xmlhttp.send();    
}

$(document).ready(function () {
  httpGet(dataUrl); // get feed
});
