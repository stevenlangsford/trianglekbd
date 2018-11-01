//All global vars here:
var trials = [];
var trialindex = 0;
const canvassize = 150*3;//roughly three max triangle widths. Which is more than you need 'cause they're in a circle not a line.

//admin/helper functions
function shuffle(a) { //via https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function keyboardListener(event) {
    var x = event.key;
    if(trialindex<trials.length)trials[trialindex].getResponse(event.key);
}
document.addEventListener('keydown', keyboardListener)

function nextTrial(){
    if(trialindex<trials.length){
	trials[trialindex].drawMe("uberdiv");
    }else{
	$.post("/finish",function(data){window.location.replace(data)});
    }
}

//End admin. Stim specific setup:
function triangle(base,height,templatetype, orientation){
    this.base = base;
    this.height = height;
    this.templatetype = templatetype;    
    this.orientation = parseInt(orientation); //init triangle is drawn 'vertical', below apply rotations until this is true.

    //convert to cords so you can draw the thing.
    this.x1=0;
    //	this.x2 varies by template type:
    this.x3=base;
    this.y1=0;
    this.y2=height;
    this.y3=0;
    
    if(templatetype=="rightangle"){
	this.x2=0;
    }
    else if(templatetype=="equilateral"){
	this.x2=base/2;
    }
    else if(templatetype=="skew"){
	this.x2=base/4;
    }
    else{
	console.log("bad template:"+templatetype+" for "+base+":"+height);
    }

    for(var i=0;i<orientation;i++){
	var newx1=-this.y1; //rot90. Init vals are for N orientation, spin to match requested oriantation.
	var newx2=-this.y2;
	var newx3=-this.y3;
	var newy1=this.x1;
	var newy2=this.x2;
	var newy3=this.x3;

	this.x1=newx1;
	this.x2=newx2;
	this.x3=newx3;
	this.y1=newy1;
	this.y2=newy2;
	this.y3=newy3;
    }

    this.cloneme = function(){//This is probably redundant and useless. But, js is literally satan. Never do anything 'in place' just in case.
	return new triangle(this.base, this.height, this.templatetype,this.orientation);
    }

    this.area = function(){
	//heron's formula, because 'base' and 'height' are visually obvious (i hope?) but annoying in xycords land.
	function linelength(x1,y1,x2,y2){
	    var a = x2-x1;
	    var b = y2-y1;
	    return Math.sqrt(a*a+b*b)
	}
	var a = linelength(this.x1,this.y1,this.x2,this.y2);
	var b = linelength(this.x2,this.y2,this.x3,this.y3);
	var c = linelength(this.x3,this.y3,this.x1,this.y1);
	var s = (a+b+c)/2;
	return Math.sqrt(s*(s-a)*(s-b)*(s-c));
    }
    
    this.rotate90 = function(){//swaps width & height while preserving similarity properties

	return new triangle(this.base,this.height, this.templatetype,(this.orientation+1)%4);
    }

    this.NorthSouth = function(){
	if(this.orientation==0||this.orientation==2) return this.height;
	else return this.base;
    }
    this.EastWest = function(){
	if(this.orientation==0||this.orientation==2) return this.base;
	else return this.height;
    }

    this.drawoffset_x = function(){
    	var leftmost = Math.min(this.x1,this.x2,this.x3);
    	var rightmost = Math.max(this.x1,this.x2,this.x3);
	
    	if(this.orientation==0) return -this.EastWest()/2;
    	if(this.orientation==2) return this.EastWest()/2;
    	return 0;
    }
    this.drawoffset_y = function(){
    	if(this.orientation==1) return -this.NorthSouth()/2;
    	if(this.orientation==3) return this.NorthSouth()/2;
    	return 0;
    }

    this.leftmost = function(){
	return	Math.min(this.x1,this.x2,this.x3);
    }
    this.lowest = function(){
	return	Math.max(this.y1,this.y2,this.y3);
    }

    this.drawme = function(canvas,shiftx,shifty,color){
	var leftmost = Math.min(this.x1,this.x2,this.x3);
	var highest = Math.min(this.y1,this.y2,this.y3);
	var rightmost = Math.max(this.x1,this.x2,this.x3);
	var lowest = Math.max(this.y1,this.y2,this.y3);
	var width = rightmost-leftmost;
	var height = lowest-highest;
	

	if (canvas.getContext) {
	    var ctx = canvas.getContext('2d');
	    ctx.fillStyle=color;
	    ctx.beginPath();
	    ctx.moveTo(this.x1+shiftx,this.y1+shifty);
	    ctx.lineTo(this.x2+shiftx,this.y2+shifty);
	    ctx.lineTo(this.x3+shiftx,this.y3+shifty);
	    ctx.fill();
	}
    }
}//end triangle

function trialobj(x1,y1,x2,y2,x3,y3,shapetypes,roles,orientations,stimid){
    this.drawtime = "init";
    this.shape_mapping = shuffle(["rightangle","equilateral","skew"]);//note randomized just once at creation... if you repeat stim by revisting a trialobj, this choice will stay the same. No plans to revisit stim though ATM?
    this.orientations = orientations;
    
    var scalefactor = 100;
    x1=x1*scalefactor;
    x2=x2*scalefactor;
    x3=x3*scalefactor;
    y1=y1*scalefactor;
    y2=y2*scalefactor;
    y3=y3*scalefactor;
    
    var triangles = [new triangle(x1,y1,this.shape_mapping[shapetypes[0]],this.orientations[0]),
		       new triangle(x2,y2,this.shape_mapping[shapetypes[1]],this.orientations[1]),
		       new triangle(x3,y3,this.shape_mapping[shapetypes[2]],this.orientations[2])];
    
    this.triangles = triangles;
    this.roles = roles;
    this.presentation_position = shuffle([0,1,2]);
    this.stimid = stimid;
    this.hm_rotations = shuffle([0,1,2,3])[0]; //canonical orientation is tall (N), randomize so NSEW versions all presented.
    
    for(var i=0;i<this.hm_rotations;i++){
    	for(var j=0;j<this.triangles.length;j++)this.triangles[j]=this.triangles[j].cloneme().rotate90();//whee
    }

    this.drawMe = function(targdiv){
	this.drawtime=Date.now();
	document.getElementById(targdiv).innerHTML = "<h3>Use the arrow keys to select the largest triangle</h3><table style='border:solid 3px black'>"+//haha, tables. Oh dear.
	"<tr><td colspan='2' align='center' class='buttontd'><img src='img/uparrow.png' height=50,width=50></td></tr>"+
	    "<tr><td colspan='2' align='center'><canvas id='stimcanvas' width='"+canvassize+"' height='"+(canvassize*.9)+"'></canvas></td></tr>"+
	    "<tr><td align='left' class='buttontd'><img src='img/leftarrow.png' height=50,width=50></td><td align='right' class='buttontd'><img src='img/rightarrow.png' height=50,width=50></td></tr>";
	
	var d = canvassize/5; //distance apart
	var jitter = 10; //jitter less critical now that there's no clear alignment issue, but might be nice mitigation of possible orientation dist-artifacts.
	var rot_offset = Math.PI;
	var center_x = canvassize/2;
	var center_y = canvassize/2;


	//in polar cords, position1 is (d,0)
	//position 2 is (d, 2pi/3)
	//position 3 is (d, 4pi/3)

	// so pos 1 in rect cords is: d*cos(0),d*sin(0) = (d,0)
	// pos 2 is d*cos(2pi/3), d*sin(2pi/3)
	//pos 3 is d*cos(4pi/3), d*sin(4pi/3)
	

	this.triangles[this.presentation_position[0]].drawme(document.getElementById('stimcanvas'),
							jitter*Math.random()-jitter/2+center_x+this.triangles[this.presentation_position[0]].drawoffset_x()+d,
							jitter*Math.random()-jitter/2+center_y+this.triangles[this.presentation_position[0]].drawoffset_y(),
						       "black");

	this.triangles[this.presentation_position[1]].drawme(document.getElementById('stimcanvas'),
							jitter*Math.random()-jitter/2+center_x+this.triangles[this.presentation_position[1]].drawoffset_x()+d*Math.cos(2.0/3.0*Math.PI),
							jitter*Math.random()-jitter/2+center_y+this.triangles[this.presentation_position[1]].drawoffset_y()+d*Math.sin(2.0/3.0*Math.PI),
						       "black");
	
	this.triangles[this.presentation_position[2]].drawme(document.getElementById('stimcanvas'),
							jitter*Math.random()-jitter/2+center_x+this.triangles[this.presentation_position[2]].drawoffset_x()+d*Math.cos(4.0/3.0*Math.PI),
							jitter*Math.random()-jitter/2+center_y+this.triangles[this.presentation_position[2]].drawoffset_y()+d*Math.sin(4.0/3.0*Math.PI),
							"black"); //colors useful for diag/dev. Could also be used as a fun manipulation to do things to the similarity structure? Could be a fun companion study?
	
	//diag center pointer:
	// var ctx = document.getElementById('stimcanvas').getContext('2d');
	// ctx.fillStyle="black";
	// ctx.fillRect(center_x,center_y,15,15)
	//end diag

    }// drawme
    

    this.getResponse = function(aresponse){
	var choiceindex; //translate response into an index for 'this'. alts are (choiceindex+1)%3 and (choiceindex+2)%3
	switch(aresponse){
	case("ArrowLeft"):
	    choiceindex=1;
	    // console.log(
	    // 	shape_mapping[shapetypes[this.presentation_position[1]]]
	    // );
	    break;
	case("ArrowRight"):
	    choiceindex=0;
	    // console.log(
	    // 	shape_mapping[shapetypes[this.presentation_position[0]]]
	    // 	       )
	    break;
	case("ArrowUp"):
	    choiceindex=2;
	    // console.log(
	    // 	shape_mapping[shapetypes[this.presentation_position[2]]]
	    // )
	    break;
	default:
	    console.log("Bad response: "+aresponse);
	    return; //filter to legal responses.
	}
	var alt1 = (choiceindex+1)%3;//named just to make assigning stuff to the output obj super readable.
	var alt2 = (choiceindex+2)%3;

	//Things you want to write out: response sensitive.
	var output = {};
	output.responsekey= aresponse;
	output.responsetime = Date.now();
	output.drawtime = this.drawtime;
	output.responseinterval = output.responsetime - output.drawtime;
	output.ppntID = localStorage.getItem("ppntID");
	
	output.area_chosen= this.triangles[choiceindex].area();
	output.area_alt1= this.triangles[alt1].area();
	output.area_alt2=this.triangles[alt2].area();

	output.role_chosen=this.roles[choiceindex];
	output.role_alt1=this.roles[alt1];
	output.role_alt2=this.roles[alt2];

	output.NS_chosen=this.triangles[choiceindex].NorthSouth();
	output.EW_chosen=this.triangles[choiceindex].EastWest();
	output.NS_alt1=this.triangles[alt1].NorthSouth();
	output.EW_alt1=this.triangles[alt1].EastWest();
	output.NS_alt2=this.triangles[alt2].NorthSouth();
	output.EW_alt2=this.triangles[alt2].EastWest();

	output.template_chosen= this.shape_mapping[shapetypes[this.presentation_position[choiceindex]]];
	output.template_alt1= this.shape_mapping[shapetypes[this.presentation_position[alt1]]];
	output.template_alt2= this.shape_mapping[shapetypes[this.presentation_position[alt2]]];

	output.orientation_chosen = this.triangles[choiceindex].orientation;
	output.orientation_alt1 = this.triangles[alt1].orientation;
	output.orientation_alt2 = this.triangles[alt2].orientation;
	
	output.presentationshuffle = this.presentation_position;

	console.log(output);
	//TODO: Save output to a db (check 'response' is right: there are different ones for pairs and triples now eh.)
	//     $.post('/response',{myresponse:JSON.stringify(trials[trialindex])},function(success){
//     	console.log(success);//For now server returns the string "success" for success, otherwise error message.
	//     });

	trialindex++;
	nextTrial();

    }
}//end trialobj

//end stim setup.
//****************************************************************************************************
//MAIN
trials.push(new trialobj(1,1,1.2,.8,1,.7,[0,1,2],["oneone","1p2,p8","1,p7"],[0,0,0],"test1"))

nextTrial();//go! Walks through each trial calling drawme and directing kbd responses to the current trialobj.
