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
console.log(a.runCode(` bool isLegalDrinker(double age){
                            if (age>=21) return true;
                            return false;
                        }
                        double age=0;
                        while (age<100){
                            if (isLegalDrinker(age)) exit age;
                            age=age+1;
                        }
                        age=age+100;
                        exit todouble(tostring(abs(age),0));
                        `));
module.exports=Interpreter;