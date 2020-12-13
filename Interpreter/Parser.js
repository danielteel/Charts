const Utils = require("./Utils");
const TokenType=require("./Tokenizer").TokenType;


const IdentityType = {
	Bool: Symbol("Bool"),
	Double: Symbol("Double"),
	String: Symbol("String"),

	BoolFunction: Symbol("Bool function"),
	DoubleFunction: Symbol("Double function"),
	StringFunction: Symbol("String function")
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

		this.stringPool=[];

		this.scopeIndex=0;
		this.scopes=[[]];

		this.allocScope=[0];
		this.allocScopeIndex=0;
	}

	printLn(code){
		this.debugCode+="\t".repeat(this.scopeIndex+this.allocScopeIndex)+code+'\n';
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
		this.pushAllocScope();
		this.doBlock(null, null, false, false);
		this.popAllocScope();
		return this.errorObj;
	}
	
	pushAllocScope(){
		this.allocScope[++this.allocScopeIndex]=[0];
	}
	popAllocScope(){
		this.allocScope[this.allocScopeIndex--]=undefined;
	}

	pushScope(){
		this.scopes[++this.scopeIndex]=[];
	}
	popScope(){
		this.scopes[this.scopeIndex--]=undefined;
	}
	addToCurrentScope(name, type, branch=null, params=null){
		const alreadyExists=this.getIdentity(name, true);
		if (alreadyExists !== null) return this.setError("Duplicate define, "+name+" already exists in current scope as "+alreadyExists.name+":"+alreadyExists.type.toString());
		let obj={name: name, type: type, branch: branch, params: params, scope: this.allocScopeIndex, index: this.allocScope[this.allocScopeIndex]};
		this.scopes[this.scopeIndex].push(obj);
		switch (type){
			case IdentityType.Bool:
			case IdentityType.Double:
			case IdentityType.String:
				this.allocScope[this.allocScopeIndex]++;
				break;
		}
		return obj;
	}

	getFromStringPool(string){
		let stringIndex=this.stringPool.indexOf(string);
		if (stringIndex<0){
			this.stringPool.push(string);
			stringIndex=this.stringPool.length-1;
		}
		return stringIndex;
	}

	

	getIdentity(name, onlyInCurrentScope=false){
		let index=0;
		for (let i = this.scopeIndex;i>=0;i--){
			let identity = this.scopes[i].find( (current, i) => {index=i; return name === current.name} );
			if (identity) return identity;
			if (onlyInCurrentScope) break;
		}
		return null;
	}

	addBool(name){
		return this.addToCurrentScope(name, IdentityType.Bool);
	}
	addDouble(name){
		return this.addToCurrentScope(name, IdentityType.Double);
	}
	addString(name){
		return this.addToCurrentScope(name, IdentityType.String);
	}
	addFunction(name, functionType, branch, params){
		return this.addToCurrentScope(name, functionType, branch, params);
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

	doFuncCall(allowBool, allowDouble, allowString){
		let funcName=this.token.value;
		let identObj = this.getIdentity(funcName);
		if (!identObj) return this.setError("Tried to call undefined function'"+funcName+"'");

		if (identObj.type===TokenType.BoolFunction && allowBool===false) return this.setError("Cant call a function ("+funcName+") of type bool right here");
		if (identObj.type===TokenType.DoubleFunction && allowDouble===false) return this.setError("Cant call a function ("+funcName+") of type double right here");
		if (identObj.type===TokenType.StringFunction && allowString===false) return this.setError("Cant call a function ("+funcName+") of type string right here");

		if (!this.match(TokenType.Ident)) return false;
		if (!this.match(TokenType.LeftParen)) return false;

		for (let i=0;i<identObj.params.length;i++){
			switch (identObj.params[i]){
				case IdentityType.Double:
					if (!this.doExpression()) return false;
					this.printLn("push eax");
					break;
				case IdentityType.Bool:
					if (!this.doExpression()) return false;
					this.printLn("push eax");
					break;
				case IdentityType.String:
					if (!this.doStringExpression()) return false;
					this.printLn("push eax");
				default:
					return this.setError("Invalid data type in function call parameter list "+identObj.params[i].toString());
			}
			if (i<identObj.params.length-1){
				if (!this.match(TokenType.Comma)) return false;
			}
		}

		if (!this.match(TokenType.RightParen)) return false;

		this.printLn("call ["+identObj.branch+"] //"+funcName)

		return true;
	}

	doIdent(){
		let varName=this.token.value;
		let identObj = this.getIdentity(varName);
		if (!identObj) return this.setError("Tried to access undefined '"+varName+"'");

		switch (identObj.type){
			case IdentityType.Double:
			case IdentityType.Bool:
				this.printLn("mov eax, ["+identObj.scope+"]["+identObj.index+"] // "+varName);
				return this.match(TokenType.Ident);

			case IdentityType.DoubleFunction:
			case IdentityType.BoolFunction:
				return this.doFuncCall(true, true, false);
		}
		return this.setError("Invalid type in expression "+varName+":"+identObj.type.toString());
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
		return this.setError("Expected factor but found "+this.token.type.toString()+":"+this.token.value);
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


	doStringExpressionIdent(){
		let varName=this.token.value;
		let identObj = this.getIdentity(varName);
		if (!identObj) return this.setError("Tried to access undefined '"+varName+"'");

		switch (identObj.type){
			case IdentityType.String:
				this.printLn("mov eax, ["+identObj.scope+"]["+identObj.index+"] // "+varName);
				return this.match(TokenType.Ident);

			case IdentityType.StringFunction:
				return this.doFuncCall(true, true, false);
		}
		return this.setError("Invalid type in expression "+varName+":"+identObj.type.toString());
	}

	doStringFactor(){
		switch (this.token.type){
			case TokenType.StringLiteral:
				this.printLn("load eax, "+getFromStringPool(this.token.value));
				return this.match(TokenType.StringLiteral);
			case TokenType.Ident:
				return this.doStringExpressionIdent();
		}
		return this.setError("Expected string factor, but got "+this.token.type.toString());
	}

	doStringExpression(){
		if (!this.doStringFactor()) return false;
		
		while (this.token.type===TokenType.Plus){
			this.printLn("push eax");
			if (!this.match(TokenType.Plus)) return false;
			if (!this.doStringFactor()) return false;
			this.printLn("pop ebx");
			this.printLn("concat ebx, eax");
			this.printLn("mov eax, ebx");
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

		if (!this.doBlock(breakToBranch, returnToBranch, false, true)) return false;


		if (this.token.type === TokenType.Else) {
			this.printLn("jmp "+endLabel);
			this.printLn(elseLabel+":");

			if (!this.match(TokenType.Else)) return false;
			
			if (!this.doBlock(breakToBranch, returnToBranch, false, true)) return false;
			
			this.printLn(endLabel+":");
		}else{
			this.printLn(elseLabel+":");
		}
		
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

		if (!this.doBlock(endLabel, returnToBranch, false, true)) return false;
		
		this.printLn("jmp "+loopLabel);
		this.printLn(endLabel+":");

		return true;
	}

	doFor(returnToBranch){
		const compareLabel = this.newBranch();
		const incLabel = this.newBranch();
		const blockLabel = this.newBranch();
		const endLabel = this.newBranch();

		this.pushScope();

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
				 case TokenType.String:
					 if (!this.doString()) return false;
					 break;
				default:
					if (!this.doAssignment()) return false; 
					break;
			}
		}else{
			if (!this.match(TokenType.LineDelim)) return false;//               ;
		}

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

		if (!this.doBlock(endLabel, returnToBranch, false, true)) return false;//{ block }

		this.printLn("jmp [inc"+incLabel+"]");
		this.printLn("[end"+endLabel+"]");

		this.popScope();

		return true;
	}

	doLoop(returnToBranch){
		const loopLabel = this.newBranch();
		const endLabel = this.newBranch();

		this.printLn(loopLabel+":");

		if (!this.match(TokenType.Loop)) return false;

		if (!this.doBlock(endLabel, returnToBranch, false, true)) return false;//{ block }
		
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

			if (this.token.type===TokenType.LeftParen){//its a function definition
				return this.doFunction(doubleName, IdentityType.DoubleFunction);
			}
			
			let identObj = this.addDouble(doubleName);
			if (!identObj) return false;

			if (this.token.type===TokenType.Assignment){
				if (!this.match(TokenType.Assignment)) return false;
				if (!this.doExpression()) return false;
				this.printLn("mov ["+identObj.scope+"]["+identObj.index+"], eax // "+doubleName);
			}else{
				this.printLn("mov ["+identObj.scope+"]["+identObj.index+"], nil // "+doubleName);
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

			if (this.token.type===TokenType.LeftParen){//its a function definition
				return this.doFunction(boolName, IdentityType.BoolFunction);
			}
			
			let identObj = this.addBool(doubleName);
			if (!identObj) return false;

			if (this.token.type===TokenType.Assignment){
				if (!this.match(TokenType.Assignment)) return false;
				if (!this.doExpression()) return false;
				this.printLn("mov ["+identObj.scope+"]["+identObj.index+"], eax // "+boolName);
			}else{
				this.printLn("mov ["+identObj.scope+"]["+identObj.index+"], nil // "+boolName);
			}

			if (this.token.type===TokenType.Comma){
				if (!this.match(TokenType.Comma)) return false;
			}
		} while (this.token.type!==TokenType.LineDelim)
		return this.match(TokenType.LineDelim);
	}

	doString(){
		if (!this.match(TokenType.String)) return false;

		do {
			let stringName = this.token.value;
			if (!this.match(TokenType.Ident)) return false;

			if (this.token.type===TokenType.LeftParen){//its a function definition
				return this.doFunction(stringName, IdentityType.StringFunction);
			}
			
			let identObj = this.addString(stringName);
			if (!identObj) return false;

			if (this.token.type===TokenType.Assignment){
				if (!this.match(TokenType.Assignment)) return false;
				if (!this.doStringExpression()) return false;
				this.printLn("mov ["+identObj.scope+"]["+identObj.index+"], eax // "+stringName);
			}else{
				this.printLn("mov ["+identObj.scope+"]["+identObj.index+"], nil // "+stringName);
			}

			if (this.token.type===TokenType.Comma){
				if (!this.match(TokenType.Comma)) return false;
			}
		} while (this.token.type!==TokenType.LineDelim)
		return this.match(TokenType.LineDelim);
	}

	doFunction(name, type){
		const returnToBranch=this.newBranch();
		const skipFuncBranch = this.newBranch();
		const setupStackFrameBranch = this.newBranch();
		const funcBlockBranch = this.newBranch();

		this.printLn("jmp ["+skipFuncBranch+"]");
		

		this.pushAllocScope();
		this.printLn("jmp ["+setupStackFrameBranch+"] //function "+name);

		this.printLn("["+funcBlockBranch+"]");

		let paramTypes=[];
		let paramIdents=[];
		let paramObjs=[];

		if (!this.match(TokenType.LeftParen)) return false;
		while (this.token.type!==TokenType.RightParen){
			switch (this.token.type){
				case TokenType.Double:
					paramTypes.push(IdentityType.Double);
					break;
				case TokenType.Bool:
					paramTypes.push(IdentityType.Bool);
					break;
				case TokenType.String:
					paramTypes.push(IdentityType.String);
					break;
				default:
					return this.setError("Unexpected token in parameter list "+this.token.type.toString());
			}
			if (!this.match(this.token.type)) return false;

			paramIdents.push(this.token.value);
			if (!this.match(TokenType.Ident)) return false;

			if (this.token.type === TokenType.Comma){
				if (!this.match(TokenType.Comma)) return false;
				if (this.token.type===TokenType.RightParen) return this.setError("Expected another parameter, but got a )");
			}
		}
		if (!this.match(TokenType.RightParen)) return false;
		
		let identObj = this.addFunction(name, type, setupStackFrameBranch, paramTypes);
		if (!identObj) return false;

		this.pushScope();
		for (let i=0;i<paramIdents.length;i++){
			let obj=null;
			switch (paramTypes[i]){
				case IdentityType.Double:
					obj=this.addDouble(paramIdents[i]);
					paramObjs.push(obj);
					if (!obj) return false;
					break;
				case IdentityType.Bool:
					obj=this.addBool(paramIdents[i]);
					paramObjs.push(obj);
					if (!obj) return false;
					break;
				case IdentityType.String:
					obj=this.addString(paramIdents[i]);
					paramObjs.push(obj);
					if (!obj) return false;
					break;
				default:
					return this.setError("Unexpected type in parameter list allocation "+paramTypes[i].toString());
			}
		}

		if (!this.doBlock(null, returnToBranch, true, true, true)) return false;
		this.popScope();

		this.printLn("mov eax, nil");
		this.printLn("["+returnToBranch+"]");
		this.printLn("popScope "+this.allocScopeIndex);
		this.printLn("ret");

		this.printLn("["+setupStackFrameBranch+"]");
		this.printLn("pushScope "+this.allocScopeIndex+", "+this.allocScope[this.allocScopeIndex]);

		for (let i=paramObjs.length-1;i>=0;i--){
			this.printLn("pop ["+paramObjs[i].scope+"]["+paramObjs[i].index+"]// "+paramObjs[i].name);
		}

		this.printLn("jmp ["+funcBlockBranch+"]");

		this.popAllocScope();

		this.printLn("["+skipFuncBranch+"]");

		return true;
	}

	doReturn(returnToBranch){
		if (!this.match(TokenType.Return)) return false;
		if (this.token.type!==TokenType.LineDelim){
			if (!this.doExpression()) return false;
		}else{
			this.printLn("mov eax, nil");
		}
		this.printLn("jmp ["+returnToBranch+"]");
		return this.match(TokenType.LineDelim);
	}
	
	doAssignment(wantsDelim=true){
		let varName=this.token.value;

		if (!this.match(TokenType.Ident)) return false;
		let identObj = this.getIdentity(varName);
		if (!identObj) return this.setError("Tried to assign to undefined '"+varName+"'");

		if (!this.match(TokenType.Assignment)) return false;

		switch (identObj.type){
			case IdentityType.String:
				if (!this.doStringExpression()) return false;
				break;
			case IdentityType.Double:
			case IdentityType.Bool:
				if (!this.doExpression()) return false;
				break;
			default:
				return this.setError("Tried to do assignment to invalid type");
		}
		this.printLn("mov ["+identObj.scope+"]["+identObj.index+"], eax // "+varName);

		if (wantsDelim===true) return this.match(TokenType.LineDelim);
		return true;
	}

	doIdentStatement(){
		let identName = this.token.value;

		let identObj = this.getIdentity(identName);
		if (!identObj) return this.setError("Trying to operate on undefined '"+identName+"'");

		switch (identObj.type){
			case IdentityType.Double:
			case IdentityType.Bool:
			case IdentityType.String:
				return this.doAssignment();
			case IdentityType.BoolFunction:
			case IdentityType.DoubleFunction:
			case IdentityType.StringFunction:
				return this.doFuncCall(true, true, true);
		}
		return this.setError("Invalid identity type "+identName+":"+identObj.type.toString())
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

			case TokenType.Exit:
				return this.doExit();

			case TokenType.Return:
				return this.doReturn(returnToBranch);

			case TokenType.Double:
				return this.doDouble();
			case TokenType.String:
				return this.doString();
			case TokenType.Bool:
				return this.doBool();

			case TokenType.Ident:
				return this.doIdentStatement();
				
			case TokenType.LeftCurly:
				return this.doBlock(breakToBranch, returnToBranch, true, false);

			case TokenType.LineDelim:
				return this.match(TokenType.LineDelim);
		}
		return this.setError("Unexpected token in block, "+this.token.type.toString());
	}

	doBlock(breakToBranch, returnToBranch, ifNeedsCurlys, couldBeStatment, dontPushScope=false){
		if (!dontPushScope) this.pushScope();

		let hasCurlys = false;

		if (ifNeedsCurlys || this.token.type===TokenType.LeftCurly){
			if (!this.match(TokenType.LeftCurly)) return false;
			hasCurlys=true;
		}  

		while (this.isNotEnd()){
			if (this.token.type===TokenType.RightCurly){
				if (hasCurlys){
					this.match(TokenType.RightCurly);
					hasCurlys=false;
					break;
				} 
				return this.setError("Unexpected token in block, "+this.token.type.toString());
			}
			if (!this.doStatement(breakToBranch, returnToBranch)) return false;

			if (couldBeStatment && hasCurlys===false) break;
		}

		if (hasCurlys) return this.setError("Got to the end of the file without getting an expected "+TokenType.RightCurly.toString());

		if (!dontPushScope) this.popScope();

		return true;
	}
}

module.exports=Parser;