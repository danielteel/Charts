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
        console.log(parser.debugCode);
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


function longestRun(string) {
    let longest=[0, 0];
    for (let i=0; i < string.length; i++) {
        var run=[i, i];
        for (let j=i+1; j<string.length; j++) {
            if (string[i]===string[j]) {
                run[1] = j;
            }
        }
        if (run[1]-run[0]>longest[1]-longest[0]) {
            longest = run;
        }
    }
    return longest;
}