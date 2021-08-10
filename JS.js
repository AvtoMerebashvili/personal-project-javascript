class Transaction {
    logs = [];
    #scenarioInfo = {
        currentstate: 0,
        status: true,
        sortedArr: [],
        storebefore: {},
        error: null
    };

    dispatch(scenario) {
        this.#validateScenario(scenario)
        this.#sortSteps(scenario,this.#scenarioInfo.sortedArr)
        this.store = {};
        let self = this;

        return new Promise(function (resolve, reject) {
            self.#followSteps(self.#scenarioInfo.sortedArr, self.#scenarioInfo)

            resolve()
            
        
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

   

    #followSteps(scenario,scenarioInfo){
        for(let step of scenario){
            if(scenarioInfo.status){
                (async()=>{
                    try{
                        Validator.step(step);
                        await step.call(this.store);
                            this.logs.push({
                                index: step.index,
                                meta: step.meta,
                                storeBefore: scenarioInfo.storebefore,
                                storeAfter: {},
                                error: null
                            });
                        scenarioInfo.storebefore = this.store;
                        scenarioInfo.status = true;
                        scenarioInfo.currentstate +=1;
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
                        // this.#rollback(scenario,scenarioInfo,scenario.indexOf(step))
                    }
                })(); 
            };
            console.log(scenarioInfo.status)
        }
    }
    #rollback(scenario,scenarioInfo,errorIndex){
        // if(!scenarioInfo.status){

        // }
        // throw new Error('chem yles camichert')
    }
    
    read(){
        console.log(this.logs)
        // console.log(this.#scenarioInfo.sortedArr)
        // console.log(this.store)
    }
}

class Validator {
    static scenario(scenario) {
        if (!Array.isArray(scenario)) throw new TypeError("scenario must be an array, with Objects inside");
    }

    static step(step){
        if(typeof step === 'object' && !Array.isArray(step)){
             if (step.index == undefined) throw new Error("index property is required");
                else{
                    if(typeof step.index != 'number') throw new Error('Type of index should be number')
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
        }else{
            throw new TypeError('this step is not object')
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
    call: async (store) => {},
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
    call: async (store) => {},
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
