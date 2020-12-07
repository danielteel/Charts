const Utils = require('./Utils');
const {OpObjType, OpObj, RegisterObj, StringObj, NumberObj, BoolObj, Machine}=require('./Machine');
const Tokenizer = require('./Tokenizer');

class Interpreter {
    constructor(code){
        this.tokenizer=new Tokenizer(code);
    }

    runCode(code){
        let errorRecvd=this.tokenizer.tokenize();
        if (errorRecvd!==null){
            console.log("Error during tokenization on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        return null;
    }
}



let a=new Interpreter("double DOUBLE=0;\nstring name='Dan';\nbool isDone=;");
console.log(a.runCode());
console.log(a.tokenizer.tokens);

module.exports=Interpreter;