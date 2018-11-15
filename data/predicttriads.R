source("readData.R")

myid <- demographics.df$ppntID[1]
mytriads.df <- triads.df%>%filter(ppntID==myid)

calcobs.df <- data.frame();
scaleconstant = 2500;
for(i in 1:nrow(mytriads.df)){
    calcobs.df <- rbind(calcobs.df,data.frame(
                                       area=c(
                                           mytriads.df[i,"area1.scaled"],
                                           mytriads.df[i,"area2.scaled"],
                                           mytriads.df[i,"area3.scaled"]),
                                       trial=i
                                   )
                        )
}#end build calcobs
ordobs.df <- data.frame();
for(atrial in 1:nrow(mytriads.df)){
    for(anattribute in 1:2){
        for(option1 in 2:3){#'3' is up to stim per trial
            for(option2 in 1:(option1-1)){
                attributename <- c("NS","EW")[anattribute]
                ordobs.df <- rbind(ordobs.df,data.frame(
                                                 trial = atrial,
                                                 option1 = option1,
                                                 option2 = option2,
                                                 attribute = anattribute,
                                                 difference = mytriads.df[atrial,paste0(attributename,option1,".scaled")]-mytriads.df[atrial,paste0(attributename,option2,".scaled")],
                                                 matchstatus=mytriads.df[atrial,paste0("template",option1)]==mytriads.df[atrial,paste0("template",option2)]
                                             )
                                   )
            }#end for option2
        }#end for option1
    }#end for each attribute
}#end build ordobs

datalist = list(hm_stim=nrow(calcobs.df),
                calcobs=calcobs.df$area,
                calcobs_noise= .1,#TODO
                trial=calcobs.df$trial,
                hm_ordobs=nrow(ordobs.df),
                ordobs_noise = .1,#TODO
                tolerance = .1, #TODO
                ordobs_trial = ordobs.df$trial,
                ordobs_option1 = ordobs.df$option1,
                ordobs_option2 = ordobs.df$option2,
                ordobs_attribute = ordobs.df$attribute,
                ordobs_diff = ordobs.df$diff
                )

fit_allords <- stan(file="triad_choices.stan",
            data=datalist,
            iter=1000,
            chains=4,
            init=function(){
                initattrs <- rep(1.5,nrow(calcobs.df)*2) #Need to consider what counts as a good init value. targ/comp are 1:2 and 2:1 after scalingfactor.
                dim(initattrs)=c(nrow(calcobs.df),2)
                list(est_option_attribute=initattrs)
            },##Sanity check on these inits: hist(with(triadsdata.df,c(scaled.NS1,scaled.NS2,scaled.NS3,scaled.EW1,scaled.EW2,scaled.EW3)))
            control=list(max_treedepth=15,adapt_delta=.9)
            )

