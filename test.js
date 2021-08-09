class a{
    method(){
        let a = s(2);
        s = (p){
            return p+2
        }
        return a
    }
}
let c = new a()
console.log(c.method())


// for (let step of scenario) {
//     try {
//             Validator.step(step);
//             this.logs[step.index-1]={
//                 index: step.index,
//                 meta: step.meta,
//                 error: null
//             }
//         } catch (err) {
//             this.logs[this.#findEmpty(this.logs)]={
//                 index: step.index,
//                 meta: step.meta,
//                 error: {
//                     name: err.name,
//                     message: err.message,
//                     stack: err.stack,
//                 },
//             };
//             this.#scenarioInfo.status = false;
//             break;
//         }
    
// }