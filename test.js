let ob = {
    error: 2
}


async function f(){
    throw new Error('check');
}



    (async () =>{
 for(let i=0; i<2; i++){       
    try{   
        console.log(ob.error)
        await f()
        console.log('i was here')
     }catch(e){
         console.log('i was in catch');
         ob.error=3;
         console.log(ob.error);
    console.log(e.message);
         
        }
}
})();

