library(tidyverse)
library(rstan)
library(shinystan)
rm(list=ls()) #don't forget this is here.

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

triads.df <- read.csv("rawdata/responsedata.csv")%>%mutate(area_chosen=round(area_chosen),#rounding removes insane invisible 10^-13 dust
                                                           area_alt1=round(area_alt1),
                                                           area_alt2=round(area_alt2),
                                                           bestanswer=pmax(area_chosen,area_alt1,area_alt2),
                                                           diff.from.best = area_chosen-bestanswer
                                                           )

#TODO, exclusion criteria (accuracy check on triads data with winners?) goes here.
