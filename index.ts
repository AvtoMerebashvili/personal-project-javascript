import {Validator} from './validation'
export class Transaction {
    logs = [];
    #scenarioInfo = {
        status: true,
        sortedArr: [],
        store: [],
        error: null,
    };

    async dispatch(scenario) {
        
        this.#sortSteps(scenario,this.#scenarioInfo.sortedArr)
        this.#createArrforstore(scenario.length,this.#scenarioInfo.store)
        Object.defineProperty(this, "store",{value: {}})
        await this.#followSteps(this.#scenarioInfo.sortedArr, this.#scenarioInfo , this.#scenarioInfo.store)
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
                            this.logs.push({
                                index: step.index,
                                meta: step.meta,
                                storeBefore: stores[scenario.indexOf(step)],
                                storeAfter: stores[scenario.indexOf(step)+1],
                                error: null
                            }); 
                        scenarioInfo.status = true;
                        if(scenario.indexOf(step) == scenario.length-1){
                            this.logs = [];
                            this.store = {}
                        }
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
        let restoreSkip = 0;
        createNewStore(store,scenarioInfo.store,this)
        for(let i = errorIndex; i>=0; i--){
            
            if(!(checkRestore(scenario[i].restore, scenario[i],this))){
                    restoreSkip +=1;
                    Object.assign(store[i],store[i+1]);
                    
                    continue;
                }try {
                  
                    await scenario[i].restore(store[i+1]);
                    Object.assign(store[i],store[i+1])
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
            PutStepInLog(store,i,this,restoreSkip);
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
                return true
            }else{
                return false
            }
        }
        
        function PutStepInLog(store,index,self,skip){
                self.logs.push({
                    index: scenario[index].index,
                    meta: scenario[index].meta,
                    storeBefore: scenarioInfo.store[index+1+skip],
                    storeAfter: store[index+1],
                    error: null
                })  
        }

        function createNewStore(store, oldStore,self){
            for(let i in oldStore){
                store[i] = {};
                self.#deepCopy(oldStore[i],store[i])
            }
        }
    }
}
