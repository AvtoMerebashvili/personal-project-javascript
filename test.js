// let ob = {
//     error: 2
// }


// async function f(){
//     throw new Error('check');
// }



//     (async () =>{
//  for(let i=0; i<2; i++){       
//     try{   
        
//         await f()
//         console.log('i was here')
//      }catch(e){
//          console.log('i was in catch');
//          ob.error+=3;
//          console.log(ob.error);
//     console.log(e.message);
         
//         }
// }
// })();

var obj = {
    value: 1,
}

let obj2 = obj;
console.log(obj2)

let arr = [];
let arr2 = [];

function f(){
    for(let i=0; i<10; i++){
        arr.push(obj)
        Object.defineProperty(obj,'value',{
            value: i
        })
        
    }
}

f()

// for(let i of arr)
// console.log(i)

console.log(obj2)