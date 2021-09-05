export type obj = {}
export type restore = (param: any)=> Promise<any>

interface meta{
    title:string;
    description: string;
}

interface error{
    name: string,
    message: string,
    stack: string | undefined
}

export interface log{
    index: number | undefined,
    meta: meta | undefined,
    storeBefore?: obj,
    storeAfter?: obj,
    error: null | error
}

export interface scenarioinfo{
    status: boolean,
    sortedArr: step[],
    store: obj[],
    error: null,
}

export interface step{
    index:number;
    meta: meta;
    call(param:object): Promise<any>;
    restore?(param:object):Promise<any>;
}

export interface transaction{
        logs: log[];
        dispatch(param:step[]): Promise<any>;
        store: any[];
    }
    
enum Errors {
    noIndexOne = 'there is not index 1 in steps',
    indexReincarnation = "this step has same index as before step",
    brokenChain = "there is broken chain on"
}

export class Validator {
    static step(step: step,scenario:any[]){
        if(scenario.indexOf(step)==0 && scenario[scenario.indexOf(step)].index != 1) throw new Error(Errors.noIndexOne)
        if(scenario.indexOf(step) != 0){
                if(scenario[scenario.indexOf(step)].index - scenario[scenario.indexOf(step)-1].index != 1){
                    throw new TypeError(`${Errors.brokenChain} ${scenario.indexOf(step)+1} or ${Errors.indexReincarnation}`)
                }
        }
        
    }
};
