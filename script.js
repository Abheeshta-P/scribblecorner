const canvas=document.querySelector('#drawing_canvas')
canvas.width=window.innerWidth-20
canvas.height=window.innerHeight-110
let draw=canvas.getContext('2d')

const widthPicker=document.getElementById('width_setter')
const advancedPicker=document.getElementById('color_picker')
const pencilEraser=document.querySelector('.pen_eraser img')

let backupDrawing=[]
let backupAction=[]
let currentPath=[]
let backupIndex=-1
let isDrawing=false
let smoothTrace=false
let eraser=false
let isErasing=false
let prevX, prevY
let startX,startY,endX,endY
let color='black'
let width=widthPicker.value
//for smoothness


function redrawIT() {
  smoothTrace = true
  draw.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas

  backupAction.forEach(action => {
    draw.beginPath()
    action.path.forEach((point, index) => {
      if (index === 0) {
        draw.moveTo(point.x, point.y)
      } else {
        draw.lineTo(point.x, point.y)
      }
    })
    draw.strokeStyle = action.color
    draw.lineWidth = action.width
    draw.lineCap = "round"
    draw.lineJoin = "round"
    draw.stroke()
    draw.closePath()
  })

  smoothTrace = false
}

function saveDrawing() {
  // backupDrawing.push(draw.getImageData(0,0,canvas.width,canvas.height))
  // console.log(backupDrawing)
  // Save the drawing action with all necessary properties
  backupAction.push({
    path: [...currentPath], // Store the entire path
    color: color,
    width: width
  })
  backupIndex++
  currentPath = []
}

//drawing

function drawIT(mouse) {
  if (isDrawing||isErasing) {
    const x = mouse.clientX - canvas.offsetLeft
    const y = mouse.clientY - canvas.offsetTop

    if (prevX !== undefined && prevY !== undefined) {
      draw.beginPath()
      if(smoothTrace)
        draw.moveTo(prevX, prevY)
      else
        draw.moveTo(x,y)
      draw.lineTo(x, y)
      currentPath.push({ x, y }) // Store the current point
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
  
  startX = mouse.clientX - canvas.offsetLeft
  startY = mouse.clientY - canvas.offsetTop

  // currentPath = [{ x: startX, y: startY }] // Start a new path
  
  draw.beginPath()
  draw.moveTo(startX, startY)
  
  mouse.preventDefault()
}

function stopDrawing(mouse) {
  if (isDrawing) {
    draw.closePath()
    isDrawing = false
    
    if (currentPath.length > 1) {
      saveDrawing()
    }
    prevX=undefined
    prevY=undefined
  }

  mouse.preventDefault()
}


//eraser

 //splice can be put
function eraseIT(mouse){
//distance mouse and the line
  //which line is near to mouse
  if(isErasing){
    drawIT(mouse)
    mouse.preventDefault()
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
  }
  if (currentPath.length > 1) {
    saveDrawing()
  }
  mouse.preventDefault()
}

function clear(){
  // backupDrawing=[]
  backupIndex=-1
  backupAction=[]
  draw.clearRect(0,0,canvas.width,canvas.height)
}

function undo(mouse){
  if(backupIndex<=0){
    clear()
    return
  }
  else{
    backupIndex-=1
    backupAction.pop()
    redrawIT(mouse)
    // backupDrawing.pop()
    // draw.putImageData(backupDrawing[backupIndex], 0,0)
  } 
}

//******* Event Listener ********

window.addEventListener('resize',()=>{
  canvas.width=window.innerWidth-20
  canvas.height=window.innerHeight-110
})

//change color and width
document.querySelectorAll('.basic_color_picker').forEach((picker)=>{
  picker.addEventListener('click',()=>{
    if(!eraser)
    color=window.getComputedStyle(picker).backgroundColor
})
})


advancedPicker.addEventListener('input',()=>{
  if(!eraser)
    color=advancedPicker.value
})


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
    color='white'
    pencilEraser.setAttribute('src','./image/pencil.png')
    //now eraser
    canvas.removeEventListener("touchstart",startDrawing,false)
    canvas.removeEventListener("mousedown",startDrawing,false)
    canvas.addEventListener("touchstart",startErasing,false)
    canvas.addEventListener("mousedown",startErasing,false)
  }
  else{
    eraser=false
    color='black'
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
//   e.preventDefault()
// })
// document.addEventListener('keydown', function(e) {
//   if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I') || (e.ctrlKey && e.key === 'U')) {
//     e.preventDefault()
//   }
// })