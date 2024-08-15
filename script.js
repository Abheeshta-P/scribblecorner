const canvas=document.querySelector('#drawing_canvas')
canvas.width=window.innerWidth-20
canvas.height=window.innerHeight-110
let draw=canvas.getContext('2d')

const widthPicker=document.getElementById('width_setter')
const advancedPicker=document.getElementById('color_picker')
const pencilEraser=document.querySelector('.pen_eraser img')
const toolBox=document.querySelector('.tool_box')

let backupDrawing=[]
let backupIndex=-1
let isDrawing=false
let smoothTrace=false
let eraser=false
let isErasing=false
let x,y
//for smoothness
let prevX, prevY
let color='black'
let width=widthPicker.value


function getMouseData(mouse){
   x = mouse.clientX - canvas.offsetLeft
   y = mouse.clientY - canvas.offsetTop
}

function saveCanvasState(){
   // Convert canvas content to a data URL (base64 encoded)
   const canvasData = canvas.toDataURL();
   // Save the canvasData to localStorage 
   localStorage.setItem('canvasState', canvasData);
}

function loadContent() {
  const imageDataUrl = localStorage.getItem('canvasState')
  if (imageDataUrl) {
    const img = new Image()
    img.src = imageDataUrl
    img.onload = () => {
      draw.clearRect(0, 0, canvas.width, canvas.height)
      draw.drawImage(img, 0, 0)
    }
  }
}


function saveDrawing() {
  const imageData = draw.getImageData(0, 0, canvas.width, canvas.height)
  backupDrawing.push(imageData)
  backupIndex++
  saveCanvasState()
}

//drawing

function drawIT(mouse) {
  if (isDrawing) {
    getMouseData(mouse)

    if (prevX !== undefined && prevY !== undefined) {
      draw.beginPath()
      if(smoothTrace)
        draw.moveTo(prevX, prevY)
      else
        draw.moveTo(x,y)
      draw.lineTo(x, y)
      draw.strokeStyle = color
      draw.lineWidth = width
      draw.lineCap = "round"
      draw.lineJoin = "round"
      draw.stroke()
    }

    prevX = x
    prevY = y
    //next line to on move should be smooth so trace from previous point
    smoothTrace=true 
    mouse.preventDefault()
 }
}

function startDrawing(mouse) {
  // Stop tracing as this is a new line
  smoothTrace = false
  isDrawing = true
  
  getMouseData(mouse)
  
  draw.beginPath()
  draw.moveTo(x,y)

}

function stopDrawing(mouse) {
  if (isDrawing) {
    draw.closePath()
    isDrawing = false
    saveDrawing()
    prevX=undefined
    prevY=undefined
  }
}

//eraser

function eraseIT(mouse){
  if(isErasing){
    getMouseData(mouse)
    draw.save()
    //The area where the new drawing overlaps with the existing content will be erased.
    draw.globalCompositeOperation = 'destination-out'
    draw.lineWidth = width // Eraser width
    draw.beginPath()
    draw.moveTo(x, y)
    const eraseX = x + 1
    const eraseY = y + 1
    draw.lineTo(eraseX, eraseY) // Small line to act as an eraser point
    draw.stroke()
    draw.restore()
    mouse.preventDefault()
    // save() and restore() are used to temporarily change the drawing settings (like the composite operation) without affecting other parts of the canvas.
  }
}

function startErasing(mouse){
  isErasing=true
  mouse.preventDefault()
}

function stopErasing(mouse){
  if(isErasing){
    isErasing=false
    prevX=undefined
    prevY=undefined
    saveDrawing()
  }
  mouse.preventDefault()
}

function clear(){
  backupDrawing=[]
  backupIndex=-1
  draw.clearRect(0,0,canvas.width,canvas.height)
}

function undo(mouse){
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
  loadContent()
})

window.addEventListener('load',loadContent)

toolBox.addEventListener('mouseenter',()=>{
  stopDrawing()
  stopErasing()
})

//change color and width
document.querySelectorAll('.basic_color_picker').forEach((picker)=>{
  picker.addEventListener('click',()=> color=window.getComputedStyle(picker).backgroundColor)
})

advancedPicker.addEventListener('input',()=> color=advancedPicker.value)

widthPicker.addEventListener('input',()=>width=widthPicker.value)

//draw
canvas.addEventListener("touchstart",startDrawing,false)
canvas.addEventListener("mousedown",startDrawing,false)
canvas.addEventListener("touchmove",drawIT,false)
canvas.addEventListener("mousemove",drawIT,false)
canvas.addEventListener("touchend",stopDrawing,false)
canvas.addEventListener("mouseup",stopDrawing,false)
// canvas.addEventListener("mouseout",stopDrawing,false)

//eraser
canvas.addEventListener("touchmove",eraseIT,false)
canvas.addEventListener("mousemove",eraseIT,false)
canvas.addEventListener("touchend",stopErasing,false)
canvas.addEventListener("mouseup",stopErasing,false)
// canvas.addEventListener("mouseout",stopErasing,false)


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

document.addEventListener('contextmenu', function(e) {
  e.preventDefault()
})
document.addEventListener('keydown', function(e) {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'U')) {
    e.preventDefault()
  }
})