data{
  int hm_stim; //individual observables, ie options, not trials.
  real calcobs[hm_stim];//of each option, true area (ie mean of dist)
  real calcobs_noise;// assume this fit is for one ppnt and they know their own noise level.
  int trial[hm_stim]; //1,1,1,2,2,2,3,3,3 etc, which you could just work out from row number if floor() returned an int, but it doesn't, so it can't be an index.
  int hm_ordobs;
  real ordobs_noise;
  real tolerance;
  int ordobs_trial[hm_ordobs];
  int ordobs_option1[hm_ordobs];
  int ordobs_option2[hm_ordobs];
  int ordobs_attribute[hm_ordobs];
  real ordobs_diff[hm_ordobs];
}
parameters{
  vector<lower=0>[2] est_option_attribute[hm_stim];
}
model{
  vector[3] ordprob_triads[hm_ordobs];//stores prob of ordobs < , = , >
  
  for(i in 1:hm_stim){
    est_option_attribute[i,1]~normal(1,1.5);//prior
    est_option_attribute[i,2]~normal(1,1.5);//prior
    calcobs[i]~normal(est_option_attribute[i,1]*est_option_attribute[i,2]*0.5,calcobs_noise);//calcobs info constrains attribute estimates
  }

  for(anobs in 1:hm_ordobs){
    //stim id is (trial-1)*3+optionnumber.
    //so ordobs[anobs] diff refers to:
    //(est_option_attribute[(ordobs_trial[anobs]-1)*3+ordobs_option1[anobs],ordobs_attribute[anobs]]-est_option_attribute[(ordobs_trial[anobs]-1)*3+ordobs_option2[anobs],ordobs_attribute[anobs]])
    
    ordprob_triads[anobs,1]=0.001+normal_cdf(-tolerance,(est_option_attribute[(ordobs_trial[anobs]-1)*3+ordobs_option1[anobs],ordobs_attribute[anobs]]-est_option_attribute[(ordobs_trial[anobs]-1)*3+ordobs_option2[anobs],ordobs_attribute[anobs]]),ordobs_noise);
    //prob of status '=':phi(tolerance)-phi(-tolerance)
    ordprob_triads[anobs,2]=0.001+normal_cdf(tolerance,(est_option_attribute[(ordobs_trial[anobs]-1)*3+ordobs_option1[anobs],ordobs_attribute[anobs]]-est_option_attribute[(ordobs_trial[anobs]-1)*3+ordobs_option2[anobs],ordobs_attribute[anobs]]),ordobs_noise)-ordprob_triads[anobs,1];
    //prob of status '>': 1-phi(tolerance)
    ordprob_triads[anobs,3]=0.001+1-normal_cdf(tolerance,(est_option_attribute[(ordobs_trial[anobs]-1)*3+ordobs_option1[anobs],ordobs_attribute[anobs]]-est_option_attribute[(ordobs_trial[anobs]-1)*3+ordobs_option2[anobs],ordobs_attribute[anobs]]),ordobs_noise);

    ordprob_triads[anobs] = ordprob_triads[anobs]/sum(ordprob_triads[anobs]); //normalize necessary after adding fudge factor...
        target += categorical_lpmf(fabs(ordobs_diff[anobs])<tolerance ? 2 : ordobs_diff[anobs] < 0 ? 1 : 3 | ordprob_triads[anobs]);//Before the pipe:  true relation between options 1 & 2 on target attribute {1:'<',2:'=',3:'>'}, passed in as data. After pipe: the probability of each outcome given the current attribute estimates. Results in a reward being added to target when ests are consistent with true ordinal relations.
  }
  
}
generated quantities{ //note hard-assumes three options per trial.
  real estval[hm_stim];
  vector[3] estval_tracker[hm_stim/3]; //does two jobs, packages estval into vec[3]'s by trial to feed to cat-logit-rng, also exponentiated to move towards hardmax
  int triad_choice[hm_stim/3];
  
  for(i in 1:hm_stim){
    estval[i]=est_option_attribute[i,1]*est_option_attribute[i,2]*0.5;
    estval_tracker[trial[i],(i%3)+1]=estval[i]^7;
  }

  for(atrial in 1:(hm_stim/3)){
    triad_choice[atrial]=categorical_logit_rng(estval_tracker[atrial]);     
  }
  
}
