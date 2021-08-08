class Transaction{
    logs = [];
    #currentstate = 0;
    dispatch(scenario){
        try{
            Validator.scenario(scenario)
        }catch(err){
            this.logs.push({
                state: this.#currentstate,
                error:{
                    name: err.name,
                    message: err.message,
                    stack: err.stack
                }
            })
        };
        
        this.store = {};
        let self = this;
        
        return new Promise(function(resolve,reject){ 
            scenario.forEach( (step, i, arr) => {
                step.call(self.store);
                
            })
            reject(self.logs);
        })
    }

    #execution(store){
        this.#currentstate += 1;
    }
    #rollback(store){
        this.#currentstate -= 1;
    }
}

class Validator {
    static scenario(scenario){
        if(Array.isArray(scenario)){
            if(scenario.every(e => typeof e === 'object')){
                scenario.forEach(prop => {
                    if(prop.index == undefined) throw new Error('index property is required')
                    else if(prop.call == undefined) throw new Error('call method is required')
                    else if(prop.meta == undefined) throw new Error('meta property is required')
                    else if(prop.meta != undefined){
                        if(prop.meta.title == undefined || prop.meta.description == undefined) throw new Error('title and description is required');
                    }
                })
            }else throw new TypeError('all elements must be objects in array')
        }else throw new TypeError('scenario must be an array, with Objects inside')
    }
    static call(param, type){
        
    }
}

const scenario = [
    {
        index: 1,
        meta: {
            title: 'Read popular customers',
            description: 'This action is responsible for reading the most popular customers'
        },
				// callback for main execution
        call: async (store) => {
            store.value=0;
        },
				// callback for rollback
        restore: async (store) => {}
    },
    {
        index: 2,
        meta: {
            title: 'Delete customer',
            description: 'This action is responsible for deleting customer'
        },
				// callback for main execution
        call: async (store) => {
            store.value +=2;
        },
				// callback for rollback
        restore: async (store) => {
            store.value-=2;
        }
    }
];

const transaction = new Transaction();

(async() => {
    try {
			await transaction.dispatch(scenario);
			const store = transaction.store; // {} | null
			const logs = transation.logs; // []
            console.log(store)
    } catch (err) {
			console.log(err)
    }
})();

