function setup() {
  createCanvas(400, 400);
  background(220,0,0)
}

function draw() {
   
  //clear()
  
  // red value
  let r = map (mouseX,0,width,0,255)
  let g = map (mouseY, 0,height,0,255)
  let size= map(mouseX*mouseY,0,width*height,2,20)
  
  fill(r,mouseY,150)
  noStroke()
  ellipse(mouseX,mouseY,size,size)
  
  fill(255)
  textSize(30)
  //text(mouseX,mouseX,mouseY)
  
}