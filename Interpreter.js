const TokenType =  {
    Constant:"number",Ident:"ident",LeftParen:"(",RightParen:")",Exponent:"^",
    Plus:"+",Minus:"-",Divide:"/",Multiply:"*",Assignment:"=",Equals:"==",
    NotEquals:"!=",Lesser:"<",Greater:">",LesserEquals:"<=",GreaterEquals:">=",
    FuncMin:"min",FuncMax:"max",FuncAbs:"abs",FuncClamp:"clamp",FuncBoolIsNil:"isnil",
    While:"while",If:"if",LeftCurly:"{",RightCurly:"}",Return:"return",Else:"else",
    Break:"break",LineDelim:";",Not:"!",And:"&&",Or:"||",Comma:",",Double:"double",
    True:"true",False:"false",Nil:"nil",ChartCall:"@",This:"this",String:"string",
    MsgBox:"msgbox"
};

const ERROR_WAS_IN = {
    COMPILE: "compile",
    LINKING: "linking",
    EXECUTION: "execution"
}

class ROp {
	static newCmpToConstant(objToCompare, constantToCompareTo){
		return {type: 2, objToCompare: objToCompare, constantToCompareTo: constantToCompareTo};
	}

	static newJA(branch){
		return {type: 3, branch: branch};
	}

	static newNeg(objToNeg){
		return {type: 4, objToNeg: objToNeg};
	}

	static newLabel(id){
		return {type: 5, id: id};
	}

	static newPush(objToPush){
		return {type: 6, objToPush: objToPush};
	}

	static newPop(popIntoObj){
		return {type: 7, popIntoObj: popIntoObj};
	}

	static newCmp(objA, objB){
		return {type: 8, objA: objA, objB: objB};
	}	

	static newJB(branch){
		return {type: 9, branch: branch};
	}

	static newMov(objA, objB){
		return {type: 10, objA: objA, objB: objB};
	}
}

class Interpreter {

    constructor(code){
        this.errorString="";
        this.errorCodeLine=0;
        this.errorWasDuring=ERROR_WAS_IN.COMPILE;

        this.token={type: null, value: null};

        this.look="";
        this.lookIndex=0;
        this.codeEndIndex=0;
		this.code=code;
		
		this.branchCounter=0;

		this.eax={value:0};
		this.ebx={value:0};
		this.ecx={value:0};

    }

    set code(value){
        this._code=value;
        this.lookIndex=0;
        this.look=code[0];
        this.codeEndIndex=code.length;
    }
    get code(){ return this._code; }
    
    getPhaseOfError(){ return this.errorWasDuring; }
    getErrorMessage(){ return this.errorString; }
    getErrorLine(){ return this.errorLine;}

    setToken(type, value=null){
        this.token.type=token;
        this.token.value=value;
    }

    isDigit(character){
        if ("0123456789".indexOf(character)>=0) return true;
        return false;
    }

    isAlpha(character){
        if ("abcdefghijklmnopqrstuvwxyz".indexOf(character.toLowerCase())>=0) return true;
        return false;
	}
	
	isSpace(character){
		if (character.charCodeAt(0)<=32) return true;
		return false
	}

    isNotEnd(){
        return this.lookIndex<=this.codeEndIndex;
    }

    getChar(){
        if (isNotEnd()){
            lookIndex++;
            this.look=this._code[lookIndex];
        }
	}
	
	skipWhite(){
		while (this.isNotEnd() && this.isSpace(this.look)) {
			if (this.look === '\n') {
				errorCodeLine++;
			}
			this.getChar();
		}
	}

    /////////////////////////////////////
    ////////      Tokenizer      ////////
    /////////////////////////////////////
    number(){
        let hasDec=false;
        let notDone=true;
        let num="";
        while (this.isNotEnd() && notDone===true){
            notDone = false;
            if (this.isDigit(this.look)) {
                num += this.look;
                notDone = true;
            }
            if (this.look === '.' && hasDec === false) {
                hasDec = true;
                num += this.look;
                notDone = true;
            }
            if (notDone===true) this.getChar();
        }
        
        if (num.length < 2 && hasDec === true) {
            this.errorString = "Expected number but found lone decimal.";
            return false;
        }

        this.setToken(TokenType.Constant,Number(num));
        return true;
    }

    stringToken(){
        let str="";
        this.getChar();
        while (this.isNotEnd() && this.look!=='"') {
            str += this.look;
            this.getChar();
        }
        if (this.isNotEnd()){
            if (this.look !== '"') {
                this.errorString = "Expected string but found end of code.";
                return false;
            }
        }
        this.getChar();
        this.setToken(TokenType.String, str);
        return true;
    }

    ident(){
        let name="";
        let notDone = true;
        while (this.isNotEnd() && notDone===true) {
            notDone = false;
            if (this.isAlpha(this.look) || this.isDigit(this.look) || this.look === '_' || this.look === '.') {
                name += this.look;
                notDone = true;
                this.getChar();
            }
        }
        if (name.length=== 0) {
            this.errorString = "Expected identifier but got nothing";
            return false;
        }
        name=name.toLowerCase();
        if (name === "if") {
            this.setToken(TokenType.If);
        } else if (name === "min") {
            this.setToken(TokenType.FuncMin);
        } else if (name === "max") {
            this.setToken(TokenType.FuncMax);
        } else if (name === "clamp") {
            this.setToken(TokenType.FuncClamp);
        } else if (name === "abs") {
            this.setToken(TokenType.FuncAbs);
        } else if (name === "while") {
            this.setToken(TokenType.While);
        } else if (name === "double") {
            this.setToken(TokenType.Double);
        } else if (name === "return") {
            this.setToken(TokenType.Return);
        } else if (name === "else") {
            this.setToken(TokenType.Else);
        } else if (name === "break") {
            this.setToken(TokenType.Break);
        } else if (name === "isnil") {
            this.setToken(TokenType.FuncBoolIsNil);
        } else if (name === "true") {
            this.setToken(TokenType.True);
        } else if (name === "false") {
            this.setToken(TokenType.False);
        }else if (name==="nil"){
            this.setToken(TokenType.Nil);
        } else if (name === "this") {
            this.setToken(TokenType.This);
        } else if (name === "msgbox") {
            this.setToken(TokenType.MsgBox);
        } else {
            this.setToken(TokenType.Ident, name);
        }
        return true;
	}
	
	
	chartCall() {
		let name="";
		let notDone = true;
		while (this.isNotEnd() && notDone === true) {
			notDone = false;
			if (this.isAlpha(this.look) || this.isDigit(this.look) || this.look === '_' || this.look === '.') {
				name += this.look;
				notDone = true;
				this.getChar();
			}
		}
		if (name.length === 0) {
			this.errorString = "Expected chart name but got nothing";
			return false;
		}
		name=name.toLowerCase();
		this.setToken(TokenType.ChartCall,name);
		return true;
	}
	
	next() {
		this.setToken(null);
		this.skipWhite();
		if (this.isNotEnd()){
			if (this.isDigit(this.look) || this.look==='.') {
				if (!this.number()) {
					return false;
				}
			} else if (this.isAlpha(this.look) || this.look==='_') {
				if (!this.ident()) {
					return false;
				}
			} else if (this.look === '"') {
				if (!this.stringToken()) {
					return false;
				}
			}else{
				let symbol = this.look;
				this.getChar();
				switch (symbol) {
				case '@':
					if (!this.chartCall()) {
						return false;
					}
					break;
				case '{':
					this.setToken(TokenType.LeftCurly);
					break;
				case '}':
					this.setToken(TokenType.RightCurly);
					break;
				case '(':
					this.setToken(TokenType.LeftParen);
					break;
				case ')':
					this.setToken(TokenType.RightParen);
					break;
				case ';':
					this.setToken(TokenType.LineDelim);
					break;
				case '^':
					this.setToken(TokenType.Exponent);
					break;
				case '|':
					if (this.isNotEnd() && this.look === '|') {
						this.getChar();
						this.setToken(TokenType.Or);
					} else {
						this.errorString = "Incomplete OR operator found, OR operators must be of boolean type '||'";
						return false;
					}
					break;
				case '&':
					if (this.isNotEnd() && this.look === '&') {
						this.getChar();
						this.setToken(TokenType.And);
					} else {
						this.errorString = "Incomplete AND operator found, AND operators must be of boolean type '&&'";
						return false;
					}
					break;
				case '+':
					this.setToken(TokenType.Plus);
					break;
				case '-':
					this.setToken(TokenType.Minus);
					break;
				case '/':
					if (this.isNotEnd() && this.look === '/') {
						this.getChar();
						while (this.isNotEnd() && this.look !== '\n') {
							this.getChar();
						}
						return this.next();
					} else {
						this.setToken(TokenType.Divide);
					}
					break;
				case '*':
					this.setToken(TokenType.Multiply);
					break;
				case '!':
					if (this.isNotEnd() && this.look === '=') {
						this.getChar();
						this.setToken(TokenType.NotEquals);
					} else {
						this.setToken(TokenType.Not);
					}
					break;
				case '=':
					if (this.isNotEnd() && this.look === '=') {
						this.getChar();
						this.setToken(TokenType.Equals);
					} else {
						this.setToken(TokenType.Assignment);
					}
					break;
				case '>':
					if (this.isNotEnd() && this.look === '=') {
						this.getChar();
						this.setToken(TokenType.GreaterEquals);
					} else {
						this.setToken(TokenType.Greater);
					}
					break;
				case '<':
					if (this.isNotEnd() && this.look === '=') {
						this.getChar();
						this.setToken(TokenType.LesserEquals);
					} else {
						this.setToken(TokenType.Lesser);
					}
					break;
				case ',':
					this.setToken(TokenType.Comma);
					break;
				default:
					this.errorString = "Unexpected symbol found, ";
					this.errorString += symbol;
					return false;
				}
			}
		}
		return true;
	}

	//////////////////////////////////////////
	///////////  End Tokenizer  //////////////
	//////////////////////////////////////////

	match(type) {
		if (this.token.type === type) {
			return this.next();
		}
		this.errorString = "Expected token type "+ type + " but found "+this.token.type+" instead";
		return false;
	}

	newBranch(){
		return ++this.branchCounter();
	}

	isPowerOp(){
		if (this.token.type===TokenType.Exponent) return true;
		return false;
	}

	isTermOp(){
		if (this.token.type===TokenType.Multiply || this.token.type===TokenType.Divide) return true;
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

	doAbs(){
		let isPosBranch = this.newBranch();
		if (!this.match(TokenType.FuncAbs)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!doExpression()) return false;
		this.addOp(ROp.newCmpToConstant(this.eax, 0));
		this.addOp(ROp.newJA(ifPosBranch));
		this.addOp(ROp.newNeg(this.eax));
		this.addOp(ROp.newLabel(ifPosBranch));
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}

	doMin(){
		let compareBranch = this.newBranch();
		if (!this.match(TokenType.FuncMin)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
		this.addOp(ROp.newPush(this.eax));
		if (!this.match(TokenType.Comma)) return false;
		if (!this.doExpression()) return false;
		this.addOp(ROp.newPop(this.ebx));
		this.addOp(ROp.newCmp(this.eax, this.ebx));
		this.addOp(ROp.newJB(compareBranch));
		this.addOp(ROp.newMov(this.eax, this.ebx));
		this.addOp(ROp.newLabel(compareBranch));
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}

	doMax(){
		let compareBranch = this.newBranch();
		if (!this.match(TokenType.FuncMax)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
		this.addOp(ROp.newPush(this.eax));
		if (!this.match(TokenType.Comma)) return false;
		if (!this.doExpression()) return false;
		this.addOp(ROp.newPop(this.ebx));
		this.addOp(ROp.newCmp(this.eax, this.ebx));
		this.addOp(ROp.newJA(compareBranch));
		this.addOp(ROp.newMov(this.eax, this.ebx));
		this.addOp(ROp.newLabel(compareBranch));
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}
}


bool Interpreter::doClamp() {
	BranchID compareBranch = newBranch();
	BranchID compareBranch2 = newBranch();
	if (!match(TokenType::FuncClamp)) return false;
	if (!match(TokenType::LeftParen)) return false;

	if (!doExpression()) return false;
	addOp(ROperation::newPush(errorCodeLine, &eax));

	if (!match(TokenType::Comma)) return false;

	if (!doExpression()) return false;
	addOp(ROperation::newPop(errorCodeLine, &ebx));
	addOp(ROperation::newCmp(errorCodeLine, &eax, &ebx));
	addOp(ROperation::newJA(errorCodeLine, compareBranch));
	addOp(ROperation::newMov(errorCodeLine, &eax, &ebx));
	addOp(ROperation::newLabel(errorCodeLine, compareBranch));
	addOp(ROperation::newPush(errorCodeLine, &eax));

	if (!match(TokenType::Comma)) return false;

	if (!doExpression()) return false;
	addOp(ROperation::newPop(errorCodeLine, &ebx));
	addOp(ROperation::newCmp(errorCodeLine, &eax, &ebx));
	addOp(ROperation::newJB(errorCodeLine, compareBranch2));
	addOp(ROperation::newMov(errorCodeLine, &eax, &ebx));
	addOp(ROperation::newLabel(errorCodeLine, compareBranch2));

	if (!match(TokenType::RightParen)) return false;
	return true;
}

bool Interpreter::doChartCall() {
	TChartCall* chartCall = reinterpret_cast<TChartCall*>(token);
	if (!chartCall) {
		errorString = "Null chart call";
		return false;
	}

	ChartFunction* chartFunction = getChartFunction(chartCall->name);
	if (!chartFunction) {
		errorString = "Chart doesnt exist '" + chartCall->name + "'";
		return false;
	}

	string chartCallName = chartCall->name;

	chartCall = nullptr;

	bool isTrend = chartFunction->chartBase->type == ChartObjectType::TrendChart;
	bool isLinear = chartFunction->chartBase->type == ChartObjectType::LinearChart;
	bool isPoly = chartFunction->chartBase->type == ChartObjectType::PolyChart;
	bool isClamp = chartFunction->chartBase->type == ChartObjectType::ClampChart;

	int inputCount = 2;
	if (isTrend) {
		inputCount = 3;
	}

	if (!match(TokenType::ChartCall)) return false;
	if (!match(TokenType::LeftParen)) return false;
	for (int i = 0; i < inputCount; i++) {
		if (!doExpression()) return false;
		if (i < inputCount - 1) {
			addOp(ROperation::newPush(errorCodeLine, &eax));
			if (!match(TokenType::Comma)) return false;
		}
	}
	if (!match(TokenType::RightParen)) return false;

	addOp(ROperation::newPop(errorCodeLine, &ebx));
	if (isTrend) {
		addOp(ROperation::newPop(errorCodeLine, &ecx));
		addOp(ROperation::newTrendChartCall(errorCodeLine, chartFunction->chartBase, &ecx, &ebx, &eax));
	} else {
		if (isLinear) {
			addOp(ROperation::newLinearChartCall(errorCodeLine, chartFunction->chartBase, &ebx, &eax));
		}
		if (isPoly) {
			addOp(ROperation::newPolyChartCall(errorCodeLine, chartFunction->chartBase, &ebx, &eax));
		}
		if (isClamp) {
			addOp(ROperation::newClampChartCall(errorCodeLine, chartFunction->chartBase, &ebx, &eax));
		}
	}
	return true;
}


bool Interpreter::doFactor() {
	if (token) {
		switch (token->type) {
		case TokenType::Nil:
			addOp(ROperation::newLoad(errorCodeLine, &eax, nullopt));
			return match(TokenType::Nil);

		case TokenType::This:
			addOp(ROperation::newGetThis(errorCodeLine));
			return match(TokenType::This);

		case TokenType::Constant:
			{
				TConstant* constant = reinterpret_cast<TConstant*>(token);
				if (constant) {
					addOp(ROperation::newLoad(errorCodeLine, &eax, constant->value));
				} else {
					errorString = "Null constant";
					return false;
				}
			}
			return match(TokenType::Constant);

		case TokenType::Ident:
			{
				TIdent* ident = reinterpret_cast<TIdent*>(token);
				if (ident) {
					Variable* variable = getVariable(ident->name);
					if (variable) {
						addOp(ROperation::newMov(errorCodeLine, &eax, &variable->value));
					} else {
						errorString = "Variable doesnt exist '" + ident->name + "'";
						return false;
					}
				} else {
					errorString = "Null identifier";
					return false;
				}
			}
			return match(TokenType::Ident);

		case TokenType::ChartCall:
			return doChartCall();

		case TokenType::LeftParen:
			if (!match(TokenType::LeftParen)) return false;
			if (!doExpression()) return false;
			if (!match(TokenType::RightParen)) return false;
			return true;

		case TokenType::Minus:
			if (!match(TokenType::Minus)) return false;
			if (token) {
				if (!doFactor()) return false;
				addOp(ROperation::newNeg(errorCodeLine, &eax));
				return true;
			}
			errorString = "Unary minus expects a factor";
			return false;

		case TokenType::True:
			addOp(ROperation::newSet(errorCodeLine, &eax));
			return match(TokenType::True);

		case TokenType::False:
			addOp(ROperation::newClear(errorCodeLine, &eax));
			return match(TokenType::False);

		case TokenType::Not:
			if (!match(TokenType::Not)) return false;
			if (token) {
				if (!doFactor()) return false;
				addOp(ROperation::newNotOp(errorCodeLine, &eax));
				return true;
			}
			errorString = "Unary not expects a factor";
			return false;

		case TokenType::FuncBoolIsNil:
			{
				if (!match(TokenType::FuncBoolIsNil)) return false;
				if (!match(TokenType::LeftParen)) return false;
				TIdent* ident = reinterpret_cast<TIdent*>(token);
				if (ident == nullptr) {
					errorString = "IsNil ident is null";
					return false;
				}
				if (token->type != TokenType::Ident) {
					errorString = "IsNil expects an identifier but found " + (token != nullptr ? tokenTypeToString(token->type) : "nulltoken");
					return false;
				}
				Variable* variable = getVariable(ident->name);
				if (variable == nullptr) {
					errorString = ident->name + " variable doesnt exist!";
					return false;
				}
				addOp(ROperation::newIsNil(errorCodeLine, &eax, &variable->value));
				if (!match(TokenType::Ident)) return false;
				if (!match(TokenType::RightParen)) return false;
			}
			return true;

		case TokenType::FuncAbs:
			return doAbs();
		case TokenType::FuncClamp:
			return doClamp();
		case TokenType::FuncMax:
			return doMax();
		case TokenType::FuncMin:
			return doMin();
		}
	}
	errorString = "Expected factor but found "+ (token!=nullptr ? tokenTypeToString(token->type) : "nulltoken");
	return false;
}


bool Interpreter::doPower() {
	if (!doFactor()) return false;
	while (isPowerOp()) {
		addOp(ROperation::newPush(errorCodeLine, &eax));
		switch (token->type) {
		case TokenType::Exponent:
			if (!match(TokenType::Exponent)) return false;
			if (!doFactor()) return false;
			addOp(ROperation::newMov(errorCodeLine, &ebx, &eax));
			addOp(ROperation::newPop(errorCodeLine, &eax));
			addOp(ROperation::newPower(errorCodeLine, &eax, &ebx));
			break;
		}
	}
	return true;
}

bool Interpreter::doTerm() {
	if (!doPower()) return false;
	while (isTermOp()) {
		addOp(ROperation::newPush(errorCodeLine, &eax));
		switch (token->type) {
		case TokenType::Multiply:
			if (!match(TokenType::Multiply)) return false;
			if (!doPower()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newMul(errorCodeLine, &eax, &ebx));
			break;
		case TokenType::Divide:
			if (!match(TokenType::Divide)) return false;
			if (!doPower()) return false;
			addOp(ROperation::newMov(errorCodeLine, &ebx, &eax));
			addOp(ROperation::newPop(errorCodeLine, &eax));
			addOp(ROperation::newDiv(errorCodeLine, &eax, &ebx));
			break;
		}
	}
	return true;
}

bool Interpreter::doAdd() {
	if (!doTerm()) return false;
	while (isAddOp()) {
		addOp(ROperation::newPush(errorCodeLine, &eax));
		switch (token->type) {
		case TokenType::Plus:
			if (!match(TokenType::Plus)) return false;
			if (!doTerm()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newAdd(errorCodeLine, &eax, &ebx));
			break;
		case TokenType::Minus:
			if (!match(TokenType::Minus)) return false;
			if (!doTerm()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newSub(errorCodeLine, &eax,&ebx));
			addOp(ROperation::newNeg(errorCodeLine, &eax));
			break;
		}
	}
	return true;
}

bool Interpreter::doCompare() {
	if (!doAdd()) return false;
	while (isCompareOp()) {
		addOp(ROperation::newPush(errorCodeLine, &eax));
		switch (token->type) {
		case TokenType::Equals:
			if (!match(TokenType::Equals)) return false;
			if (!doAdd()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newCmp(errorCodeLine, &ebx, &eax));
			addOp(ROperation::newSE(errorCodeLine, &eax));
			break;
		case TokenType::NotEquals:
			if (!match(TokenType::NotEquals)) return false;
			if (!doAdd()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newCmp(errorCodeLine, &ebx, &eax));
			addOp(ROperation::newSNE(errorCodeLine, &eax));
			break;
		case TokenType::Greater:
			if (!match(TokenType::Greater)) return false;
			if (!doAdd()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newCmp(errorCodeLine, &ebx, &eax));
			addOp(ROperation::newSA(errorCodeLine, &eax));
			break;
		case TokenType::GreaterEquals:
			if (!match(TokenType::GreaterEquals)) return false;
			if (!doAdd()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newCmp(errorCodeLine, &ebx, &eax));
			addOp(ROperation::newSAE(errorCodeLine, &eax));
			break;
		case TokenType::Lesser:
			if (!match(TokenType::Lesser)) return false;
			if (!doAdd()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newCmp(errorCodeLine, &ebx, &eax));
			addOp(ROperation::newSB(errorCodeLine, &eax));
			break;
		case TokenType::LesserEquals:
			if (!match(TokenType::LesserEquals)) return false;
			if (!doAdd()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newCmp(errorCodeLine, &ebx, &eax));
			addOp(ROperation::newSBE(errorCodeLine, &eax));
			break;
		}
	}
	return true;
}


bool Interpreter::doAnd() {
	if (!doCompare()) return false;
	while (isAndOp()) {
		addOp(ROperation::newPush(errorCodeLine, &eax));
		switch (token->type) {
		case TokenType::And:
			if (!match(TokenType::And)) return false;
			if (!doCompare()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newAnd(errorCodeLine, &eax, &ebx));
			break;
		}
	}
	return true;
}

bool Interpreter::doExpression() {
	if (!doAnd()) return false;
	while (isOrOp()) {
		addOp(ROperation::newPush(errorCodeLine, &eax));
		switch (token->type) {
		case TokenType::Or:
			if (!match(TokenType::Or)) return false;
			if (!doAnd()) return false;
			addOp(ROperation::newPop(errorCodeLine, &ebx));
			addOp(ROperation::newOr(errorCodeLine, &eax, &ebx));
			break;
		}
	}
	return true;
}


bool Interpreter::doIf(optional<BranchID> breakToBranch) {
	BranchID elseLabel = newBranch();
	BranchID endLabel = newBranch();

	if (!match(TokenType::If)) return false;
	if (!doExpression()) return false;
	
	addOp(ROperation::newTest(errorCodeLine, &eax));
	addOp(ROperation::newJE(errorCodeLine, elseLabel));

	if (!match(TokenType::LeftCurly)) return false;
	if (!doBlock(breakToBranch, true)) return false;
	if (!match(TokenType::RightCurly)) return false;

	addOp(ROperation::newJmp(errorCodeLine, endLabel));
	addOp(ROperation::newLabel(errorCodeLine, elseLabel));

	if (token && token->type == TokenType::Else) {
		if (!match(TokenType::Else)) return false;
		if (token && token->type == TokenType::If) {
			if (!doIf(breakToBranch)) return false;
		} else {
			if (!match(TokenType::LeftCurly)) return false;
			if (!doBlock(breakToBranch, true)) return false;
			if (!match(TokenType::RightCurly)) return false;
		}
	}
	addOp(ROperation::newLabel(errorCodeLine, endLabel));
	return true;
}

bool Interpreter::doWhile(optional<BranchID> breakToBranch) {
	BranchID loopLabel = newBranch();
	BranchID endLabel = newBranch();

	if (!match(TokenType::While)) return false;
	
	addOp(ROperation::newLabel(errorCodeLine, loopLabel));
	if (!doExpression()) return false;
	addOp(ROperation::newTest(errorCodeLine, &eax));
	addOp(ROperation::newJE(errorCodeLine, endLabel));

	if (!match(TokenType::LeftCurly)) return false;
	if (!doBlock(endLabel, true)) return false;
	if (!match(TokenType::RightCurly)) return false;

	addOp(ROperation::newJmp(errorCodeLine, loopLabel));
	addOp(ROperation::newLabel(errorCodeLine, endLabel));

	return true;
}

bool Interpreter::doBreak(optional<BranchID> breakToBranch) {
	if (match(TokenType::Break)) {
		
		if (breakToBranch == nullopt) {
			errorString = "No loop to 'break' from.";
			return false;
		}

		addOp(ROperation::newJmp(errorCodeLine, *breakToBranch));

		return (match(TokenType::LineDelim));
	}
	return false;
}

bool Interpreter::doReturn() {
	if (match(TokenType::Return)) {
		if (!doExpression()) return false;
		
		addOp(ROperation::newRet(errorCodeLine));

		return (match(TokenType::LineDelim));
	}
	return false;
}

bool Interpreter::doDouble() {
	if (match(TokenType::Double)) {
		if (token && token->type == TokenType::Ident) {
			bool notDone = true;
			while (notDone) {
				notDone = false;
				TIdent* ident = reinterpret_cast<TIdent*>(token);
				if (!addVariable(ident->name, false, nullopt)) return false;
				string identName = ident->name;
				if (!match(TokenType::Ident)) return false;
				if (token && token->type == TokenType::Assignment) {
					if (!doAssignmentWithName(identName)) return false;
				}
				if (token && token->type == TokenType::Comma) {
					if (!match(TokenType::Comma)) return false;
					notDone = true;
				}
			}
			return (match(TokenType::LineDelim));
		} else {
			errorString = "Expected idenfitifer but found "+ (token != nullptr ? tokenTypeToString(token->type) : "nulltoken");
			return false;
		}
	}
	return false;
}

bool Interpreter::doAssignmentWithName(string identName) {
	Variable* variable = getVariable(identName);
	if (!variable) {
		errorString = identName + " variable doesnt exist!";
		return false;
	}
	if (variable->isConstant) {
		errorString = identName + " is a constant, you cant assign anything to it!";
		return false;
	}
	if (!match(TokenType::Assignment)) return false;

	if (!doExpression()) return false;

	addOp(ROperation::newMov(errorCodeLine, &variable->value, &eax));

	return true;
}

bool Interpreter::doAssignment() {
	TIdent* ident = reinterpret_cast<TIdent*>(token);
	if (!ident) {
		errorString = "Null ident token";
		return false;
	}
	string identName = ident->name;
	ident = nullptr;

	if (match(TokenType::Ident)) {
		if (!doAssignmentWithName(identName)) return false;
		return (match(TokenType::LineDelim));
	}
	return false;
}

bool Interpreter::doBlock(optional<BranchID> breakToBranch, bool ifWantsRightCurly) {
	while (token) {
		switch (token->type) {
		case TokenType::If:
			if (!doIf(breakToBranch)) return false;
			break;

		case TokenType::While:
			if (!doWhile(breakToBranch)) return false;
			break;

		case TokenType::Break:
			if (!doBreak(breakToBranch)) return false;
			break;

		case TokenType::Return:
			if (!doReturn()) return false;
			break;

		case TokenType::Double:
			if (!doDouble()) return false;
			break;

		case TokenType::MsgBox:
			{
				if (!match(TokenType::MsgBox)) return false;
				if (token->type != TokenType::String) {
					match(TokenType::String);
					return false;
				}
				TString* strToken = reinterpret_cast<TString*>(token);
				if (strToken) {
					string* str = newPoolString(strToken->str);
					if (str) {
						addOp(ROperation::newMsgBox(errorCodeLine, str));
					} else {
						errorString = "Error adding string to pool";
						return false;
					}
				} else {
					errorString = "Error adding string to pool";
					return false;
				}
				if (!match(TokenType::String)) return false;
				if (!match(TokenType::LineDelim)) return false;
			}
			break;

		case TokenType::This:
			if (!match(TokenType::This)) return false;
			if (!match(TokenType::Assignment)) return false;
			if (!doExpression()) return false;
			addOp(ROperation::newSetThis(errorCodeLine));
			if (!match(TokenType::LineDelim)) return false;
			break;

		case TokenType::Ident:
			if (!doAssignment()) return false;
			break;

		case TokenType::LineDelim:
			if (!match(TokenType::LineDelim)) return false;
			break;

		case TokenType::RightCurly:
			if (ifWantsRightCurly) return true;
			errorString = "Unexpected symbol found '}'";
			return false;

		default:
			errorString = "Unexpected token in block";
			return false;
		}
	}
	if (ifWantsRightCurly) {
		errorString = "Expected '}' but found "+ (token != nullptr ? tokenTypeToString(token->type) : "nulltoken");
		return false;
	}
	return true;
}

void Interpreter::addOp(ROperation * rop) {
	compiledProgram.push_back(rop);
}

void Interpreter::clearOps() {
	for (size_t i = 0; i < compiledProgram.size(); i++) {
		if (compiledProgram[i]) {
			delete compiledProgram[i];
			compiledProgram[i] = nullptr;
		}
	}
	compiledProgram.clear();
}

void Interpreter::clearStringPool() {
	for (auto & str : stringPool) {
		delete str;
		str = nullptr;
	}
	stringPool.clear();
}

string* Interpreter::newPoolString(string str) {
	string* newstr = new string(str);
	stringPool.push_back(newstr);
	return newstr;
}

bool Interpreter::compile(ChartProject* chartProject, CChartObject* thisChartObject) {
	updateChartFunctions(chartProject);
	updateVariables(chartProject, thisChartObject);

	clearStringPool();
	clearOps();

	branchCounter = 0;

	errorWasDuring = InterpreterError::CODE;
	errorCodeLine = 1;
	errorString = "";
	look = code.begin();
	codeEnd = code.end();

	if (next()) {
		if (!doBlock(nullopt, false)) return false;
		return true;
	}
	return false;
}

Variable* Interpreter::getVariable(string name) {
	stringToLower(name);
	if (variables.size() > 0) {
		for (size_t i = 0; i < variables.size(); i++) {
			if (variables[i]) {
				if (variables[i]->name == name) {
					return variables[i];
				}
			}
		}
	}
	return nullptr;
}

bool Interpreter::addVariable(string name, bool isConstant, optional<double> value) {
	stringToLower(name);
	if (!getVariable(name)) {
		variables.push_back(new Variable(name, isConstant, value));
		return true;
	}
	errorString = "Duplicate variable name";
	return false;
}

void Interpreter::updateVariables(ChartProject* chartProject, CChartObject* thisChartObject) {
	clearVariables();

	if (chartProject) {
		for (size_t i = 0; i < chartProject->constants.size(); i++) {
			addVariable(chartProject->constants[i]->getName(), true, chartProject->constants[i]->result);
		}
		if (thisChartObject && thisChartObject->type != ChartObjectType::Input) {
			for (size_t i = 0; i < chartProject->inputs.size(); i++) {
				addVariable(chartProject->inputs[i]->getName(), true, chartProject->inputs[i]->result);
			}
			for (size_t i = 0; i < chartProject->objects.size(); i++) {
				if (chartProject->objects[i] == thisChartObject) {
					break;
				}
				addVariable(chartProject->objects[i]->getName(), true, chartProject->objects[i]->result);
			}
		}
	}
}

void Interpreter::clearVariables() {
	for (size_t i = 0; i < variables.size(); i++) {
		if (variables[i]) {
			delete variables[i];
			variables[i] = nullptr;
		}
	}
	variables.clear();
}

ChartFunction* Interpreter::getChartFunction(string name){
	stringToLower(name);
	for (auto & chartFunction : chartFunctions) {
		if (chartFunction->name == name) {
			return chartFunction;
		}
	}
	return nullptr;
}

void Interpreter::updateChartFunctions(ChartProject * chartProject) {
	clearChartFunctions();
	if (chartProject) {
		for (auto& object : chartProject->objects) {
			if (object->toChartBase()) {
				CChartBase* chartBase = reinterpret_cast<CChartBase*>(object);
				if (chartBase) {
					chartFunctions.push_back(new ChartFunction(stringToLowerCopy(chartBase->getName()), chartBase));
				}
			}
		}
	}
}

void Interpreter::clearChartFunctions() {
	for (auto& chartFunction : chartFunctions) {
		delete chartFunction;
		chartFunction = nullptr;
	}
	chartFunctions.clear();
}

bool Interpreter::getLabelIterator(BranchID branch, vector<ROperation*>::iterator& returnIterator) {
	for (size_t i = 0; i < compiledProgram.size(); i++) {
		if (compiledProgram[i]->type == ROp::label) {
			if (compiledProgram[i]->thisLabelID == branch) {
				vector<ROperation*>::iterator jmpIterator = compiledProgram.begin();
				advance(jmpIterator, i);
				returnIterator = jmpIterator;
				return true;
			}
		}
	}
	return false;
}

bool Interpreter::link() {
	errorWasDuring = InterpreterError::LINK;
	for (size_t i = 0; i < compiledProgram.size(); i++) {
		switch (compiledProgram[i]->type) {
		case ROp::jmp:
		case ROp::ja:
		case ROp::jae:
		case ROp::jb:
		case ROp::jbe:
		case ROp::je:
		case ROp::jne:
			{
				vector<ROperation*>::iterator jmpToIterator;
				if (!getLabelIterator(compiledProgram[i]->toLabelID, jmpToIterator)) {
					errorString = "Unable to resolve label reference " + to_string(compiledProgram[i]->toLabelID);
					return false;
				}
				compiledProgram[i]->toLabel = jmpToIterator;
			}
		}
	}
	return true;
}
bool Interpreter::execute(ChartProject* chartProject, optional<double>& returnedValue) {
	errorWasDuring = InterpreterError::EXECUTION;

	if (compiledProgram.empty()) {
		errorString = "Empty program, it must have at least a return.";
		return false;
	}

	//reset 'machine' state
	flag_AGreater = false;
	flag_BGreater = false;
	flag_Equals = false;
	eax = nullopt;
	ebx = nullopt;
	ecx = nullopt;
	while (runStack.size() > 0) runStack.pop();

	instructionPointer = compiledProgram.begin();
	vector<ROperation*>::iterator endOfProgram = compiledProgram.end();

	while (instructionPointer != endOfProgram) {
		errorCodeLine = (*instructionPointer)->codeLine;
		switch ((*instructionPointer)->type) {
		case ROp::jmp:
			instructionPointer = (*instructionPointer)->toLabel;
			break;
		case ROp::je:
			if (flag_Equals) instructionPointer = (*instructionPointer)->toLabel;
			break;
		case ROp::jne:
			if (!flag_Equals) instructionPointer = (*instructionPointer)->toLabel;
			break;
		case ROp::ja:
			if (!flag_Equals && flag_AGreater) instructionPointer = (*instructionPointer)->toLabel;
			break;
		case ROp::jae:
			if (flag_Equals || flag_AGreater) instructionPointer = (*instructionPointer)->toLabel;
			break;
		case ROp::jb:
			if (!flag_Equals && flag_BGreater) instructionPointer = (*instructionPointer)->toLabel;
			break;
		case ROp::jbe:
			if (flag_Equals || flag_BGreater) instructionPointer = (*instructionPointer)->toLabel;
			break;
		case ROp::push:
			runStack.push(*((*instructionPointer)->double1));
			break;
		case ROp::pop:
			*((*instructionPointer)->double1) = runStack.top();
			runStack.pop();
			break;
		case ROp::mov:
			*((*instructionPointer)->double1) = *((*instructionPointer)->double2);
			break;
		case ROp::load:
			*((*instructionPointer)->double1) = (*instructionPointer)->constant;
			break;
		case ROp::add:
			if ((!*(*instructionPointer)->double1) || !*(*instructionPointer)->double2){
				errorString = "Trying to access double from nil optional";
				return false;
			}
			*((*instructionPointer)->double1) = ((*instructionPointer)->double1)->value() + ((*instructionPointer)->double2)->value();
			break;
		case ROp::sub:
			if ((!*(*instructionPointer)->double1) || !*(*instructionPointer)->double2) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			*((*instructionPointer)->double1) = ((*instructionPointer)->double1)->value() - ((*instructionPointer)->double2)->value();
			break;
		case ROp::div:
			if ((!*(*instructionPointer)->double1) || !*(*instructionPointer)->double2) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			if (compare_float(0, ((*instructionPointer)->double2)->value())) {
				errorString = "Divide by zero";
				return false;
			}
			*((*instructionPointer)->double1) = ((*instructionPointer)->double1)->value() / ((*instructionPointer)->double2)->value();
			break;
		case ROp::mul:
			if ((!*(*instructionPointer)->double1) || !*(*instructionPointer)->double2) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			*((*instructionPointer)->double1) = ((*instructionPointer)->double1)->value() * ((*instructionPointer)->double2)->value();
			break;
		case ROp::neg:
			if ((!*(*instructionPointer)->double1)) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			*((*instructionPointer)->double1) = 0 - ((*instructionPointer)->double1)->value();
			break;
		case ROp::power:
			if ((!*(*instructionPointer)->double1) || !*(*instructionPointer)->double2) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			*((*instructionPointer)->double1) = pow(((*instructionPointer)->double1)->value(), ((*instructionPointer)->double2)->value());
			break;
		case ROp::andop:
			if ((!*(*instructionPointer)->double1) || !*(*instructionPointer)->double2) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			if (abs(((*instructionPointer)->double1)->value()) >= 0.5 && abs(((*instructionPointer)->double2)->value()) >= 0.5) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::orop:
			if ((!*(*instructionPointer)->double1) || !*(*instructionPointer)->double2) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			if (abs(((*instructionPointer)->double1)->value()) >= 0.5 || abs(((*instructionPointer)->double2)->value()) >= 0.5) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::notop:
			if ((!*(*instructionPointer)->double1)) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			if (abs(((*instructionPointer)->double1)->value()) >= 0.5) {
				*((*instructionPointer)->double1) = 0.0f;
			} else {
				*((*instructionPointer)->double1) = 1.0f;
			}
			break;
		case ROp::clear:
			*((*instructionPointer)->double1) = 0.0f;
			break;
		case ROp::set:
			*((*instructionPointer)->double1) = 1.0f;
			break;
		case ROp::cmp:
			if ((!*(*instructionPointer)->double1) || !*(*instructionPointer)->double2) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			if (*((*instructionPointer)->double1) > *((*instructionPointer)->double2)){
				flag_AGreater = true;
			} else {
				flag_AGreater = false;
			}
			if (*((*instructionPointer)->double1) < *((*instructionPointer)->double2)) {
				flag_BGreater = true;
			} else {
				flag_BGreater = false;
			}
			if (compare_float(((*instructionPointer)->double1)->value(), ((*instructionPointer)->double2)->value())) {
				flag_Equals = true;
			} else {
				flag_Equals = false;
			}
			break;
		case ROp::cmptoconstant:
			if ((!*(*instructionPointer)->double1) || !(*instructionPointer)->constant) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			if (*((*instructionPointer)->double1) > *((*instructionPointer)->constant)) {
				flag_AGreater = true;
			} else {
				flag_AGreater = false;
			}
			if (*((*instructionPointer)->double1) < *((*instructionPointer)->constant)) {
				flag_BGreater = true;
			} else {
				flag_BGreater = false;
			}
			if (compare_float(((*instructionPointer)->double1)->value(), *((*instructionPointer)->constant))) {
				flag_Equals = true;
			} else {
				flag_Equals = false;
			}
			break;

		case ROp::test:
			if ((!*(*instructionPointer)->double1)) {
				errorString = "Trying to access double from nil optional";
				return false;
			}
			if (abs(((*instructionPointer)->double1)->value()) < 0.5f) {
				flag_Equals = true;
			} else {
				flag_Equals = false;
			}
			break;
		case ROp::label:
			//essentially a NOP
			break;
		case ROp::se:
			if (flag_Equals) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::sne:
			if (!flag_Equals) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::sa:
			if (flag_AGreater) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::sae:
			if (flag_AGreater || flag_Equals) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::sb:
			if (flag_BGreater) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::sbe:
			if (flag_BGreater || flag_Equals) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::ret:
			returnedValue = eax;
			return true;
		case ROp::isnil:
			if ((!*(*instructionPointer)->double2)) {
				*((*instructionPointer)->double1) = 1.0f;
			} else {
				*((*instructionPointer)->double1) = 0.0f;
			}
			break;
		case ROp::callclamp:
			{
				CClampChart* clampChart = reinterpret_cast<CClampChart*>((*instructionPointer)->chartBase);
				*(*instructionPointer)->double2=clampChart->figureClamp(*(*instructionPointer)->double1, *(*instructionPointer)->double2);
			}
			break;
		case ROp::calllinear:
			{
				CLinearChart* linearChart = reinterpret_cast<CLinearChart*>((*instructionPointer)->chartBase);
				*(*instructionPointer)->double2 = linearChart->figureChart(*(*instructionPointer)->double1, *(*instructionPointer)->double2);
			}
			break;
		case ROp::callpoly:
			{
				CPolyChart* polyChart = reinterpret_cast<CPolyChart*>((*instructionPointer)->chartBase);
				*(*instructionPointer)->double2 = polyChart->hitTestPoly(*(*instructionPointer)->double1, *(*instructionPointer)->double2);
			}
			break;
		case ROp::calltrend:
			{
				CTrendChart* trendChart = reinterpret_cast<CTrendChart*>((*instructionPointer)->chartBase);
				*(*instructionPointer)->double3 = trendChart->figureTrend(*(*instructionPointer)->double1, *(*instructionPointer)->double2, *(*instructionPointer)->double3);
			}
			break;
		case ROp::setThis:
			returnedValue = eax;
			break;
		case ROp::getThis:
			eax = returnedValue;
			break;
		case ROp::msgbox:
			MessageBoxA(GetActiveWindow(), ((*instructionPointer)->string1)->c_str(), "Alert", 0);
		}

		instructionPointer++;
	}

	return true;
}

bool Interpreter::checkCompile(ChartProject * chartProject, CChartObject * thisChartObject, string code, int & errorLine, string & errorMessage) {
	this->code = code;
	
	if (compile(chartProject, thisChartObject)) {
		return true;
	}

	errorLine = this->errorCodeLine;
	errorMessage = this->errorString;
	return false;
}

bool Interpreter::runCode(ChartProject* chartProject, CChartObject* thisChartObject, string theCode, optional<double>& returnedValue) {
	code = theCode;

	if (thisChartObject) {
		if (thisChartObject->type != ChartObjectType::Input) {
			returnedValue = nullopt;
		}
	}

	if (compile(chartProject, thisChartObject)) {
		if (link()) {
			return execute(chartProject, returnedValue);
		}
	}
	return false;
}