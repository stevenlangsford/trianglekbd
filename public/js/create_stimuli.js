//TRIAD STIM SETUP PARAMS
var templatetypes = [[0,0,0],[0,0,1],[0,1,0],[1,0,0],[0,1,2]]; //all match, odd decoy, odd competitor, odd target, nothing-matches.
var decoy_distances = [.4,.35,.3,.25,.2,.15,.1].map(Math.sqrt); //assume target and competitor are x=1,y=1,area = 1/2, this is brain-friendly and stan-friendly. Actual screen sizes are this * scalefactor. Sqrt just means these are expressed in terms of area, side lengths are targ[x,y]*decoy_distance, area is decoydistance of targ.
var winner_distances = [1.1,1.2,1.3].map(Math.sqrt); //You don't need as many winner trials as test trials. .1 winners might be hard, interesting for accuracy, .2 and .3 are attn checks.
var timelimit = 3500;

//for each templatetype and each distance, generate an example (attraction-style) stim for time limited an no-limit conditions, randomizing orientations and whether the target is tall or wide.

//storage bins
var nolimit_trials = [];
var limit_trials = [];

//create stim
for(var whichtemplate = 0; whichtemplate < templatetypes.length; whichtemplate++){
    for(var whichdecoydist = 0; whichdecoydist<decoy_distances.length;whichdecoydist++){
	//trialobj(x1,y1,x2,y2,x3,y3,shapetypes,roles,orientations,stimid,timelimit){
	var targlocation = Math.random()<0.5; //if true, targ is tall, if false, targ is wide.
	var targX = targlocation ? 1 : .5;
	var targY = targlocation ? .5 : 1;
	var compX = targlocation ? .5 : 1;
	var compY = targlocation ? 1 : .5;
	var decoyX = targX*decoy_distances[whichdecoydist];
	var decoyY = targY*decoy_distances[whichdecoydist];
	nolimit_trials.push(new trialobj(targX,targY,
					    compX,compY,
					    decoyX,decoyY,
					    templatetypes[whichtemplate],roles=["targ","comp","decoy"],
					    [Math.floor(Math.random()*4),Math.floor(Math.random()*4),Math.floor(Math.random()*4)],//?? check
					 "att"+templatetypes[whichtemplate][0]+templatetypes[whichtemplate][1]+templatetypes[whichtemplate][2]+decoy_distances[whichdecoydist,Infinity]));
		limit_trials.push(new trialobj(targX,targY,
					    compX,compY,
					    decoyX,decoyY,
					    templatetypes[whichtemplate],roles=["targ","comp","decoy"],
					    [Math.floor(Math.random()*4),Math.floor(Math.random()*4),Math.floor(Math.random()*4)],//?? check
					 "att"+templatetypes[whichtemplate][0]+templatetypes[whichtemplate][1]+templatetypes[whichtemplate][2]+decoy_distances[whichdecoydist,timelimit]));
						    
			       
    }
    for(var whichwinnerdist = 0; whichwinnerdist<winner_distances.length;whichwinnerdistance++){
	var targlocation = Math.random()<0.5; //if true, targ is tall, if false, targ is wide.
	var targX = targlocation ? 1 : .5;
	var targY = targlocation ? .5 : 1;
	var compX = targlocation ? .5 : 1;
	var compY = targlocation ? 1 : .5;
	var decoyX = targX*winner_distances[whichwinnerdist];
	var decoyY = targY*winner_distances[whichwinnerdist];

	nolimit_trials.push(new trialobj(targX,targY,
					    compX,compY,
					    decoyX,decoyY,
					    templatetypes[whichtemplate],roles=["targ","comp","decoy"],
					    [Math.floor(Math.random()*4),Math.floor(Math.random()*4),Math.floor(Math.random()*4)],//?? check
					 "win"+templatetypes[whichtemplate][0]+templatetypes[whichtemplate][1]+templatetypes[whichtemplate][2]+decoy_distances[whichdecoydist,Infinity]));
		limit_trials.push(new trialobj(targX,targY,
					    compX,compY,
					    decoyX,decoyY,
					    templatetypes[whichtemplate],roles=["targ","comp","decoy"],
					    [Math.floor(Math.random()*4),Math.floor(Math.random()*4),Math.floor(Math.random()*4)],//?? check
					 "win"+templatetypes[whichtemplate][0]+templatetypes[whichtemplate][1]+templatetypes[whichtemplate][2]+decoy_distances[whichdecoydist,timelimit]));
    }
}

//PAIR SETUP PARAMS
var pair_trials = [];
var pairmin = .8;
var pairmax = 1.2;

var hm_eachpair = 6; //total stim is this * 9.

var triangletypes = ["equilateral","rightangle","skew"];
for(var rep=0;rep<hm_eachpair;rep++){
    for(var i=0;i<triangletypes;i++){
	for(var j=0;j<triangletypes;j++){
	    var x1 = Math.random()*(pairmax-pairmin)+pairmin;
	    var y1 =Math.random()*(pairmax-pairmin)+pairmin;
	    var x2 = Math.random()*(pairmax-pairmin)+pairmin;
	    var y2 = Math.random()*(pairmax-pairmin)+pairmin;
	    var stimname = "pair"+
		(Math.round(x1*100)/100)+
		"_"+(Math.round(y1*100)/100)+
		"_"+(Math.round(x2*100)/100)+
		"_"+(Math.round(y2*100)/100)+
		"_"+triangletypes[i]+triangletypes[j];	
	    pair_trials.push(new pairobj(x1,y1,x2,y2,
					 triangletypes[i],triangletypes[j],
					 stimname)
			    )
	}
    }
}//end for each rep


shuffle(nolimit_trials)
shuffle(limit_trials)
shuffle(pair_trials)

pair_trials = [new spacerobj("Please use the arrow keys to pick the triangle with the biggest area, or press the up arrow if they're the same.")].concat(pair_trials);
nolimit_trials = [new spacerobj("These trials have no time limit. Please use the arrow keys to pick the triangle with the biggest area.")].concat(nolimit_trials)
limit_trials = [new spacerobj("These are timed trials. Please use the arrow keys to pick the triangle with the biggest area. Please be as accurate as you can without going over the 3 second time limit. If you go over the time limit, an annoying reminder message will appear before the next trial.")].concat(limit_trials);

var limitfirst = Math.random()<.5;

trials = trials.concat([pair_trials, limitfirst ? limit_trials : nolimit_trials, limitfirst ? nolimit_trials : limit_trials]);
