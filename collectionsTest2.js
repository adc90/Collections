/**
 * Created by adc90 on 12/23/2016.
 */

var x = Collections.ToCollection(dataRepo)
    .Select(function(i,v){
        var nm = v.name.split(" ");
        return {
            id: v.id,
            index: v.index,
            guid: v.guid,
            isActive: v.isActive,
            balance: parseFloat(v.balance.replace("$","").replace(",","")),
            age: v.age,
            eyeColor: v.eyeColor,
            firstNm: nm[0],
            lastNm: nm[1],
            gender: v.gender,
            company: v.company,
            email: v.email,
            phone: v.phone
        };
    }).OrderBy(function(f){
        return f.lastNm;
    }).ThenBy(function(f) {
        return f.lastNm;
    }).Collect();