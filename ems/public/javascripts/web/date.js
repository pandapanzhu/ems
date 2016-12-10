function setDays(year,month,day){
	var days='';
if(month==1 ||month==3 ||month==5 ||month==7 ||month==8 ||month==10 ||month==12){
	for(var i=1;i<=31;i++){
		if(i==day){
			days+='<option  value='+i+' selected>'+i+'</option>'
		}else{
			days+='<option  value='+i+'>'+i+'</option>'
		}
	}//end for of day
$("#day").empty().append(days);

}//end if
else if(month==4||month==6||month==9||month==11){
	for(var i=1;i<=30;i++){
		if(i==day){
			days+='<option  value='+i+' selected>'+i+'</option>'
		}else{
			days+='<option  value='+i+'>'+i+'</option>'
		}
	}//end for of day
$("#day").empty().append(days);
}//end else if
else if(month==2){
	
	if((year%400==0&&year%100==0)||(year%100!=0 && year%4==0) ){

		for(var i=1;i<=29;i++){
			if(i==day){
				days+='<option  value='+i+' selected>'+i+'</option>'
			}else{
				days+='<option  value='+i+'>'+i+'</option>'
			}
	}//end for of day	
	}//end if
	else {
		for(var i=1;i<=28;i++){
			if(i==day){
				days+='<option  value='+i+' selected>'+i+'</option>'
			}else{
				days+='<option  value='+i+'>'+i+'</option>'
			}
		}//end for of day
	}//end else
	$("#day").empty().append(days);
}//end else if of Feb. 

}//end function