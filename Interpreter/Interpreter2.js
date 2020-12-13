const Utils = require('./Utils');
const {OpObjType, OpObj, RegisterObj, StringObj, NumberObj, BoolObj, Machine}=require('./Machine');

const Tokenizer = require('./Tokenizer');
const Parser = require('./Parser');


class Interpreter {
    constructor(){
    }

    runCode(code){
        
        let tokenizer=new Tokenizer(code);
        let errorRecvd=tokenizer.tokenize();

        if (errorRecvd!==null){
            console.log("Error during tokenization on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }
        console.log(tokenizer.tokens);

        let parser=new Parser(tokenizer.tokens);
        errorRecvd=parser.parse();

        if (errorRecvd!==null){
            console.log("Error during parse on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }
        console.log(parser.debugCode);
        return null;
    }
}



let a=new Interpreter();
console.log(a.runCode("string name='asd';"));
// double this=100;
// double times2(){
//     double internal(){
//         return 1;
//     }
//     return times2()*internal();
// }
// times2();
module.exports=Interpreter;