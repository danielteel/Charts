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

        let parser=new Parser(tokenizer.tokens);
        errorRecvd=parser.parse();

        if (errorRecvd!==null){
            console.log("Error during parse on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        return null;
    }
}



let a=new Interpreter();
console.log(a.runCode("function addBoth(double a, double b) double {\n\treturn a+b;\n}\n\n;exit addBoth(1,2);"));

module.exports=Interpreter;