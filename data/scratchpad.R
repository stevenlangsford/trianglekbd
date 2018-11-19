library(tidyverse)
library(rstan)
library(shinystan)
rm(list=ls())

source("readData.R")
datanames = ls()
load("test1.RData")
rm(list=setdiff(ls(),c(datanames,"fit_allords","fit_matchords","fit_noords")))

myfit <- fit_allords #TODO pass as arg
mysamples <- as.data.frame(extract(myfit,permuted=TRUE))


choicesummary.df <- mysamples%>%select(starts_with("triad_choice"))%>%
    gather()%>%
    group_by(key,value)%>%
    summarize(count=n())%>%
    ungroup()%>%
    spread(value,count)%>%
    mutate(index=sapply(key,function(x){as.numeric(strsplit(x,"\\.")[[1]][2])}))%>%
    arrange(index)%>%
    select(-key)%>%
    replace_na(list('1'=0,'2'=0,'3'=0))
    names(choicesummary.df) <- paste0("choice",names(choicesummary.df)) #Hah. What's the dplyr way of doing this?

choicesummary.df$human <- triads.df$choicenumber #AUGH it's off by one, right? WHERE DID THIS HAPPEN. FFS past-steve!
