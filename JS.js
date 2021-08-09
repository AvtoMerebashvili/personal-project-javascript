class Transaction {
    logs = [];
    #scenarioInfo = {
        currentstate: 0,
        status: true,
        sortedArr: []
    };

    dispatch(scenario) {
        this.#validateScenario(scenario)
        this.#sortSteps(scenario,this.#scenarioInfo.sortedArr)
        this.store = {};
        let self = this;

        return new Promise(function (resolve, reject) {
            
            Validator.CheckChain(self.logs,self,self.#scenarioInfo)
            if(self.#scenarioInfo.status)resolve(self.logs)
            else reject(self.logs)
        
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

    #findEmpty(arr){
        for(let i=0; i<arr.length; i++){
            if(arr[i] === undefined){
                return i;
            } 
        }
    }

}

class Validator {
    static scenario(scenario) {
        if (!Array.isArray(scenario)) throw new TypeError("scenario must be an array, with Objects inside");
    }

    static step(step){
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

    }

    static CheckChain(steps,self,status){
        let i=0;
        try{
            for(i = 0; i<steps.length; i++){
                if(steps[i] == undefined){
                status = false;
                throw new SyntaxError(`The chain is broken on index ${i+1}`)
                }
            }
        }catch(err){
                self.logs[i] = {
                    index: 'no index',
                    meta: 'no meta',
                    error: {
                        name: err.name,
                        message: err.message,
                        stack: err.stack,
                    }
                }
                for(let j = i; j<steps.length; j++){
                    steps.pop()
                }
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
        description: 'This action is responsible for deleting customer'
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
        console.log(await transaction.dispatch(scenario));
        const store = transaction.store; // {} | null
        const logs = transaction.logs; // []    
        transaction.read()
    } catch (err) {
        console.log(err);
    }
})();
