source("readData.R")

ggplot(triads.df,aes(x=diff.from.best))+geom_histogram()+facet_wrap(.~timelimit)+ggtitle("Accuracy: Chosen area minus best available")
