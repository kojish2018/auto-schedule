function registerSch(){
    var lastRow_form = sh_form.getLastRow();
    var Num = sh_form.getRange(lastRow_form,5).getValue();
    var lastRow = sh_list.getLastRow();
    var checkRow = sh_list.getRange(sh_list.getMaxRows(), 3).getNextDataCell(SpreadsheetApp.Direction.UP).getRow();
    if(lastRow-checkRow >= Num){
      var cusList = sh_list.getRange(checkRow+1, 2, Num).getValues();
      sh_list.getRange(checkRow+Num,3).setValue(0);
    }else if(lastRow-checkRow<0){
      throw new Error("枠内にチェックを入力してください")
    }else if(lastRow-checkRow==0){
      var cusList = sh_list.getRange(2,2,Num).getValues();
      sh_list.getRange(1+Num,3).setValue(0);
    }
    else{
      var cusList1 = sh_list.getRange(checkRow+1, 2, lastRow-checkRow).getValues();
      var cusList2 = sh_list.getRange(2,2,Num-lastRow+checkRow).getValues();
      
      var cusList = cusList1.concat(cusList2);
      sh_list.getRange(Num-lastRow+checkRow+1, 3).setValue(0);
    }
    
    sh_list.getRange(checkRow,3).clear();
    
    
    var lastRow_time = sh_time.getLastRow();
    
    var cusSet = [];
    for(var i=0; i<Num; i++){
      cusSet.push(cusList[i][0]);
    };
    
    var cusSetArray = cusSet.filter(function(cus, index, self){
      return self.indexOf(cus) === index;
    });
    
    var cusCount = new Array(cusSetArray.length);
    for(var i=0; i<cusSetArray.length; i++){
      if(cusCount[i]==null){
        cusCount[i]=0;
      }
    }
    
    var preCusCount = cusCount.slice();
    
    for(var j=0; j<cusSetArray.length; j++){
      for(var i=0; i<cusSet.length; i++){
        if(cusSetArray[j] == cusSet[i]){
          cusCount[j] += 1;
        }
      }
    }
    
    var formDate = sh_form.getRange(lastRow_form, 3).getValue(); 
    var lastRow_truck = sh_truck.getLastRow();
    var preDate = sh_truck.getRange(2,4,lastRow_truck,1).getValues();
    var preCus = sh_truck.getRange(2,6,lastRow_truck,1).getValues();
    
    for(var j=0; j<cusSetArray.length; j++){
      for(var i=0; i<lastRow_truck-2; i++){
        if(preDate[i][0].getTime()==formDate.getTime()&&preCus[i][0]==cusSetArray[j]){
          preCusCount[j] += 1;
        }
      }
    }
    
    var cusTime = [];
    var cusTimeListValue = sh_time.getRange(2,1,lastRow_time).getValues();
    var cusTimeList = [];
    for(var i=0; i<lastRow_time-1; i++){
      cusTimeList.push(cusTimeListValue[i][0]);
    };    
    
    var CusTimeSet = function(time,cus,truck,status,indexNo) {
      this.time = time;
      this.cus = cus;
      this.truck = truck;
      this.status = status;
      this.indexNo = indexNo;
    };
    
    var cusTimeSets = [];
    for(var z=0; z<cusSetArray.length; z++){
      for(var i=0; i<cusTimeList.length; i++){
        if(cusSetArray[z] == cusTimeList[i]){
          var cusTimeRow = sh_time.getRange(i+2,2+preCusCount[z],1,cusCount[z]).getValues()[0];
          for (var j=0; j<cusCount[z]; j++) {
            var cusTimeSet = new CusTimeSet(cusTimeRow[j],cusTimeList[i]);
            cusTimeSets.push(cusTimeSet);
          }
        }
      }
    }
    
    
    var maxIndex = Math.max.apply(null, sh_truck.getRange(2,1,lastRow_truck).getValues());
    var formSentTime = sh_form.getRange(lastRow_form, 1).getValue();
    var formPlace = sh_form.getRange(lastRow_form, 2).getValue();
    
    
    var truckType = sh_form.getRange(lastRow_form, 4).getValue();
    cusTimeSets.map(function(value, index){
      value.status = "";
      value.truck = truckType;
      value.indexNo = maxIndex + index + 1;
    })
    
    
    for (var i=0; i<cusTimeSets.length; i++){
      sh_truck.getRange(lastRow_truck+i+1,1).setValue(maxIndex+i+1);
      sh_truck.getRange(lastRow_truck+i+1,2).setValue(formSentTime);
      sh_truck.getRange(lastRow_truck+i+1,3).setValue(formPlace);
      sh_truck.getRange(lastRow_truck+i+1,4).setValue(formDate);
      sh_truck.getRange(lastRow_truck+i+1,5).setValue(getTimes(cusTimeSets[i].time));
      sh_truck.getRange(lastRow_truck+i+1,6).setValue(cusTimeSets[i].cus);
      sh_truck.getRange(lastRow_truck+i+1,7).setValue(cusTimeSets[i].truck);
      sh_truck.getRange(lastRow_truck+i+1,9).setValue(cusTimeSets[i].status);
    }
    
    
    for (var i=0; i<cusTimeSets.length; i++) {
      for(var c=5; c< lastRow_tab; c++){
        var tabTime = sh_tab.getRange(c,2).getValue();
        if (cusTimeSets[i].time.getTime() == tabTime.getTime()) {
          setValueLastCol(c, cusTimeSets[i].indexNo);
        }
      }
    }
}