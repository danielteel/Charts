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


class Executable{
	static negID=1;
	static lblID=2;
	static pushID=3;
	static popID=4;
	static cmpID=5;
	static jaID=6;
	static jbID=7;
	static movID=8;
	static trendID=9;
	static linearID=10;
	static polyID=11;
	static clampID=12;
	static notID=13;
	static exponentID=14;
	static mulID=15;
	static divID=16;
	static addID=17;
	static subID=18;
	static seID=19;
	static sneID=20;
	static saID=21;
	static saeID=22;
	static sbID=23;
	static sbeID=24;
	static andID=25;
	static orID=26;
	static jeID=27;
	static jneID=28;
	static testID=29;
	static jmpID=30;
	static retID=31;
	static msgboxID=32;
	
	static newOp(type, codeLine, ...stuff){
		let retObj={type: type, codeLine: codeLine};
		for (let i=0;i<stuff.length;i++){
			if (typeof stuff[i] !== "object" || Array.isArray(stuff[i])) stuff[i]={value: stuff[i]};
			retObj["obj"+i]=stuff[i];
		}
		return retObj;
	}	
	
	constructor(){
		this._opCodes=[];
		this.currentCodeLine=1;
	}
	
	clear(){
		this._opCodes=[];
		this.currentCodeLine=1;
	}

	getOpCodes(){
		return [...this._opCodes];
	}

	newNeg(objToNeg){ this._opCodes.push(Executable.newOp(Executable.negID, this.currentCodeLine, objToNeg)); }
	newLabel(labelId){ this._opCodes.push(Executable.newOp(Executable.lblID, this.currentCodeLine, labelId)); }
	newPush(objToPush){ this._opCodes.push(Executable.newOp(Executable.pushID, this.currentCodeLine, objToPush)); }
	newPop(popIntoThisObj){ this._opCodes.push(Executable.newOp(Executable.popID, this.currentCodeLine, popIntoThisObj)); }
	newCmp(objA, objB){ this._opCodes.push(Executable.newOp(Executable.cmpID, this.currentCodeLine, objA, objB)); }
	newJA(jumpToThisBranchId){ this._opCodes.push(Executable.newOp(Executable.jaID, this.currentCodeLine, jumpToThisBranchId));}
	newJB(jumpToThisBranchId){ this._opCodes.push(Executable.newOp(Executable.jbID, this.currentCodeLine, jumpToThisBranchId)); }
	newMov(recvObj, sendObj){ this._opCodes.push(Executable.newOp(Executable.movID, this.currentCodeLine, recvObj, sendObj)); }
	newTrendCall(chart, returnObj, objA, objB, objC){ this._opCodes.push(Executable.newOp(Executable.trendID, this.currentCodeLine, returnObj, objA, objB, objC)); }
	newLinearCall(chart, returnObj, objA, objB){ this._opCodes.push(Executable.newOp(Executable.linearID, this.currentCodeLine, returnObj, objA, objB)); }
	newPolyCall(chart, returnObj, objA, objB){ this._opCodes.push(Executable.newOp(Executable.polyID, this.currentCodeLine, returnObj, objA, objB)); }
	newClampCall(chart, returnObj, objA, objB){ this._opCodes.push(Executable.newOp(Executable.clampID, this.currentCodeLine, returnObj, objA, objB)); }
	newNot(objToNot){ this._opCodes.push(Executable.newOp(Executable.notID, this.currentCodeLine, objToNot)); }
	newExponent(recvObj, exponentObj){ this._opCodes.push(Executable.newOp(Executable.exponentID, this.currentCodeLine, recvObj, exponentObj)); }
	newMul(recvObj, multiplyByObj){ this._opCodes.push(Executable.newOp(Executable.mulID, this.currentCodeLine, recvObj, multiplyByObj)); }
	newDiv(recvObj, divideByObj){ this._opCodes.push(Executable.newOp(Executable.divID, this.currentCodeLine, recvObj, divideByObj)); }
	newAdd(recvObj, addThisObj){ this._opCodes.push(Executable.newOp(Executable.addID, this.currentCodeLine, recvObj, addThisObj)); }
	newSub(recvObj, subtractThisObj) {this._opCodes.push(Executable.newOp(Executable.subID, this.currentCodeLine, recvObj, subtractThisObj));}
	newSE(setThisObj) {this._opCodes.push(Executable.newOp(Executable.seID, this.currentCodeLine, setThisObj));}
	newSNE(setThisObj) {this._opCodes.push(Executable.newOp(Executable.sneID, this.currentCodeLine, setThisObj));}
	newSA(setThisObj) {this._opCodes.push(Executable.newOp(Executable.saID, this.currentCodeLine, setThisObj));}
	newSAE(setThisObj) {this._opCodes.push(Executable.newOp(Executable.saeID, this.currentCodeLine, setThisObj));}
	newSB(setThisObj) {this._opCodes.push(Executable.newOp(Executable.sbID, this.currentCodeLine, setThisObj));}
	newSBE(setThisObj) {this._opCodes.push(Executable.newOp(Executable.sbeID, this.currentCodeLine, setThisObj));}
	newAnd(recvObj, otherObj) {this._opCodes.push(Executable.newOp(Executable.andID, this.currentCodeLine, recvObj, otherObj));}
	newOr(recvObj, otherObj) {this._opCodes.push(Executable.newOp(Executable.orID, this.currentCodeLine, recvObj, otherObj));}
	newJE(jumpToThisBranchId) {this._opCodes.push(Executable.newOp(Executable.jeID, this.currentCodeLine, jumpToThisBranchId));}
	newJNE(jumpToThisBranchId) {this._opCodes.push(Executable.newOp(Executable.jneID, this.currentCodeLine, jumpToThisBranchId));}
	newTest(testObj) {this._opCodes.push(Executable.newOp(Executable.testID, this.currentCodeLine, testObj));}
	newJmp(jumpToThisBranchId) {this._opCodes.push(Executable.newOp(Executable.testID, this.currentCodeLine, jumpToThisBranchId));}
	newRet() {this._opCodes.push(Executable.newOp(Executable.retID, this.currentCodeLine));}
	newMsgBox(stringToShow) {this._opCodes.push(Executable.newOp(Executable.msgboxID, this.currentCodeLine, stringToShow));}
}

class Interpreter {
    constructor(owningChartObject, code){
        this.errorString="";
        this.errorCodeLine=0;
        this.errorWasDuring=ERROR_WAS_IN.COMPILE;

		this.variables=[];

        this.token={type: null, value: null};

        this.look="";
        this.lookIndex=0;
		this.codeEndIndex=0;
		this._code="";
		this.code=code;
		
		this.branchCounter=0;

		this.eax=0;
		this.ebx=0;
		this.ecx=0;
		this.returnedValue={value: null};

		this.chartObjectArray=[];
		this.owningChartObject=owningChartObject;

		this.program = new Executable();
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

	setError(msg){this.errorString=msg; return false}

    setToken(type, value=null){
        this.token.type=token;
        this.token.value=value;
    }

    isDigit(character){
        if ("0123456789".indexOf(character)>=0) return true;//TODO make more efficient
        return false;
    }

    isAlpha(character){
        if ("abcdefghijklmnopqrstuvwxyz".indexOf(character.toLowerCase())>=0) return true;//TODO make more efficient
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
            this.lookIndex++;
            this.look=this._code[this.lookIndex];
        }
	}
	
	skipWhite(){
		while (this.isNotEnd() && this.isSpace(this.look)) {
			if (this.look === '\n') {
				this.errorCodeLine++;
				this.program.currentCodeLine=this.errorCodeLine;
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
        
        if (num.length < 2 && hasDec === true) return this.setError("Expected number but found lone decimal.");
    

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
            if (this.look !== '"') return this.setError("Expected string but found end of code.");
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
		
		if (name.length === 0) return this.setError("Expected identifier but got nothing");
		
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

		if (name.length === 0) return this.setError("Expected chart name but got nothing");

		name=name.toLowerCase();
		this.setToken(TokenType.ChartCall, name);
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
						return this.setError("Incomplete OR operator found, OR operators must be of boolean type '||'");
					}
					break;
				case '&':
					if (this.isNotEnd() && this.look === '&') {
						this.getChar();
						this.setToken(TokenType.And);
					} else {
						return this.setError("Incomplete AND operator found, AND operators must be of boolean type '&&'");
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
					return this.setError("Unexpected symbol found, "+symbol);
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
		return this.setError("Expected token type "+ type + " but found "+this.token.type+" instead");
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
		this.program.newCmp(this.eax, 0);
		this.program.newJA(ifPosBranch);
		this.program.newNeg(this.eax);
		this.program.newLabel(ifPosBranch);
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}

	doMin(){
		let compareBranch = this.newBranch();
		if (!this.match(TokenType.FuncMin)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
		this.program.newPush(this.eax);
		if (!this.match(TokenType.Comma)) return false;
		if (!this.doExpression()) return false;
		this.program.newPop(this.ebx);
		this.program.newCmp(this.eax, this.ebx);
		this.program.newJB(compareBranch);
		this.program.newMov(this.eax, this.ebx);
		this.program.newLabel(compareBranch);
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}

	doMax(){
		let compareBranch = this.newBranch();
		if (!this.match(TokenType.FuncMax)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
		this.program.newPush(this.eax);
		if (!this.match(TokenType.Comma)) return false;
		if (!this.doExpression()) return false;
		this.program.newPop(this.ebx);
		this.program.newCmp(this.eax, this.ebx);
		this.program.newJA(compareBranch);
		this.program.newMov(this.eax, this.ebx);
		this.program.newLabel(compareBranch);
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}

	doClamp(){
		let compareBranch = this.newBranch();
		let compareBranch2 = this.newBranch();
		if (!this.match(TokenType.FuncClamp)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
		this.program.newPush(this.eax);
		if (!this.match(TokenType.Comma)) return false;
		if (!this.doExpression()) return false;
		this.program.newPop(this.ebx);
		this.program.newCmp(this.eax, this.ebx);
		this.program.newJA(compareBranch);
		this.program.newMov(this.eax, this.ebx);
		this.program.newLabel(compareBranch);
		this.program.newPush(this.eax);
		if (!this.match(TokenType.Comma)) return false;
		if (!this.doExpression()) return false;
		this.program.newPop(this.ebx);
		this.program.newCmp(this.eax, this.ebx);
		this.program.newJB(compareBranch2);
		this.program.newMov(this.eax, this.ebx);
		this.program.newLabel(compareBranch2);
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}

	doIsNil(){
		if (!this.match(TokenType.FuncBoolIsNil)) return false;
		if (!this.match(TokenType.LeftParen)) return false;

		let identObj = this.getIdentObject(this.token.value);
		if (!identObj) return this.setError(this.token.value+" doesnt exist!");

		this.program.newIsNil(identObj);

		if (!this.match(TokenType.Ident)) return false;
		if (!this.match(TokenType.RightParen)) return false;

		return true;
	}

	doChartCall(){
		let chartObj=this.getChartObject(this.token.value);//TODO implement getChartObject
		if (!chartObj) return this.setError("Chart object '"+this.token.value+"' doesnt exist");

		let isTrend = chartObj.type==="trend";
		let isLinear = chartObj.type==="linear";
		let isPoly = chartObj.type==="poly";
		let isClamp = chartObj.type==="clamp";

		if (!(isTrend || isLinear || isPoly || isClamp)) return this.setError("Chart object '"+this.token.value+"' is not a chart!");

		if (!this.match(TokenType.ChartCall)) return false;
		if (!this.match(TokenType.LeftParen)) return false;

		let inputCount = isTrend ? 3 : 2;

		for (let i = 0; i < inputCount; i++) {
			if (!this.doExpression()) return false;
			if (i < inputCount - 1) {
				this.program.newPush(this.eax);
				if (!this.match(TokenType.Comma)) return false;
			}
		}
		if (!this.match(TokenType.RightParen)) return false;

		this.program.newPop(this.ebx);
		if (isTrend){
			this.program.newPop(this.ecx);
			this.program.newTrendCall(chartObj, this.eax, this.ecx, this.ebx, this.eax);
		} else if (isLinear){
			this.program.newLinearCall(chartObj, this.eax, this.ebx, this.eax);
		} else if (isPoly){
			this.program.newPolyCall(chartObj, this.eax, this.ebx, this.eax);
		} else if (isClamp){
			this.program.newClampCall(chartObj, this.eax, this.ebx, this.eax);
		}

		return true;
	}

	doIdent(){
		let identName = this.token.value;
		let identObj = this.getIdentObject(identName);
		if (!identObj) return this.setError("Identifier doesnt exist '"+identName+"!");
		this.program.newMov(this.eax, identObj);
		return this.match(TokenType.Ident);
	}

	doFactor(){
		switch (this.token.type){
		case TokenType.Nil:
			this.program.newMov(this.eax, null);
			return this.match(TokenType.Nil);
		case TokenType.This:
			this.program.newMov(this.eax, this.returnedValue);
			return this.match(TokenType.This);
		case TokenType.Constant:
			if (typeof this.token.value !== "number") return this.setError("Null constant");
			this.program.newMov(this.eax, this.token.value);
			return match(TokenType.Constant);
		case TokenType.Ident:
			return this.doIdent();
		case TokenType.ChartCall:
			return this.doChartCall();
		case TokenType.LeftParen:
			if (!this.match(TokenType.LeftParen)) return false;
			if (!this.doExpression()) return false;
			if (!this.match(TokenType.RightParen)) return false;
			return true;
		case TokenType.Minus:
			if (!this.match(TokenType.Minus)) return false;
			if (!this.doFactor()) return false;
			this.program.newNeg(this.eax);
			return true;
		case TokenType.True:
			this.program.newMov(this.eax, true);
			return this.match(TokenType.True);
		case TokenType.False:
			this.program.newMov(this.eax, false);
			return this.match(TokenType.False);
		case TokenType.Not:
			if (!this.match(TokenType.Not)) return false;
			if (!this.doFactor()) return false;
			this.program.newNot(this.eax);
			return true;
		case TokenType.FuncBoolIsNil:
			return this.doIsNil();
		case TokenType.FuncAbs:
			return this.doAbs();
		case TokenType.FuncClamp:
			return this.doClamp();
		case TokenType.FuncMin:
			return this.doMin();
		case TokenType.FuncMax:
			return this.doMax();
		}
		return this.setError("Expected factor but found "+this.token.type+":"+this.token.value);
	}

	doPower(){
		if (!this.doFactor()) return false;
		while (this.isPowerOp()){
			this.program.newPush(this.eax);
			switch (this.token.type){
			case TokenType.Exponent:
				if (!this.match(TokenType.Exponent)) return false;
				if (!this.doFactor()) return false;
				this.program.newMov(this.ebx, this.eax);
				this.program.newPop(this.eax);
				this.program.newPower(this.eax, this.ebx);
				break;
			}
		}
		return true;
	}

	doTerm(){
		if (!this.doPower()) return false;
		while (this.isTermOp()){
			this.program.newPush(this.eax);
			switch (this.token.type){
			case TokenType.Multiply:
				if (!this.match(TokenType.Multiply)) return false;
				if (!this.doPower()) return false;
				this.program.newPop(this.ebx);
				this.program.newMul(this.eax, this.ebx);
				break;
			case TokenType.Divide:
				if (!this.match(TokenType.Divide)) return false;
				if (!this.doPower()) return false;
				this.program.newMove(this.ebx, this.eax);
				this.program.newPop(this.eax);
				this.program.newDiv(this.eax, this.ebx);
				break;
			}
		}
		return true;
	}

	doAdd(){
		if (!this.doTerm()) return false;
		while (this.isAddOp()){
			this.program.newPush(this.eax);
			switch (this.token.type){
			case TokenType.Plus:
				if (!this.match(TokenType.Plus)) return false;
				if (!this.doTerm()) return false;
				this.program.newPop(this.ebx);
				this.program.newAdd(this.eax, this.ebx);
			case TokenType.Minus:
				if (!this.match(TokenType.Minus)) return false;
				if (!this.doTerm()) return false;
				this.program.newPop(this.ebx);
				this.program.newSub(this.eax, this.ebx);
				this.program.newNeg(this.eax);
			}
		}
		return true;
	}

	doCompare(){
		if (!this.doAdd()) return false;
		while (this.isCompareOp()){
			this.program.newPush(this.eax);
			let compareType=this.token.type;
			if (!this.match(compareType)) return false;
			if (!this.doAdd()) return false;
			this.program.newPop(this.ebx);
			this.program.newCmp(this.ebx, this.eax);
			switch (compareType){
			case TokenType.Equals:
				this.program.newSE(this.eax);
				break;
			case TokenType.NotEquals:
				this.program.newSNE(this.eax);
				break;
			case TokenType.Greater:
				this.program.newSA(this.eax);
				break;
			case TokenType.GreaterEquals:
				this.program.newSAE(this.eax);
				break;
			case TokenType.Lesser:
				this.program.newSB(this.eax);
				break;
			case TokenType.LesserEquals:
				this.program.newSBE(this.eax);
				break;
			}
		}
		return true;
	}

	doAnd(){
		if (!this.doCompare()) return false;
		while (this.isAndOp()){
			this.program.newPush(this.eax);
			if (this.token.type===TokenType.And){
				if (!this.match(TokenType.And)) return false;
				if (!this.doCompare()) return false;
				this.program.newPop(this.ebx);
				this.program.newAnd(this.eax, this.ebx);
			}
		}
		return true;
	}

	doExpression(){
		if (!this.doAnd()) return false;
		while (this.isOrOp()){
			this.program.newPush(this.eax);
			if (this.token.type===TokenType.Or){
				if (!this.match(TokenType.Or)) return false;
				if (!this.doAnd()) return false;
				this.program.newPop(this.ebx);
				this.program.newOr(this.eax, this.ebx);
			}
		}
		return true;
	}

	doIf(breakToBranch){
		let elseLabel = this.newBranch();
		let endLabel = this.newBranch();
		if (!this.match(TokenType.If)) return false;
		if (!this.doExpression()) return false;

		this.program.newTest(this.eax);
		this.program.newJE(elseLabel);

		if (!this.match(TokenType.LeftCurly)) return false;
		if (!this.doBlock(breakToBranch, true)) return false;
		if (!this.match(TokenType.RightCurly)) return false;

		this.program.newJmp(endLabel);
		this.program.newLabel(elseLabel);

		if (this.token.type === TokenType.Else) {
			if (!this.match(TokenType.Else)) return false;
			if (this.token.type === TokenType.If) {
				if (!this.doIf(breakToBranch)) return false;
			} else {
				if (!this.match(TokenType.LeftCurly)) return false;
				if (!this.doBlock(breakToBranch, true)) return false;
				if (!this.match(TokenType.RightCurly)) return false;
			}
		}
		this.program.newLabel(endLabel);
		return true;
	}

	doWhile(breakToBranch){
		let loopLabel = this.newBranch();
		let endLabel = this.newBranch();
		if (!this.match(TokenType.While)) return false;
		this.program.newLabel(loopLabel);
		if (!this.doExpression()) return false;
		this.program.newTest(this.eax);
		this.program.newJE(endLabel);
		if (!this.match(TokenType.LeftCurly)) return false;
		if (!this.doBlock(endLabel, true)) return false;
		if (!this.match(TokenType.RightCurly)) return false;
		this.program.newJmp(loopLabel);
		this.program.newLabel(endLabel);
		return true;
	}

	doBreak(breakToBranch){
		if (!this.match(TokenType.Break)) return false;
		if (breakToBranch===null || breakToBranch===undefined) return this.setError("No loop to break from.");
		this.program.newJmp(breakToBranch);
		return this.match(TokenType.LineDelim);
	}

	doReturn(){
		if (!this.match(TokenType.Return)) return false;
		if (!this.doExpression()) return false;
		this.program.newRet();
		return this.match(TokenType.LineDelim);
	}

	doDouble(){
		if (!this.match(TokenType.Double)) return false;
		if (this.token.type!==TokenType.Ident) return this.setError("Expected identifier but found "+this.token.value);
		let notDone=true;
		while (notDone){
			notDone=false;
			varName = this.token.value;
			if (!addVariable(varName, false, null)) return false;
			if (!this.match(TokenType.Ident)) return false;
			if (this.token.type === TokenType.Assignment){
				if (!this.doAssignmentWithName(varName)) return false;
			}
			if (this.token.type === TokenType.Comma){
				if (!this.match(TokenType.Comma)) return false;
				notDone=true;
			}
		}
		return this.match(TokenType.LineDelim);
	}

	doAssignmentWithName(varName){
		varObject = getVariable(varName);
		if (!varObject) return this.setError(varName+" variable doesnt exist!");
		if (!this.match(TokenType.Assignment)) return false;
		if (!this.doExpression()) return false;
		this.program.newMov(varObject, this.eax);
		return true;
	}

	doAssignment(){
		if (this.token.value==="") return this.setError("Empty identifier");
		if (!this.match(TokenType.Ident)) return false;
		if (!this.doAssignmentWithName(this.token.value)) return false;
		return this.match(TokenType.LineDelim);
	}

	doBlock(breakToBranch, ifWantsRightCurly){
		while (this.token.type){
			switch (this.token.type){
			case TokenType.If:
				if (!this.doIf(breakToBranch)) return false;
				break;
			case TokenType.While:
				if (!this.doWhile(breakToBranch)) return false;
				break;
			case TokenType.Break:
				if (!this.doBreak(breakToBranch)) return false;
				break;
			case TokenType.Return:
				if (!this.doReturn()) return false;
				break;
			case TokenType.Double:
				if (!this.doDouble()) return false;
				break;
			case TokenType.MsgBox:
				if (!this.match(TokenType.MsgBox)) return false;
				msgString = this.token.value;
				if (!this.match(TokenType.String)) return false;
				this.program.newMsgBox(msgString);
				if (!this.match(TokenType.LineDelim)) return false;
				break;
			case TokenType.This:
				if (!this.match(TokenType.This)) return false;
				if (!this.match(TokenType.Assignment)) return false;
				if (!this.doExpression()) return false;
				this.program.newMov(this.returnedValue, this.eax);
				if (!this.match(TokenType.LineDelim)) return false;
				break;
			case TokenType.Ident:
				if (!this.doAssignment()) return false;
				break;
			case TokenType.LineDelim:
				if (!this.match(TokenType.LineDelim)) return false;
				break;
			case TokenType.RightCurly:
				if (ifWantsRightCurly) return true;
				return this.setError("Unexpected token in block, "+this.token.type);
			default:
				return this.setError("Unexpected token in block, "+this.token.type);
			}
		}
		if (ifWantsRightCurly) return this.setError("Expected '}' but found "+this.token.type);
		return true;
	}

	compile(chartObjectArray){
		this.program.clear();
		this.errorCodeLine=1;
		this.variables=[];
		this.branchCounter=1;
		this.errorWasDuring=ERROR_WAS_IN.COMPILE;
		this.code=this.code;//reset the look, lookindex and all that
		this.chartObjectArray=Array.isArray(chartObjectArray) ? chartObjectArray : [];

		if (this.next()){
			if (!this.doBlock(null, false)) return false;
			return true;
		}
		return false;
	}

	getVariable(varName){
		varName=varName.toLowerCase();
		for (let curVar of this.variables){
			if (curVar.name===varName){
				return curVar;
			}
		}
		return null;
	}

	addVariable(varName, initialValue=null){
		varName=varName.toLowerCase();
		if (!this.getVariable(varName)){
			this.variables.push({name: varName, value: initialValue});
			return true;
		}
		return this.setError("Duplicate variable name");
	}

	getChartObject(chartName){
		chartName=chartName.toLowerCase();

	}
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