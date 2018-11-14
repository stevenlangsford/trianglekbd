source("readData.R")

myid <- demographics.df$ppntID[1]
mytriads.df <- triads.df%>%filter(ppntID==myid)

calcobs.df <- data.frame();
scaleconstant = 2500;
for(i in 1:nrow(mytriads.df)){
    calcobs.df <- rbind(calcobs.df,data.frame(
                                       area=c(
                                           mytriads.df[i,"area_chosen"]/scaleconstant,
                                           mytriads.df[i,"area_alt1"]/scaleconstant,
                                           mytriads.df[i,"area_alt2"]/scaleconstant),
                                       trial=i
                                   )
                        )
}
datalist = list(hm_stim=nrow(calcobs),
                calcobs=calcobs.df$area,
                calcobs_noise= .1,
                trial=calcobs.df$trial

                )
                
##                 HERE BE DRAGONS
