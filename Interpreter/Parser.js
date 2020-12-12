const Utils = require("./Utils");
const TokenType=require("./Tokenizer").TokenType;


const ICOpType={
    
}




class Parser {
    constructor(tokens){
        this.tokens=tokens;

        this.tokenIndex=0;
        this.token=this.tokens[0];
        this.tokenEndIndex=this.tokens.length;
        this.errorObj=null;

        this.debugCode="";

        this.branchCounter=1;

        this.namespaceIndex=0;
        this.namespaces=[[]];
    }

    printLn(code){
        this.debugCode+=code+'\n';
    }

    newBranch(){
        return this.branchCounter++;
    }
    
    match(type) {
		if (this.token.type === type) {
            this.getToken();
            return true;
		}
		return this.setError("Expected token type "+ type.toString() + " but found "+this.token.type.toString()+" instead");
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
        this.doBlock(null, null, false);
        return this.errorObj;
    }
    
    pushNamespace(){
        this.namespaceIndex++;
    }
    popNamespace(){
        this.namespaceIndex--;
    }


    
    addBool(name){
        
    }
    addDouble(name){

    }
    addFunction(name, params){

    }

	isPowerOp(){
		if (this.token.type===TokenType.Exponent) return true;
		return false;
	}

	isTermOp(){
		switch (this.token.type){
		case TokenType.Multiply:
		case TokenType.Divide:
		case TokenType.Mod:
			return true;
		}
		return false;
	}

	isAddOp(){
		if (this.token.type===TokenType.Plus || this.token.type===TokenType.Minus) return true;
		return false;
	}

	isCompareOp(){
		switch (this.token.type){
			case TokenType.Lesser:
			case TokenType.LesserEquals:
			case TokenType.Greater:
			case TokenType.GreaterEquals:
			case TokenType.Equals:
			case TokenType.NotEquals:
				return true;
		}
		return false;
	}

	isAndOp(){
		if (this.token.type===TokenType.And) return true;
		return false;
	}

	isOrOp(){
		if (this.token.type===TokenType.Or) return true;
		return false;
	}

    doCeil(){
		if (!this.match(TokenType.Ceil)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
        this.printLn("ceil eax");
		return this.match(TokenType.RightParen);
    }
    
	doFloor(){
		if (!this.match(TokenType.Floor)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
        this.printLn("floor eax");
		return this.match(TokenType.RightParen);
	}

	doAbs(){
		if (!this.match(TokenType.Abs)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
        this.printLn("abs eax");
		return this.match(TokenType.RightParen);
	}

    doMin(){
        if (!this.match(TokenType.Min)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
        if (!this.doExpression()) return false;
        this.printLn("push eax");
		if (!this.match(TokenType.Comma)) return false;
        if (!this.doExpression()) return false;
        this.printLn("pop ebx");
        this.printLn("min eax, ebx");
		return this.match(TokenType.RightParen);
    }

    doMax(){
        if (!this.match(TokenType.Max)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
        if (!this.doExpression()) return false;
        this.printLn("push eax");
		if (!this.match(TokenType.Comma)) return false;
        if (!this.doExpression()) return false;
        this.printLn("pop ebx");
        this.printLn("max eax, ebx");
		return this.match(TokenType.RightParen);
    }

    doClamp(){
        if (!this.match(TokenType.Clamp)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
        if (!this.doExpression()) return false;
        this.printLn("push eax");

		if (!this.match(TokenType.Comma)) return false;
        if (!this.doExpression()) return false;
        this.printLn("pop ebx");
        this.printLn("max eax, ebx");
        this.printLn("push eax");

		if (!this.match(TokenType.Comma)) return false;
        if (!this.doExpression()) return false;
        this.printLn("pop ebx");
        this.printLn("min eax, ebx");

		return this.match(TokenType.RightParen);
    }


    doIdent(){
        this.printLn("mov eax, v_"+this.token.value);
        return this.match(TokenType.Ident);
    }

	doFactor(){
		switch (this.token.type){        
		case TokenType.DoubleLiteral:
            this.printLn("mov eax, "+this.token.value);
            return this.match(TokenType.DoubleLiteral);
            
		case TokenType.Ident:
            return this.doIdent();
            
		case TokenType.LeftParen:
			if (!this.match(TokenType.LeftParen)) return false;
			if (!this.doExpression()) return false;
			if (!this.match(TokenType.RightParen)) return false;
            return true;
            
		case TokenType.Not:
			if (!this.match(TokenType.Not)) return false;
			if (!this.doFactor()) return false;
            this.printLn("not eax");
            return true;
		case TokenType.Minus:
			if (!this.match(TokenType.Minus)) return false;
			if (!this.doFactor()) return false;
			this.printLn("neg eax");
            return true;
            
		case TokenType.Nil:
            this.printLn("mov eax, nil")
            return this.match(TokenType.Nil);
		case TokenType.True:
            this.printLn("mov eax, true");
            return this.match(TokenType.True);
		case TokenType.False:
            this.printLn("mov eax, false");
            return this.match(TokenType.False);    
        case TokenType.This:
            this.printLn("mov eax, this");
            return this.match(TokenType.This);
            
            
        case TokenType.Min:
            return this.doMin();
        case TokenType.Max:
            return this.doMax();
        case TokenType.Clamp:
            return this.doClamp();
        case TokenType.Abs:
            return this.doAbs();
        case TokenType.Floor:
            return this.doFloor();
        case TokenType.Ceil:
            return this.doCeil();
		}
		return this.setError("Expected factor but found "+this.token.type+":"+this.token.value);
	}


	doPower(){
		if (!this.doFactor()) return false;
		while (this.isPowerOp()){

            this.printLn("push eax");

			switch (this.token.type){
			case TokenType.Exponent:
				if (!this.match(TokenType.Exponent)) return false;
                if (!this.doFactor()) return false;
                this.printLn("mov ebx, eax");
                this.printLn("pop eax");
                this.printLn("exp eax, ebx");
				break;
			}
		}
		return true;
    }
    
	doTerm(){
		if (!this.doPower()) return false;
		while (this.isTermOp()){
            this.printLn("push eax");
			switch (this.token.type){
			case TokenType.Multiply:
				if (!this.match(TokenType.Multiply)) return false;
                if (!this.doPower()) return false;
                this.printLn("pop ebx");
                this.printLn("mul eax, ebx");
				break;
			case TokenType.Divide:
				if (!this.match(TokenType.Divide)) return false;
                if (!this.doPower()) return false;
                this.printLn("mov ebx, eax");
                this.printLn("pop eax");
                this.printLn("div eax, ebx");
				break;
			case TokenType.Mod:
				if (!this.match(TokenType.Mod)) return false;
				if (!this.doPower()) return false;
                this.printLn("mov ebx, eax");
                this.printLn("pop eax");
                this.printLn("mod eax, ebx");
				break;
			}
		}
		return true;
	}

	doAdd(){//TODO get it
		if (!this.doTerm()) return false;
		while (this.isAddOp()){
            this.printLn("push eax");
			switch (this.token.type){
			case TokenType.Plus:
				if (!this.match(TokenType.Plus)) return false;
				if (!this.doTerm()) return false;
                this.printLn("pop ebx");
                this.printLn("add eax, ebx");
				break;
			case TokenType.Minus:
				if (!this.match(TokenType.Minus)) return false;
                if (!this.doTerm()) return false;
                this.printLn("pop ebx");
                this.printLn("sub eax, ebx");
                this.printLn("neg eax");
				break;
			}
		}
		return true;
	}

	doCompare(){
		if (!this.doAdd()) return false;
		while (this.isCompareOp()){

            this.printLn("push eax");
            
			let compareType=this.token.type;
			if (!this.match(compareType)) return false;
            if (!this.doAdd()) return false;
            
            this.printLn("pop ebx");
            this.printLn("cmp ebx, eax");
			switch (compareType){
			case TokenType.Equals:
                this.printLn("se eax");
				break;
			case TokenType.NotEquals:
                this.printLn("sne eax");
				break;
			case TokenType.Greater:
                this.printLn("sa eax");
				break;
			case TokenType.GreaterEquals:
                this.printLn("sae eax");
				break;
			case TokenType.Lesser:
                this.printLn("sb eax");
				break;
			case TokenType.LesserEquals:
                this.printLn("sbe eax");
				break;
			}
		}
		return true;
	}


	doAnd(){
        if (!this.doCompare()) return false;
        
		while (this.isAndOp()){

            this.printLn("push eax");
            
			if (this.token.type===TokenType.And){
				if (!this.match(TokenType.And)) return false;
                if (!this.doCompare()) return false;
                
                this.printLn("pop ebx");
                this.printLn("and eax, ebx");
			}
		}
		return true;
	}

    doExpression(){//Does the or operator
        if (!this.doAnd()) return false;
        
		while (this.isOrOp()){

            this.printLn("push eax");

			if (this.token.type===TokenType.Or){
				if (!this.match(TokenType.Or)) return false;
                if (!this.doAnd()) return false;
                this.printLn("pop ebx");
                this.printLn("or eax, ebx");
			}
        }
        
		return true;
    }

    doIf(breakToBranch, returnToBranch){
        const elseLabel = this.newBranch();
        const endLabel = this.newBranch();
        if (!this.match(TokenType.If)) return false;

		if (!this.match(TokenType.LeftParen)) return false;
        if (!this.doExpression()) return false;
		if (!this.match(TokenType.RightParen)) return false;

        this.printLn("test eax, eax");
        this.printLn("je "+elseLabel);

        if (this.token.type === TokenType.LeftCurly){
            if (!this.match(TokenType.LeftCurly)) return false;
            if (!this.doBlock(breakToBranch, returnToBranch, true)) return false;
            if (!this.match(TokenType.RightCurly)) return false;
        }else{
            if (!this.doStatement(breakToBranch, returnToBranch)) return false;
        }

        this.printLn("jmp "+endLabel);
        this.printLn(elseLabel+":");

        if (this.token.type === TokenType.Else) {
            if (!this.match(TokenType.Else)) return false;
            if (this.token.type === TokenType.If) {
                if (!this.doIf(breakToBranch)) return false;
            } else {
                if (this.token.type === TokenType.LeftCurly){
                    if (!this.match(TokenType.LeftCurly)) return false;
                    if (!this.doBlock(breakToBranch, returnToBranch, true)) return false;
                    if (!this.match(TokenType.RightCurly)) return false;
                }else{
                    if (!this.doStatement(breakToBranch, returnToBranch)) return false;
                }
            }
        }
        this.printLn(endLabel+":");
        return true;
    }

    doWhile(returnToBranch){
		const loopLabel = this.newBranch();
        const endLabel = this.newBranch();
        
        if (!this.match(TokenType.While)) return false;
        
        this.printLn(loopLabel+":");

		if (!this.match(TokenType.LeftParen)) return false;
        if (!this.doExpression()) return false;
		if (!this.match(TokenType.RightParen)) return false;
        
        this.printLn("test eax");
        this.printLn("je "+endLabel);

        if (this.token.type === TokenType.LeftCurly){
            if (!this.match(TokenType.LeftCurly)) return false;
            if (!this.doBlock(endLabel, returnToBranch, true)) return false;
            if (!this.match(TokenType.RightCurly)) return false;
        }else{
            if (!this.doStatement(endLabel, returnToBranch)) return false;
        }
        
        this.printLn("jmp "+loopLabel);
        this.printLn(endLabel+":");
		return true;
    }

    doFor(returnToBranch){
		const compareLabel = this.newBranch();
        const incLabel = this.newBranch();
        const blockLabel = this.newBranch();
        const endLabel = this.newBranch();

        if (!this.match(TokenType.For)) return false;//                         for
        if (!this.match(TokenType.LeftParen)) return false;//                   (

        if (this.token.type!==TokenType.LineDelim){//                           [allocate || init]
            switch (this.token.type){
                case TokenType.Bool:
                    if (!this.doBool()) return false;
                    break;
                case TokenType.Double:
                    if (!this.doDouble()) return false;
                    break;
                // case TokenType.String:
                //     if (!this.doString()) return false;
                //     break;
                default:
                    if (!this.doAssignment()) return false; 
                    break;
            }
        }else{
            if (!this.match(TokenType.LineDelim)) return false;
        }
                ;

        this.printLn("[cmp"+compareLabel+"]");

        if (this.token.type!==TokenType.LineDelim){//                           [expression]
            if (!this.doExpression()) return false;
            this.printLn("test eax");
            this.printLn("je [end"+endLabel+"]");
        }
        
        this.printLn("jmp [blk"+blockLabel+"]");
        this.printLn("[inc"+incLabel+"]");

        if (!this.match(TokenType.LineDelim)) return false;//                   ;

        if (this.token.type!==TokenType.RightParen){//                          [assignment] 
            if (!this.doAssignment(false)) return false;
        }

        this.printLn("jmp [cmp"+compareLabel+"]");

        if (!this.match(TokenType.RightParen)) return false;//                  )

        this.printLn("[blk"+blockLabel+"]");

        if (this.token.type === TokenType.LeftCurly){                       //  {
            if (!this.match(TokenType.LeftCurly)) return false;
            if (!this.doBlock(endLabel, returnToBranch, true)) return false;//  <block>
            if (!this.match(TokenType.RightCurly)) return false;            //  }
        }else{
            if (!this.doStatement(endLabel, returnToBranch)) return false;  // statement
        }

        this.printLn("jmp [inc"+incLabel+"]");
        this.printLn("[end"+endLabel+"]");

        return true;
    }

    doLoop(returnToBranch){
		const loopLabel = this.newBranch();
        const endLabel = this.newBranch();

        this.printLn(loopLabel+":");

        if (!this.match(TokenType.Loop)) return false;

        if (this.token.type === TokenType.LeftCurly){
            if (!this.match(TokenType.LeftCurly)) return false;
            if (!this.doBlock(endLabel, returnToBranch, true)) return false;
            if (!this.match(TokenType.RightCurly)) return false;
        }else{
            if (!this.doStatement(endLabel, returnToBranch)) return false;
        }
        
        if (!this.match(TokenType.While)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
        if (!this.doExpression()) return false;
		if (!this.match(TokenType.RightParen)) return false;
        
        this.printLn("test eax");
        this.printLn("jne "+loopLabel);
        this.printLn(endLabel+":");

		return true;
    }

    doBreak(breakToBranch){
		if (!this.match(TokenType.Break)) return false;
		if (breakToBranch===null || breakToBranch===undefined) return this.setError("No loop to break from.");
		this.printLn("jmp "+breakToBranch);
		return this.match(TokenType.LineDelim);
    }

    doExit(){
		if (!this.match(TokenType.Exit)) return false;
        if (this.token.type !== TokenType.LineDelim){
            if (!this.doExpression()) return false;
            this.printLn("exit eax");
        }else{
            this.printLn("exit nil");
        }
        return this.match(TokenType.LineDelim);
    }
    
    doDouble(){
        if (!this.match(TokenType.Double)) return false;

        do {
            let doubleName = this.token.value;
            if (!this.match(TokenType.Ident)) return false;
            
            if (this.token.type===TokenType.Assignment){
                if (!this.match(TokenType.Assignment)) return false;
                if (!this.doExpression()) return false;
                this.printLn("mov v_"+doubleName+", eax");
            }

            if (this.token.type===TokenType.Comma){
                if (!this.match(TokenType.Comma)) return false;
            }
        } while (this.token.type!==TokenType.LineDelim)
        return this.match(TokenType.LineDelim);
    }    

    doBool(){
        if (!this.match(TokenType.Bool)) return false;

        do {
            let boolName = this.token.value;
            if (!this.match(TokenType.Ident)) return false;
            
            if (this.token.type===TokenType.Assignment){
                if (!this.match(TokenType.Assignment)) return false;
                if (!this.doExpression()) return false;
                this.printLn("mov v_"+boolName+", eax");
            }

            if (this.token.type===TokenType.Comma){
                if (!this.match(TokenType.Comma)) return false;
            }
        } while (this.token.type!==TokenType.LineDelim)
        return this.match(TokenType.LineDelim);
    }

    doThis(){
        if (!this.match(TokenType.This)) return false;
        if (!this.match(TokenType.Assignment)) return false;
        if (!this.doExpression()) return false;
        this.printLn("mov this, eax");   
        return this.match(TokenType.LineDelim);
    }

    doAssignment(wantsDelim=true){
        let varName=this.token.value;
        if (!this.match(TokenType.Ident)) return false;
        if (!this.match(TokenType.Assignment)) return false;
        if (!this.doExpression()) return false;
        this.printLn("mov v_"+varName+", eax");   
        if (wantsDelim===true) return this.match(TokenType.LineDelim);
        return true;
    }

    doStatement(breakToBranch, returnToBranch){
        switch (this.token.type){
			case TokenType.If:
                return this.doIf(breakToBranch, returnToBranch);
            case TokenType.While:
                return this.doWhile(returnToBranch);
            case TokenType.For:
                return this.doFor(returnToBranch);
            case TokenType.Loop:
                return this.doLoop(returnToBranch);
			case TokenType.Break:
                return this.doBreak(breakToBranch);

            // case TokenType.Function:
            //     return this.doFunction();
			// case TokenType.Return:
			// 	return this.doReturn(returnToBranch);

            case TokenType.Exit:
                return this.doExit();

            case TokenType.Double:
                return this.doDouble();
            // case TokenType.String:
            //     return this.doString();
            case TokenType.Bool:
                return this.doBool();

			case TokenType.This:
                return this.doThis();
                
			case TokenType.Ident:
				return this.doAssignment();
                
			case TokenType.LineDelim:
                return this.match(TokenType.LineDelim);
		}
        return this.setError("Unexpected token in block, "+this.token.type.toString());
    }

    doBlock(breakToBranch, returnToBranch, ifWantsRightCurly){
		while (this.isNotEnd()){
            if (this.token.type===TokenType.RightCurly){
				if (ifWantsRightCurly) return true;
                return this.setError("Unexpected token in block, "+this.token.type);
            }
            if (!this.doStatement(breakToBranch, returnToBranch, ifWantsRightCurly)) return false;
		}
		return true;
	}
}

module.exports=Parser;