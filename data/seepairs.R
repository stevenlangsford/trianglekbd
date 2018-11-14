source("readData.R")

for(myid in demographics.df$ppntID){

mypairs.df <- pairs.df%>%filter(ppntID==myid)

datalist <- list(
    N=nrow(mypairs.df),
    diff=mypairs.df$area1-mypairs.df$area2,
    choice=mypairs.df$choicenumber
    )

fit <- stan(file="seepairs_getests.stan",
            data=datalist,
            chains=4,
            iter=1000)

mysamples <- as.data.frame(extract(fit,permuted=TRUE))

    save.image(file=paste0("pairfits/",myid,"pairs.RData"))
    rm(list=c("fit","mysamples","datalist","mypairs")); gc(); #possibly useless, but this is the new habit for any fit-in-loop situation.
}
