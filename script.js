const canvas=document.querySelector('#drawing_canvas')
canvas.width=window.innerWidth-20
canvas.height=window.innerHeight-110
let draw=canvas.getContext('2d')

let backupDrawing=[]
let backupAction=[]
let backupIndex=-1
let isDrawing=false
let smoothTrace=false
let color='black'
let width='2'
let eraser=false

function saveDrawing(){
  backupDrawing.push(draw.getImageData(0,0,canvas.width,canvas.height))
  backupIndex++
  console.log(backupDrawing)
  // backupAction.push()
}
function saveErasing(){
  backupDrawing.push(draw.getImageData(0,0,canvas.width,canvas.height))
  backupIndex++
  console.log(backupDrawing)
  // backupAction.push()
}

//drawing
//for smoothness
let prevX, prevY;

function drawIT(mouse) {
  if (isDrawing) {
    const x = mouse.clientX - canvas.offsetLeft;
    const y = mouse.clientY - canvas.offsetTop;

    if (prevX !== undefined && prevY !== undefined) {
      draw.beginPath();
      if(smoothTrace)
        draw.moveTo(prevX, prevY);
      else
        draw.moveTo(x,y)
      draw.lineTo(x, y);
      draw.strokeStyle = color;
      draw.lineWidth = width;
      draw.lineCap = "round";
      draw.lineJoin = "round";
      draw.stroke();
    }

    prevX = x;
    prevY = y;
    //next line to on move should be smooth so trace from previous point
    smoothTrace=true 
    mouse.preventDefault();
      }
}


function startDrawing(mouse){
  //stop tracing this is new line
  smoothTrace=false 
  isDrawing=true
  draw.beginPath()
  draw.moveTo(mouse.clientX-canvas.offsetLeft,mouse.clientY-canvas.offsetTop)
  mouse.preventDefault()
  // draw.moveTo(0,0)
}

function stopDrawing(mouse){
  if(isDrawing){
    draw.closePath()
    isDrawing=false
  }
  mouse.preventDefault()
  if(mouse.type!='mouseout'){
    
    saveDrawing()
  }
}

//eraser
function eraseIT(mouse){

}

function startErasing(mouse){

}

function stopErasing(mouse){

}


function clear(){
  backupDrawing=[]
  backupIndex=-1
  draw.clearRect(0,0,canvas.width,canvas.height)
}

function undo(){
  if(backupIndex<=0){
    clear()
    return
  }
  else{
    backupIndex-=1
    backupDrawing.pop()
    draw.putImageData(backupDrawing[backupIndex], 0,0)
  } 
}

//******* Event Listener ********

window.addEventListener('resize',()=>{
  canvas.width=window.innerWidth-20
  canvas.height=window.innerHeight-110
})

//change color and width
document.querySelectorAll('.basic_color_picker').forEach((picker)=>{
  picker.addEventListener('click',()=>color=window.getComputedStyle(picker).backgroundColor)
})

const advancedPicker=document.getElementById('color_picker')
advancedPicker.addEventListener('input',()=>color=advancedPicker.value)

const widthPicker=document.getElementById('width_setter')
widthPicker.addEventListener('input',()=>width=widthPicker.value)

//draw
canvas.addEventListener("touchstart",startDrawing,false)
canvas.addEventListener("mousedown",startDrawing,false)
canvas.addEventListener("touchmove",drawIT,false)
canvas.addEventListener("mousemove",drawIT,false)
canvas.addEventListener("touchend",stopDrawing,false)
canvas.addEventListener("mouseup",stopDrawing,false)
canvas.addEventListener("mouseout",stopDrawing,false)

//eraser
const pencilEraser=document.querySelector('.pen_eraser img')
pencilEraser.addEventListener('click',(mouse)=>{
  if(!eraser){
    eraser=true
    pencilEraser.setAttribute('src','./image/pencil.png')
    //now eraser
    canvas.removeEventListener("touchstart",startDrawing,false)
    canvas.removeEventListener("mousedown",startDrawing,false)
    canvas.addEventListener("touchstart",startErasing,false)
    canvas.addEventListener("mousedown",startErasing,false)
  }
  else{
    eraser=false
    pencilEraser.setAttribute('src','./image/eraser.png')
    //now pencil
    canvas.removeEventListener("touchstart",startErasing,false)
    canvas.removeEventListener("mousedown",startErasing,false)
    canvas.addEventListener("touchstart",startDrawing,false)
    canvas.addEventListener("mousedown",startDrawing,false)
  }
})

//undo and clear canvas
document.getElementById('undo').addEventListener('click',undo)
document.getElementById('clear').addEventListener('click',clear)

// document.addEventListener('contextmenu', function(e) {
//   e.preventDefault();
// });
// document.addEventListener('keydown', function(e) {
//   if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'U')) {
//     e.preventDefault();
//   }
// });