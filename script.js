const canvas=document.querySelector('#drawing_canvas')
canvas.width=window.innerWidth-20
canvas.height=window.innerHeight-110
let draw=canvas.getContext('2d')

const widthPicker=document.getElementById('width_setter')
const advancedPicker=document.getElementById('color_picker')
const pencilEraser=document.querySelector('.pen_eraser img')
const toolBox=document.querySelector('.tool_box')
const downloadButton=document.querySelector('.download')

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
function getTouchData(mouse){
   x = mouse.touches[0].clientX - canvas.offsetLeft
   y = mouse.touches[0].clientY - canvas.offsetTop
}

function saveCanvasState(){
   // Convert canvas content to a data URL (base64 encoded)
   const canvasData = canvas.toDataURL()
   // Save the canvasData to localStorage 
   localStorage.setItem('canvasState', canvasData)
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
    if('ontouchstart' in window)
      getTouchData(mouse)
    else
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
  
  if('ontouchstart' in window)
    getTouchData(mouse)
  else
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
    if('ontouchstart' in window)
      getTouchData(mouse)
    else
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
}

function stopErasing(mouse){
  if(isErasing){
    isErasing=false
    prevX=undefined
    prevY=undefined
    saveDrawing()
  }
}

function clear(){
  backupDrawing=[]
  backupIndex=-1
  draw.clearRect(0,0,canvas.width,canvas.height)
  saveCanvasState()
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
    saveCanvasState()
  } 
}

function pencilEraserSwitcher(){
  if(!eraser){
    eraser=true
    pencilEraser.setAttribute('src','./images/pencil.png')
    pencilEraser.setAttribute('title','pencil')
    //now eraser
    canvas.removeEventListener("touchstart",startDrawing,false)
    canvas.removeEventListener("mousedown",startDrawing,false)
    canvas.addEventListener("touchstart",startErasing,false)
    canvas.addEventListener("mousedown",startErasing,false)
  }
  else{
    eraser=false
    pencilEraser.setAttribute('src','./images/eraser.png')
    pencilEraser.setAttribute('title','eraser')
    //now pencil
    canvas.removeEventListener("touchstart",startErasing,false)
    canvas.removeEventListener("mousedown",startErasing,false)
    canvas.addEventListener("touchstart",startDrawing,false)
    canvas.addEventListener("mousedown",startDrawing,false)
  }
}

// download image

function downloadImageWithBackground(backgroundOption) {
  console.log(`Downloading image with ${backgroundOption} background...`)
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  const tempCtx = tempCanvas.getContext('2d')


  if (backgroundOption === 'white') {
      tempCtx.fillStyle = 'white'
      tempCtx.fillRect(0, 0, canvas.width, canvas.height)
  } else if (backgroundOption === 'black') {
    tempCtx.fillStyle = 'black'
    tempCtx.fillRect(0, 0, canvas.width, canvas.height)
  } else if (backgroundOption === 'transparent') {
    tempCtx.clearRect(0, 0, canvas.width, canvas.height)
  }

  tempCtx.drawImage(canvas, 0, 0)
  const imageURL = tempCanvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = imageURL
  link.download = `image_${backgroundOption}.png`
  link.click()
}

//******* Event Listener ********

window.addEventListener('resize',()=>{
  canvas.width=window.innerWidth-20
  canvas.height=window.innerHeight-110
  loadContent()
})

window.addEventListener('load',loadContent)

toolBox.addEventListener('mouseenter',(mouse)=>{
  stopDrawing(mouse)
  stopErasing(mouse)
})
toolBox.addEventListener('touchstart',(mouse)=>{
  stopDrawing(mouse)
  stopErasing(mouse)
})

//change color and width
document.querySelectorAll('.basic_color_picker').forEach((picker)=>{
  picker.addEventListener('click',()=> color = window.getComputedStyle(picker).backgroundColor)
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


pencilEraser.addEventListener('click',pencilEraserSwitcher)

//undo and clear canvas
document.getElementById('undo').addEventListener('click',undo)

document.getElementById('clear').addEventListener('click',clear)


//for download
downloadButton.addEventListener('click',()=>{
  document.getElementById('backgroundModal').style.display = 'flex'
})

document.getElementById('cancelBtn').addEventListener('click', function() {
  document.getElementById('backgroundModal').style.display = 'none'
})


document.getElementById('confirmBtn').addEventListener('click', function() {
  const selectedBackground = document.querySelector('input[name="background"]:checked').value
  downloadImageWithBackground(selectedBackground)
  document.getElementById('backgroundModal').style.display = 'none'
})

document.querySelector('.modal').addEventListener('click',(e)=>{
 if(e.target===e.currentTarget){
   document.getElementById('backgroundModal').style.display = 'none'
 }
})

document.addEventListener('contextmenu', function(e) {
  e.preventDefault()
})
document.addEventListener('keydown', function(e) {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'U')) {
    e.preventDefault()
  }
})