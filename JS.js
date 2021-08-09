class Transaction {
  logs = [];
  #scenarioInfo = {
    currentstate: 0,
    status: true,
    steps: new Map(),
  };

  dispatch(scenario) {
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
    this.store = {};
    let self = this;

    

    return new Promise(function (resolve, reject) {
        for (let step of scenario) {
            try {
                    Validator.step(step);
                    self.logs[step.index-1]={
                        index: step.index,
                        meta: step.meta,
                        error: null
                    }
                } catch (err) {
                    self.logs[self.#findEmpty(self.logs)]={
                        index: step.index,
                        meta: step.meta,
                        error: {
                            name: err.name,
                            message: err.message,
                            stack: err.stack,
                        },
                    };
                    reject(self.logs)
                    break;
                }
            
            self.#scenarioInfo.steps.set(step.index, step);
        }
        Validator.AllStep(self.logs,reject)
        
      self.#scenarioInfo.steps.get(self.#scenarioInfo.currentstate + 1);
      resolve(
          self.logs
      );
    });
  }
  #findEmpty(arr){
    for(let i=0; i<arr.length; i++){
        if(arr[i] === undefined){
            return i;
        } 
    }
  }
//   read() {
//     console.log(this.#scenarioInfo);
//   }
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

  static AllStep(steps,reject){
    for(let i = 0; i<steps.length; i++){
        if(steps[i] == undefined) reject(`The chain is broken between steps on ${i+1}`)
    }
  }
  
  static call(param, type) {}
}

const scenario = [
  {
    index: 3,
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
      title: "Delete customer",
      description: "This action is responsible for deleting customer",
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
    console.log(store);
    // console.log(transaction.read());
  } catch (err) {
    console.log(err);
  }
})();
