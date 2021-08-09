
let obj = {
 func: async  () => {
        (
            async = () =>{
                throw new Error('check Error')
            }
        )()
    }
}

obj.func().then( () =>{
    console.log(2)
}).catch((err)=> console.log(err))
 