library(tidyverse)
library(rstan)
library(shinystan)

#just here because this has the library loads, now it's become a generic setup point.
options(mc.cores = parallel::detectCores())
rstan_options(auto_write = TRUE)
theme_set(theme_light())

#actual data read, with some munging.
demographics.df <- read.csv("rawdata/demographicsdata.csv")
pairs.df <- read.csv("rawdata/pairsdata.csv")%>%mutate(area1=x1*y1/2,
                                                       area2=x2*y2/2
                                                       )
for(i in 1:nrow(pairs.df)){ #grr so ugly. Cause is flip-flopping on how responses are recorded, by position or by chosen area, both are inconvenient somewhere.
    if(pairs.df$responsekey[i]=="ArrowUp"){pairs.df$choicenumber[i]=2; next;}
    if(pairs.df$presentation_position[i]=="[0,1]"){
        if(pairs.df$responsekey[i]=="ArrowLeft"){
            pairs.df[i,"choicenumber"]=1
        }else{pairs.df[i,"choicenumber"]=3}
    }else{
        if(pairs.df$responsekey[i]=="ArrowLeft"){
            pairs.df[i,"choicenumber"]=3
        }else{pairs.df[i,"choicenumber"]=1}
    }
}#for each row in pairs


##choice-format areas and sides are for human consumption, left in origin units. location-format ones are for model consumption, multiplied through by a scaling factor so that they're friendly numbers-around-1.
scalingconstant = 2500;
triads.df <- read.csv("rawdata/responsedata.csv")%>%mutate(area_chosen=round(area_chosen),#rounding removes insane invisible 10^-13 dust
                                                           area_alt1=round(area_alt1),
                                                           area_alt2=round(area_alt2),
                                                           bestanswer=pmax(area_chosen,area_alt1,area_alt2),
                                                           diff.from.best = area_chosen-bestanswer,
                                                           area1.scaled=area1/scalingconstant,
                                                           area2.scaled=area2/scalingconstant,
                                                           area3.scaled=area3/scalingconstant,
                                                           NS1.scaled=NS1/sqrt(scalingconstant),
                                                           NS2.scaled=NS2/sqrt(scalingconstant),
                                                           NS3.scaled=NS3/sqrt(scalingconstant),
                                                           EW1.scaled=EW1/sqrt(scalingconstant),
                                                           EW2.scaled=EW2/sqrt(scalingconstant),
                                                           EW3.scaled=EW3/sqrt(scalingconstant)
                                                           )

#TODO, exclusion criteria (accuracy check on triads data with winners?) goes here.
