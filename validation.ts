type arrOfObjects = object[];

interface meta{
    title:string;
    description: string;
}

export interface scenarioinfo{
    status: boolean,
    sortedArr: step[],
    store: arrOfObjects,
    error: null,
}

export interface step{
    index:number;
    meta: meta;
    call(param:object):void;
    restore?(param:object):void;
}

export interface transaction{
        logs:arrOfObjects;
        dispatch(param:step[]):void;
        store?: any[];
    }


export class Validator {
    static step(step,scenario){
     
        if(scenario.indexOf(step)==0 && scenario[scenario.indexOf(step)].index != 1) throw new Error('there is not index 1 in steps')
                
        if(scenario.indexOf(step) != 0){
                if(scenario[scenario.indexOf(step)].index == scenario[scenario.indexOf(step)-1].index)throw new Error(`this step has same index as before step ${scenario.indexOf(step)}`)
                else if(scenario[scenario.indexOf(step)].index - scenario[scenario.indexOf(step)-1].index != 1){
                    throw new TypeError(`there is broken chain on ${scenario.indexOf(step)+1}`)
                }
        }
        else{
            throw new TypeError(`there is broken chain on ${scenario.indexOf(step)+1}`)
        }
    }
};
