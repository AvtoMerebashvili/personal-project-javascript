
function f(newStore,oldStore){ 
    let check = true;
    (function recursion(newStore,oldStore){
        for(let key in newStore){
            if(typeof newStore[key] == 'object'){
                recursion(newStore[key], oldStore[key])
            }else{
                if(oldStore != undefined){
                    if(!(key in oldStore )) check = false;
                    if(newStore[key]!==oldStore[key])check = false; 
                }else check = false
                
            }
        }
    }
    )(newStore,oldStore);

    if(!check) return check;

    (function recursion(newStore,oldStore){
        for(let key in oldStore){
            if(typeof oldStore[key] == 'object'){
                recursion(newStore[key], oldStore[key])
            }else{
                if(newStore != undefined){
                    if(!(key in newStore )) check = false;
                    if(newStore[key]!==oldStore[key])check = false; 
                }else check = false
                
            }
        }
    }
    )(newStore,oldStore);
    
    return check;
}
let map = new Map([[1,'avto'], [2,'lado']]) 

const o1 = {
    value:1,
    person:{
        name:'avtss',
       
    },
    
    
}
const o2 = {}


function deepCopy(obj1,obj2){
    for(let property in obj1){
        if(obj1[property] instanceof Map){
            obj2[property] = new Map([...obj1[property]]);
        }else if(obj1[property] instanceof Set){
            obj2[property] = new Set([...obj1[property]])
        }
        else if(typeof obj1[property] == 'object' && !(Array.isArray(obj1[property]))  && obj1[property] != null){
            obj2[property] = {}
            deepCopy(obj1[property],obj2[property])
        }else if(Array.isArray(obj1[property])){
            obj2[property] = []
            deepCopy(obj1[property],obj2[property])
        }else if(isNaN(obj1[property])){
            obj2[property] = NaN
        }
        else{
            obj2[property] = obj1[property]
        }
    }
}

deepCopy(o1,o2);

o2.value = 2
o2.name = 'second objoect'
o2.person.name = 'xvicha'

console.log(o1)
console.log(o2)

