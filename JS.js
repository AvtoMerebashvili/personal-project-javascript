class Transaction {
    logs = [];
    #scenarioInfo = {
        status: true,
        sortedArr: [],
        store: [],
        error: null,
    };

    async dispatch(scenario) {
        this.#validateScenario(scenario)
        this.#sortSteps(scenario,this.#scenarioInfo.sortedArr)
        this.#createArrforstore(scenario.length,this.#scenarioInfo.store)
        this.store = {};
        await this.#followSteps(this.#scenarioInfo.sortedArr, this.#scenarioInfo , this.#scenarioInfo.store)
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
        for(let i=0; i<=amount; i++){
            store[i]={}
        }
    
    }

    #deepCopy(obj1,obj2){
        for(let property in obj1){
            if(obj1[property] instanceof Map){
                obj2[property] = new Map([...obj1[property]]);
            }else if(obj1[property] instanceof Set){
                obj2[property] = new Set([...obj1[property]])
            }
            else if(typeof obj1[property] == 'object' && !(Array.isArray(obj1[property]))  && obj1[property] != null){
                obj2[property] = {}
                this.#deepCopy(obj1[property],obj2[property])
            }else if(Array.isArray(obj1[property])){
                obj2[property] = []
                this.#deepCopy(obj1[property],obj2[property])
            }else{
                obj2[property] = obj1[property]
            }
        }
    }

    async #followSteps(scenario,scenarioInfo, stores){
            for(let step of scenario){
                if(scenarioInfo.status){
                    try{
                        Validator.step(step,scenario);
                        await step.call(this.store);
                        this.#deepCopy(this.store,stores[scenario.indexOf(step)+1]);
                        // Object.assign(stores[scenario.indexOf(step)+1],this.store)
                            this.logs.push({
                                index: step.index,
                                meta: step.meta,
                                storeBefore: stores[scenario.indexOf(step)],
                                storeAfter: stores[scenario.indexOf(step)+1],
                                error: null
                            }); 
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
                      
                        await this.#rollback(scenario,scenarioInfo,scenario.indexOf(step)-1)
                        throw this.logs;
                    }
                }else break ;
            }

    }

    async #rollback(scenario,scenarioInfo,errorIndex){
        let store=[];
        createNewStore(store,scenarioInfo.store,this)
        for(let i = errorIndex; i>=0; i--){
            checkRestore(scenario[i].restore, scenario[i],this);
                try {
                    await scenario[i].restore(store[i+1]);
                } catch (error) {
                    this.logs.push({
                        index: scenario[i].index,
                        meta: scenario[i].meta,
                        error:{
                            name: error.name,
                            message: error.message,
                            stack: error.stack
                        }
                    })
                    throw this.logs
                }
            checkStore(store[i+1], scenarioInfo.store[i],i,this,store);
           }
        
        function checkRestore(restore,step,self){
            if(restore){
                if(typeof restore != 'function'){
                    try {
                        throw new Error("type of restore isn't function") 
                    } catch (error) {
                        self.logs.push({
                            index: step.index,
                            meta: step.meta,
                            error: {
                                name: error.name,
                                message: error.message,
                                stack: error.stack
                            }
                        })
                        throw self.logs
                    }
                } 
            }else{
                try {
                    throw new Error('there is not rollback function')
                } catch (error) {
                    self.logs.push({
                        index: step.index,
                        meta: step.meta,
                        error: {
                            name: error.name,
                            message: error.message,
                            stack: error.stack
                        }
                    })
                    throw self.logs
                }
                
            }
        }
        
        function checkStore(newStore, oldStore,index,self,store){
            if(checkEquality(newStore,oldStore)){
                self.logs.push({
                    index: scenario[index].index,
                    meta: scenario[index].meta,
                    storeBefore: scenarioInfo.store[index+1],
                    storeAfter: newStore,
                    error: null
                })
            }else{
                try {
                    throw new Error("restore function didn't restored previus store")
                } catch (error) {
                    self.logs.push({
                        index: scenario[index].index,
                        meta: scenario[index].meta,
                        error:{
                            name: error.name,
                            message: error.message,
                            stack: error.stack
                        }
                    })
                    throw self.logs
                }
            }                
        }

        function createNewStore(store, oldStore,self){
            for(let i in oldStore){
                store[i] = {};
                self.#deepCopy(oldStore[i],store[i])
                // Object.assign(store[i],oldStore[i])
            }
        }

        function checkEquality(newStore,oldStore){  
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
    }

    read(){
        // console.log(this.logs)
    }
}

class Validator {
    static scenario(scenario) {
        if (!Array.isArray(scenario)) throw new TypeError("scenario must be an array, with Objects inside");
    }

    static step(step,scenario){
        if(typeof step === 'object' && !Array.isArray(step)){
             if (step.index == undefined) throw new Error("There isn't index property");
                else{
                    if(typeof step.index != 'number') throw new Error('Type of index is not a number')
                    if(scenario.indexOf(step)==0 && scenario[scenario.indexOf(step)].index != 1) throw new Error('there is not index 1 in steps')
                }

            if (step.call == undefined)  throw new Error("there is not call method");
                else{
                    if(typeof step.call != 'function') throw new TypeError('type of call is not function')
                }

            if (step.meta == undefined)  throw new Error("there is not meta property");
                else if (step.meta != undefined){
                    if(typeof step.meta != 'object' || Array.isArray(step.meta)) throw new TypeError('type of meta is not object')
                    else{
                        if (step.meta.title == undefined) throw new Error("there is not title");
                        else{
                            if(typeof step.meta.title != 'string') throw new TypeError('type of title is not string')
                        }
                        if(step.meta.description == undefined)  throw new Error("there is not description");
                        else{
                            if(typeof step.meta.description != 'string') throw new TypeError('description of title is not string')
                        }
                    } 
                }
            if(scenario.indexOf(step) != 0){
                if(scenario[scenario.indexOf(step)].index == scenario[scenario.indexOf(step)-1].index)throw new Error(`this step has same index as before step ${scenario.indexOf(step)}`)
                else if(scenario[scenario.indexOf(step)].index - scenario[scenario.indexOf(step)-1].index != 1){
                    throw new TypeError(`there is broken chain on ${scenario.indexOf(step)+1}`)
                }
            }
        }else if(typeof step === undefined){
            throw new TypeError(`this step is not object`)
        }else{
            throw new TypeError(`there is broken chain on ${scenario.indexOf(step)+1}`)
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
        store.value = 1 
    },
    // callback for rollback
    restore: async (store) => {
        delete store.value;
    },
  },
  {
    index: 2,
    meta: {
        title: 'Delete customer',
        description: 'This action is responsible for deleting customer',
    },
    // callback for main execution
    call: async (store) => {store.value += 10},
    // callback for rollback
    restore: async (store) => {store.value -= 10},
  },

  {
    index: 3,
    meta: {
        title: 'third one',
        description: 'aeiouuu',
    },
    // callback for main execution
    call: async (store) => {
        store.value += 10
        store.person = {
            name: 'anita',
            surname: 'head'
        }
    },
    // callback for rollback
    restore: async (store) => {
        store.value -= 10
        delete store.person
    },
  },
  {
    index: 4,
    meta: {
        title: 'third one',
        description: 'aeiouuu',
    },
    // callback for main execution
    call: async (store) => {
        store.person = {
            name: 'Berry',
            surname: 'McCaulkiner'
        }
    },
    // callback for rollback
    restore: async (store) => {
        store.person = {
            name: 'anita',
            surname: 'head'
        }
    },
  },
  {
    index: 5,
    meta: {
        title: 'third one',
        description: 'aeiouuu',
    },
    // callback for main execution
    call: async (store) => {throw new Error('check')},
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
        // transaction.read()
    } catch (err) {
        console.log(err);
    }
})();