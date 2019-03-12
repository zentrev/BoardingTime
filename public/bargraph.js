var ctx = document.getElementById("canvasId").getContext("2d");
var canvas = document.getElementById('canvasId');
canvas.width  = document.body.clientWidth-40;
canvas.height = window.screen.height-300;
if(canvas.height < 300) canvas.height = 300;

var users = JSON.parse((document.getElementById("users").innerHTML));
console.log(users.size)

var usersCount = 0;
var maxPost = 0;
users.forEach(element => {
    usersCount++;
    if(element.postCount > maxPost)
    {
        maxPost = element.postCount;
    }
});

var BarWidth = canvas.width/usersCount;
var BarHight = canvas.height/maxPost;

var i = 0;
users.forEach(element => {   
    const image = new Image(BarWidth, BarHight * parseInt(element.postCount)); // Using optional size for image
    image.pos = i;
    image.onload = drawImage;
    image.src = 'profiles/' + element.avatar;
    i++;
});

function drawRect(x, y, size, r, g, b)
{
    ctx.fillStyle = "rgb("+r+", "+g+", "+b+")";
    ctx.fillRect(x-size/2, y-size/2, size , size);
}

function drawImage() {
    ctx.drawImage(this, (this.pos) * BarWidth, canvas.height - (this.height), this.width, this.height);
}