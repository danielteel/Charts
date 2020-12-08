const Utils = require("./Utils");
const TokenType=require("./Tokenizer").TokenType;


class Parser {
    constructor(tokens){
        this.tokens=tokens;

        this.tokenIndex=0;
        this.token=this.tokens[0];
        this.tokenEndIndex=this.tokens.length;
        this.errorObj=null;

        this.branchCounter=0;
    }


    setError(message) {
        this.errorObj = Utils.newErrorObj(this.token?.line, message);
        return false;
    }


    isNotEnd() {
        return this.tokenIndex < this.tokenEndIndex;
    }

    getToken() {
        if (this.isNotEnd()) {
            this.tokenIndex++;
            this.token = this.tokens[this.tokenIndex];
        }
    }
    
    parse(){
        this.doBlock(null, false);
        return null;
    }

    doStatement(breakToBranch, ifWantsRightCurly){
        switch (this.token.type){
			case TokenType.If:
                return this.doIf(breakToBranch);
            case TokenType.While:
                return this.doWhile();
            case TokenType.For:
                return this.doFor();
            case TokenType.Loop:
                return this.doLoop();
			case TokenType.Break:
                return this.doBreak(breakToBranch);

            case TokenType.Function:
                return this.doFunction();
			case TokenType.Return:
				return this.doReturn();

            case TokenType.Exit:
                return this.doExit();

            case TokenType.Double:
                return this.doDouble();
            case TokenType.String:
                return this.doString();
            case TokenType.Bool:
                return this.doBool();

			case TokenType.This:
                return this.doThis();
                
			case TokenType.Ident:
				return this.doAssignment();
                
			case TokenType.LineDelim:
				return this.match(TokenType.LineDelim);
		}
        return this.setError("Unexpected token in block, "+this.token.type);
    }

    doBlock(breakToBranch, ifWantsRightCurly){
		while (this.isNotEnd()){
            if (this.token.type===TokenType.RightCurly){
				if (ifWantsRightCurly) return true;
                return this.setError("Unexpected token in block, "+this.token.type);
            }
            if (!this.doStatement(breakToBranch, ifWantsRightCurly)) return false;
		}
		return true;
	}
}

module.exports=Parser;