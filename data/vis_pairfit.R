rm(list=ls())


load("pairfits/8497471pairs.RData") #or whatever it is.


est.noise.plot <- ggplot(mysamples,aes(x=sigma))+geom_histogram()

est.tolerance.plot <- ggplot(mysamples,aes(x=tolerance))+geom_histogram()


accuracy.plot <- ggplot(mypairs.df,aes(x=as.numeric(as.character(area_chosen))-as.numeric(as.character(area_alt)),
                                       y=responseinterval,
                                       color=as.numeric(as.character(area_chosen))>as.numeric(as.character(area_alt))))+
    geom_point()+
    geom_point(data=filter(mypairs.df,area_chosen=="equal"),aes(x=abs(area1-area2),y=responseinterval,color="equal"))+
    geom_vline(aes(xintercept=0))+
    xlab("chosen-alternative (so +'ve=>correct, dist from 0 is difficulty)")+guides(color=FALSE)
