var cxt = document.getElementById("canvasId").getContext("2d");
var canvas = document.getElementById('canvasId');


var users = JSON.parse((document.getElementById("users").innerHTML));
console.log(users.size)

var i = 0;
users.forEach(element => {   
    console.log(element.postCount);
    cxt.fillStyle = "yellow";
    cxt.fillRect(i * 20, element.postCount+1 * 10, 10, canvas.height);
    i++;
    console.log(i);
});

cxt.fillStyle = "yellow";
cxt.fillRect(0, 0, 10, 10);

function drawRect(x, y, size, r, g, b)
{
    ctx.fillStyle = "rgb("+r+", "+g+", "+b+")";
    ctx.fillRect(x-size/2, y-size/2, size , size);
}