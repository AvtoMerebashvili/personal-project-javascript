let ob = {
    error: 2
}


async function f(){
    throw new Error('check');
}

for(let i=0; i<2; i++){
    (async () =>{
    try{   
         console.log(ob.error)
        await f()
        console.log('i was here')
     }catch(e){
         console.log('i was in catch')
         ob.error=3;
    console.log(e.message)
        return 
        }
})();

if(ob.error === 3) break;
}



       
    
   
