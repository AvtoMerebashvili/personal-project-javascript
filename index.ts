import {transaction, step, scenarioinfo, log, Validator, obj} from './validation'

export class Transaction implements transaction {
    logs = <log[]>[];
    private scenarioInfo:scenarioinfo = {
        status: true,
        sortedArr: [],
        store: [],
        error: null,
    };
    store:any;
    async dispatch(scenario:step[]): Promise<any> {
        this.sortSteps(scenario,this.scenarioInfo.sortedArr)
        this.createArrforstore(scenario.length,this.scenarioInfo.store)
        this.store = {};
        await this.followSteps(this.scenarioInfo.sortedArr, this.scenarioInfo , this.scenarioInfo.store)
    }

    private sortSteps(scenario:step[], sortArray: obj[]): void{
        for(let i=0; i<scenario.length; i++){
            sortArray[i]= {};
        }

        for(let step of scenario){
            if(step.index){
                if(sortArray[step.index-1]!={}){
                    findfreespace(sortArray,step,sortArray[step.index-1])
                }else sortArray[step.index-1] = step;
            }
            else{
                sortArray[sortArray.indexOf({})]=step;
            }
        }
        function findfreespace(sortArray:obj[],newitem:step,olditem:obj):void{
            sortArray[newitem.index-1] = newitem;
            sortArray[sortArray.indexOf({})]=olditem;
        }
    }

    private createArrforstore(amount:number,store:obj[]): void{
        for(let i=0; i<=amount; i++){
            store[i]={}
        }
    }

    private deepCopy(obj1:any ,obj2: any){
        for(let property in obj1){
            if(obj1[property] instanceof Map){
                obj2[property] = new Map([...obj1[property]]);
            }else if(obj1[property] instanceof Set){
                obj2[property] = new Set([...obj1[property]])
            }
            else if(typeof obj1[property] == 'object' && !(Array.isArray(obj1[property]))  && obj1[property] != null){
                obj2[property] = {}
                this.deepCopy(obj1[property],obj2[property])
            }else if(Array.isArray(obj1[property])){
                obj2[property] = []
                this.deepCopy(obj1[property],obj2[property])
            }else{
                obj2[property] = obj1[property]
            }
        }
    }

    private async followSteps(scenario:step[],scenarioInfo:scenarioinfo, stores:obj[]): Promise<any>{
            for(let step of scenario){
                if(scenarioInfo.status){
                    try{
                        Validator.step(step,scenario)
                        await step.call(this['store']);
                        this.deepCopy(this['store'],stores[scenario.indexOf(step)+1]);
                            this.logs.push({
                                index: step.index,
                                meta: step.meta,
                                storeBefore: stores[scenario.indexOf(step)],
                                storeAfter: stores[scenario.indexOf(step)+1],
                                error: null
                            }); 
                        scenarioInfo.status = true;
                        if(scenario.indexOf(step) == scenario.length-1){
                            this.logs = <log[]>[];
                            this['store'] = {}
                        }
                    }catch(err){
                        scenarioInfo.status = false;
                        if(typeof step === 'object' && !Array.isArray(step)){
                            this.logs.push({
                                index: step.index,
                                meta: step.meta,
                                error:{
                                    name: (err as Error).name,
                                    message: (err as Error).message,
                                    stack: (err as Error).stack
                                }
                            })
                        }else{
                            this.logs.push({
                                index: undefined,
                                meta: undefined,
                                error: {
                                    name: (err as Error).name,
                                    message: (err as Error).message,
                                    stack: (err as Error).stack
                                }
                            })
                        }
                      
                        await this.rollback(scenario,scenarioInfo,scenario.indexOf(step)-1)
                        throw this.logs;
                    }
                }else break ;
            }
    }

    private async rollback(scenario:any[],scenarioInfo:scenarioinfo,errorIndex:number): Promise<any>{
        let store = <obj[]>[];
        let restoreSkip:number = 0;
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
                            name: (error as Error).name,
                            message: (error as Error).message,
                            stack: (error as Error).stack
                        }
                    })
                    throw this.logs
                }
            PutStepInLog(store,i,this,restoreSkip);
           }
        
        function checkRestore(restore:any,step:step,self:any){
            if(restore){
                if(typeof restore != 'function'){
                    try {
                        throw new Error("type of restore isn't function") 
                    } catch (error) {
                        self.logs.push({
                            index: step.index,
                            meta: step.meta,
                            error: {
                                name: (error as Error).name,
                                message: (error as Error).message,
                                stack: (error as Error).stack
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
        
        function PutStepInLog(store:any,index:any,self:any,skip:any){
                self.logs.push({
                    index: scenario[index].index,
                    meta: scenario[index].meta,
                    storeBefore: scenarioInfo.store[index+1+skip],
                    storeAfter: store[index+1],
                    error: null
                })  
        }

        function createNewStore(store:any, oldStore:any,self:any){
            for(let i in oldStore){
                store[i] = {};
                self.deepCopy(oldStore[i],store[i])
            }
        }
    }
}
