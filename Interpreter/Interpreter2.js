const Utils = require('./Utils');
const {OpObjType, OpObj, RegisterObj, StringObj, NumberObj, BoolObj, Machine}=require('./OpObjs');

const Tokenizer = require('./Tokenizer');
const {Parser, IdentityType} = require('./Parser');


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
        errorRecvd=parser.parse([ {name: "age", type: IdentityType.Double}, {name: "print", type: IdentityType.BoolFunction, params:[IdentityType.String]} ]);

        if (errorRecvd!==null){
            console.log("Error during parse on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }
        console.log(parser.program.code);
        return null;
    }
}



let a=new Interpreter();
console.log(a.runCode(` bool isLegalDrinker(double age){
                            if (age>=21) return true;
                            return false;
                        }


                        if (!isLegalDrinker(age)){
                            print("You cannot drink yet!");
                            exit false;
                        }else{
                            print("Drink away my boy!");
                            exit true;
                        }
                        `));
module.exports=Interpreter;

