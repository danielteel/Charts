const Utils = require('./Utils');
const {OpObjType, OpObj, RegisterObj, StringObj, NumberObj, BoolObj, Machine}=require('./OpObjs');

const Tokenizer = require('./Tokenizer');
const {Parser, IdentityType} = require('./Parser');
const {Program} = require('./Program');


class Interpreter {
    constructor(){
    }

    print(popFn){
        let stringObj=popFn();

        console.log(stringObj.value);
    }

    runCode(code){
        let tokenizer=new Tokenizer(code);
        let errorRecvd=tokenizer.tokenize();

        if (errorRecvd!==null){
            console.log("Error during tokenization on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        let parser=new Parser(tokenizer.tokens);
        const program=parser.parse([ {name: "age", type: IdentityType.Double}, {name: "print", type: IdentityType.BoolFunction, params:[IdentityType.String]} ]);
        if (!(program instanceof Program)){
            errorRecvd = program;
            console.log("Error during parse on line: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        errorRecvd=program.link();
        if (errorRecvd){
            console.log("Error during link: "+errorRecvd.line+" "+errorRecvd.message);
            return errorRecvd;
        }

        program.execute([new NumberObj("age", 18, false), this.print]);

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

