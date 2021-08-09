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
                    self.logs[step.index]={
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
      
      self.#scenarioInfo.steps.get(self.#scenarioInfo.currentstate + 1);
      resolve(
          self.logs
      );
    });
  }
  #findEmpty(arr){
    if(arr.length === 0) return 1;
    else{
        for(let i=1; i<=arr.length; i++){
            if(arr[i] === undefined){
                return i;
            } 
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
        if (step.index == undefined)
          throw new Error("index property is required");
        else if (step.call == undefined)
          throw new Error("call method is required");
        else if (step.meta == undefined)
          throw new Error("meta property is required");
        else if (step.meta != undefined) {
          if (step.meta.title == undefined) throw new Error("title is required");
          else if(step.meta.description == undefined)  throw new Error("description is required");
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
  {
    index: 1,
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
