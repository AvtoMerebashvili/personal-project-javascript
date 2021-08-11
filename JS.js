class Transaction {
    logs = [];
    #scenarioInfo = {
        currentstate: 0,
        status: true,
        sortedArr: [],
        store: [],
        error: null
    };

    dispatch(scenario) {
        this.#validateScenario(scenario)
        this.#sortSteps(scenario,this.#scenarioInfo.sortedArr)
        this.#createArrforstore(scenario.length,this.#scenarioInfo.store)
        this.store = {};
        let self = this;

        return new Promise(function (resolve, reject) {
            try{
                self.#followSteps(self.#scenarioInfo.sortedArr, self.#scenarioInfo , self.#scenarioInfo.store)
                resolve()
            }catch(err){
                // this.#rollback(scenario,scenarioInfo,scenario.indexOf(step))
                reject(err)
                
            }
            
        });
    }

    #validateScenario(scenario){
        try{
            Validator.scenario(scenario);
        }catch(err){
            this.logs.push({
                state: this.#scenarioInfo.currentstate,
                error: {
                    name: err.name,
                    message: err.message,
                    stack: err.stack,
                },
            });
            throw this.logs
        } 
    }

    #sortSteps(scenario, sortArray){
        for(let i=0; i<scenario.length; i++){
            sortArray[i]='free';

        }

        for(let step of scenario){
            if(step.index){
                if(sortArray[step.index-1]!='free'){
                    findfreespace(sortArray,step,sortArray[step.index-1])
                }else sortArray[step.index-1] = step;
            }
            else{
                sortArray[sortArray.indexOf('free')]=step;
            }
        }
        function findfreespace(sortArray,newitem,olditem){
            sortArray[newitem.index-1] = newitem;
            sortArray[sortArray.indexOf('free')]=olditem;
        }
    }

    #createArrforstore(amount,store){
        for(let i=0; i<amount; i++){
            store[i]={}
        }
    }

    #followSteps(scenario,scenarioInfo, stores){
        (async()=>{
            for(let step of scenario){
                if(scenarioInfo.status){
                    try{
                        scenarioInfo.currentstate += 1;
                        Validator.step(step,scenario);
                        await step.call(this.store);
                        Object.assign(stores[scenario.indexOf(step)],this.store);
                            this.logs.push({
                                index: step.index,
                                meta: step.meta,
                                storeBefore: {},
                                storeAfter: {},
                                error: null
                            });
                        this.#setAfterAndBeforeStore(this.logs,scenario.indexOf(step),stores)    
                        scenarioInfo.status = true;
                    }catch(err){
                        scenarioInfo.status = false;
                        if(typeof step === 'object' && !Array.isArray(step)){
                            this.logs.push({
                                index: step.index,
                                meta: step.meta,
                                error: {
                                    name: err.name,
                                    message: err.message,
                                    stack: err.stack
                                }
                            })
                        }else{
                            this.logs.push({
                                index: undefined,
                                meta: undefined,
                                error: {
                                    name: err.name,
                                    message: err.message,
                                    stack: err.stack
                                }
                            })
                        }
                    }
                }else break;
            }
        })(); 
    }
    #rollback(scenario,scenarioInfo,errorIndex){

    }

    #setAfterAndBeforeStore(logs ,index, stores ){
        if(index>0){
            logs[index].storeBefore=stores[index-1]
            logs[index-1].storeAfter=stores[index]
        }
    }
    
    read(){
        console.log(this.logs)
        // console.log(this.#scenarioInfo.currentstate)
        // console.log(this.store)
        console.log(this.#scenarioInfo.store)
    }
}

class Validator {
    static scenario(scenario) {
        if (!Array.isArray(scenario)) throw new TypeError("scenario must be an array, with Objects inside");
    }

    static step(step,scenario){
        if(typeof step === 'object' && !Array.isArray(step)){
             if (step.index == undefined) throw new Error("index property is required");
                else{
                    if(typeof step.index != 'number') throw new Error('Type of index should be number')
                    if(scenario.indexOf(step)==0 && scenario[scenario.indexOf(step)].index != 1) throw new Error('scenario must start with index 1')
                }

            if (step.call == undefined)  throw new Error("call method is required");
                else{
                    if(typeof step.call != 'function') throw new TypeError('type of call must be function')
                }

            if (step.meta == undefined)  throw new Error("meta property is required");
                else if (step.meta != undefined){
                    if(typeof step.meta != 'object' || Array.isArray(step.meta)) throw new TypeError('type of meta must be object')
                    else{
                        if (step.meta.title == undefined) throw new Error("title is required");
                        else{
                            if(typeof step.meta.title != 'string') throw new TypeError('type of title must be string')
                        }
                        if(step.meta.description == undefined)  throw new Error("description is required");
                        else{
                            if(typeof step.meta.description != 'string') throw new TypeError('description of title must be string')
                        }
                    } 
                }
            if(scenario.indexOf(step) != 0){
                if(scenario[scenario.indexOf(step)].index == scenario[scenario.indexOf(step)-1].index)throw new Error(`this step has same index as before step ${scenario.indexOf(step)}`)
                else if(scenario[scenario.indexOf(step)].index - scenario[scenario.indexOf(step)-1].index != 1){
                    throw new TypeError(` there is broken chain on ${scenario.indexOf(step)+1}`)
                }
            }
        }else if(typeof step === undefined){
            throw new TypeError(`this step is not object`)
        }else{
            throw new TypeError(` there is broken chain on ${scenario.indexOf(step)+1}`)
        }
    }
}

const scenario = [
  {
    index: 1,
    meta: {
      title: "Read popular customers",
      description:
        "This action is responsible for reading the most popular customers",
    },
    // callback for main execution
    call: async (store) => {
        store.Value = 1;
        store.check = 'need check'
    },
    // callback for rollback
    restore: async (store) => {},
  },
  {
    index: 2,
    meta: {
        title: 'Delete customer',
        description: 'This action is responsible for deleting customer',
    },
    // callback for main execution
    call: async (store) => {
        store.Value +=1;
        store.check = 'change'
        
    },
    // callback for rollback
    restore: async (store) => {},
  },

  {
    index: 3,
    meta: {
        title: 'third one',
        description: 'aeiouuu',
    },
    // callback for main execution
    call: async (store) => {
        store.Value +=1;
       
    },
    // callback for rollback
    restore: async (store) => {},
  },
 
];

const transaction = new Transaction();

(async () => {
    try {
        await transaction.dispatch(scenario);
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []    
        transaction.read()
    } catch (err) {
        console.log(err);
    }
})();



//this one 
//this one