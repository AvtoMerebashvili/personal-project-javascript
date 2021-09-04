export class Validator {
  

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
};
