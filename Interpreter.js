const TokenType =  {
    Constant:"number",Ident:"ident",LeftParen:"(",RightParen:")",Exponent:"^",
    Plus:"+",Minus:"-",Divide:"/",Multiply:"*",Assignment:"=",Equals:"==",
    NotEquals:"!=",Lesser:"<",Greater:">",LesserEquals:"<=",GreaterEquals:">=",
    FuncMin:"min",FuncMax:"max",FuncAbs:"abs",FuncClamp:"clamp",FuncBoolIsNil:"isnil",
    While:"while",If:"if",LeftCurly:"{",RightCurly:"}",Return:"return",Else:"else",
    Break:"break",LineDelim:";",Not:"!",And:"&&",Or:"||",Comma:",",Let:"let",
    True:"true",False:"false",Nil:"nil",ChartCall:"@",This:"this",String:"string",
    MsgBox:"msgbox", Mod:"%", FuncFloor:"floor", FuncCeil:"ceiling"
};


function isAnyNil(...vals){
    for (let a of vals){
        if (a===null || a===undefined) return true;
    }
    return false;
}

function isAboutEquals(a, b, allowableDelta=0.00001){
    if (isAnyNil(a,b)) return false;

    if (Math.abs(a-b)<=allowableDelta){
        return true;
    }
    return false;
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
	static isnilID=33;
	static modID=34;
	static floorID=35;
	static ceilID=36;
	
	static newOp(type, codeLine, op, ...stuff){
		let retObj={type: type, codeLine: codeLine, op: op};
		for (let i=0;i<stuff.length;i++){
			if (typeof stuff[i] !== "object" || stuff[i]===null){
				let valType="num";
				switch (typeof stuff[i]){
				case "boolean":
					valType="bool";
					break;
				case "string":
					valType="str";
					break;
				}
				stuff[i]={value: stuff[i], valType: valType, isConstant: true};
			}
			retObj["obj"+i]=stuff[i];
		}
		return retObj;
	}	
	
	constructor(){
		this._opCodes=[];
		this.currentCodeLine=1;
		this._hadLinkError=false;
		this._isLinked=false;
		this._isOptimized=false;
		this._errorString="";
		this._errorOnLine=0;
	}

	newNeg(objToNeg){ this._opCodes.push(Executable.newOp(Executable.negID, this.currentCodeLine, "neg", objToNeg)); }
	newLabel(labelId){ this._opCodes.push(Executable.newOp(Executable.lblID, this.currentCodeLine, "lbl", labelId)); }
	newPush(objToPush){ this._opCodes.push(Executable.newOp(Executable.pushID, this.currentCodeLine, "push", objToPush)); }
	newPop(popIntoThisObj){ this._opCodes.push(Executable.newOp(Executable.popID, this.currentCodeLine, "pop", popIntoThisObj)); }
	newCmp(objA, objB){ this._opCodes.push(Executable.newOp(Executable.cmpID, this.currentCodeLine, "cmp", objA, objB)); }
	newJA(jumpToThisBranchId){ this._opCodes.push(Executable.newOp(Executable.jaID, this.currentCodeLine, "ja", jumpToThisBranchId));}
	newJB(jumpToThisBranchId){ this._opCodes.push(Executable.newOp(Executable.jbID, this.currentCodeLine, "jb", jumpToThisBranchId)); }
	newMov(recvObj, sendObj){ this._opCodes.push(Executable.newOp(Executable.movID, this.currentCodeLine, "mov", recvObj, sendObj)); }
	newTrendCall(chart, returnObj, objA, objB, objC){ this._opCodes.push(Executable.newOp(Executable.trendID, this.currentCodeLine, "trend", chart, returnObj, objA, objB, objC)); }
	newLinearCall(chart, returnObj, objA, objB){ this._opCodes.push(Executable.newOp(Executable.linearID, this.currentCodeLine, "linear", chart, returnObj, objA, objB)); }
	newPolyCall(chart, returnObj, objA, objB){ this._opCodes.push(Executable.newOp(Executable.polyID, this.currentCodeLine, "poly", chart, returnObj, objA, objB)); }
	newClampCall(chart, returnObj, objA, objB){ this._opCodes.push(Executable.newOp(Executable.clampID, this.currentCodeLine, "clamp", chart, returnObj, objA, objB)); }
	newNot(objToNot){ this._opCodes.push(Executable.newOp(Executable.notID, this.currentCodeLine, "not", objToNot)); }
	newExponent(recvObj, exponentObj){ this._opCodes.push(Executable.newOp(Executable.exponentID, this.currentCodeLine, "pow", recvObj, exponentObj)); }
	newMul(recvObj, multiplyByObj){ this._opCodes.push(Executable.newOp(Executable.mulID, this.currentCodeLine, "mul", recvObj, multiplyByObj)); }
	newDiv(recvObj, divideByObj){ this._opCodes.push(Executable.newOp(Executable.divID, this.currentCodeLine, "div", recvObj, divideByObj)); }
	newAdd(recvObj, addThisObj){ this._opCodes.push(Executable.newOp(Executable.addID, this.currentCodeLine, "add", recvObj, addThisObj)); }
	newSub(recvObj, subtractThisObj) {this._opCodes.push(Executable.newOp(Executable.subID, this.currentCodeLine, "sub", recvObj, subtractThisObj));}
	newSE(setThisObj) {this._opCodes.push(Executable.newOp(Executable.seID, this.currentCodeLine, "se", setThisObj));}
	newSNE(setThisObj) {this._opCodes.push(Executable.newOp(Executable.sneID, this.currentCodeLine, "sne", setThisObj));}
	newSA(setThisObj) {this._opCodes.push(Executable.newOp(Executable.saID, this.currentCodeLine, "sa", setThisObj));}
	newSAE(setThisObj) {this._opCodes.push(Executable.newOp(Executable.saeID, this.currentCodeLine, "sae", setThisObj));}
	newSB(setThisObj) {this._opCodes.push(Executable.newOp(Executable.sbID, this.currentCodeLine, "sb", setThisObj));}
	newSBE(setThisObj) {this._opCodes.push(Executable.newOp(Executable.sbeID, this.currentCodeLine, "sbe", setThisObj));}
	newAnd(recvObj, otherObj) {this._opCodes.push(Executable.newOp(Executable.andID, this.currentCodeLine, "and", recvObj, otherObj));}
	newOr(recvObj, otherObj) {this._opCodes.push(Executable.newOp(Executable.orID, this.currentCodeLine, "or", recvObj, otherObj));}
	newJE(jumpToThisBranchId) {this._opCodes.push(Executable.newOp(Executable.jeID, this.currentCodeLine, "je", jumpToThisBranchId));}
	newJNE(jumpToThisBranchId) {this._opCodes.push(Executable.newOp(Executable.jneID, this.currentCodeLine, "jne", jumpToThisBranchId));}
	newTest(testObj) {this._opCodes.push(Executable.newOp(Executable.testID, this.currentCodeLine, "test", testObj));}
	newJmp(jumpToThisBranchId) {this._opCodes.push(Executable.newOp(Executable.jmpID, this.currentCodeLine, "jmp", jumpToThisBranchId));}
	newRet(retObj) {this._opCodes.push(Executable.newOp(Executable.retID, this.currentCodeLine, "ret", retObj));}
	newMsgBox(stringToShow) {this._opCodes.push(Executable.newOp(Executable.msgboxID, this.currentCodeLine, "msgbox", stringToShow));}
	newIsNil(recvObj, identObj) {this._opCodes.push(Executable.newOp(Executable.isnilID, this.currentCodeLine, "isnil", recvObj, identObj));}
	newMod(recvObj, divideByObj){this._opCodes.push(Executable.newOp(Executable.modID, this.currentCodeLine, "mod", recvObj, divideByObj));}
	newFloor(objToFloor){this._opCodes.push(Executable.newOp(Executable.floorID, this.currentCodeLine, "floor", objToFloor));}
	newCeil(objToCeil){this._opCodes.push(Executable.newOp(Executable.ceilID, this.currentCodeLine, "ceil", objToCeil));}


	reset(){
		this._opCodes=[];
		this.currentCodeLine=1;
		this._hadLinkError=false;
		this._isLinked=false;
		this._isOptimized=false;
		this._errorString="";
		this._errorOnLine=0;
	}

	get errorString(){
		return this._errorString;
	}

	hadError(codeLine, returnObject, errorMsg){
		returnObject.value=null;
		this._errorString="Runtime error on line "+codeLine+": "+errorMsg;
		return false;
	}

	isGoodNumVal(val){
		if (val===undefined || val===null || !Number.isFinite(val) && typeof val!=="boolean") return false;
		return true;
	}

	getLabelIndex(labelID){
		for (let i=0;i<this._opCodes.length;i++){
			if (this._opCodes[i].type===Executable.lblID){
				if (this._opCodes[i].obj0.value===labelID){
					return i;
				}
			}
		}
		return null;
	}

	optimize(){
		if (this._isLinked){
			this._isOptimized=true;
			return true;
		}
		if (this._isOptimized) return true;
	
		let stillOptimizing=true;
		while (stillOptimizing){
			stillOptimizing=false;

			for (let i=0;i<this._opCodes.length-1;i++){
				let cur=this._opCodes[i];
				let next=this._opCodes[i+1];

				if (cur.type===Executable.movID && next.type===Executable.movID){
					//mov/mov
					if (cur.obj0===next.obj1 && cur.obj1===next.obj0){
						//mov x,y   mov y,x   =>   mov x,y
						this._opCodes.splice(i+1,1);
						stillOptimizing=true;
						continue;
					}else if (cur.obj0===next.obj1 && cur.obj0.isRegister===true){
						//mov reg,x   mov y,reg   =>   mov y,x
						cur.obj0=next.obj0;
						this._opCodes.splice(i+1,1);
						stillOptimizing=true;
						continue;
					}
				}

				if (cur.type===Executable.movID && next.type===Executable.pushID){
					//mov reg,x   push reg   =>   push x
					if (cur.obj0===next.obj0 && cur.obj0.isRegister===true){
						next.obj0=cur.obj1;
						this._opCodes[i]=this._opCodes[i+1];
						this._opCodes.splice(i+1,1);
						stillOptimizing=true;
						continue;
					}
				}

				if (cur.type===Executable.movID && cur.obj0.isRegister===true && cur.obj1.isConstant){
					switch (next.type){
					case Executable.addID:
					case Executable.subID:
					case Executable.mulID:
					case Executable.divID:
					case Executable.modID:
					case Executable.exponentID:
					case Executable.orID:
					case Executable.andID:
						if (next.obj1===cur.obj0){
							next.obj1=cur.obj1;
							this._opCodes.splice(i,1);
							i++;
							stillOptimizing=true;
							continue;
						}
						break;
					}
				}

				if (cur.type===Executable.pushID && cur.obj0.isRegister!==true){
					//push constant
					//pop register   =>   mov register, constant
					let level=0;
					for (let j=i+1;j<this._opCodes.length-1;j++){
						if (this._opCodes[j].type===Executable.pushID) level++;
						if (this._opCodes[j].type===Executable.popID){
							if (level>0){
								level--;
							}else{
								this._opCodes[j]=Executable.newOp(Executable.movID, this._opCodes[j].codeLine, "mov", this._opCodes[j].obj0, cur.obj0);
								this._opCodes.splice(i,1);
								stillOptimizing=true;
								break;
							}
						}
					}
					if (stillOptimizing) continue;
				}
				
			}
		}
		this._isOptimized=true;
		return true;
	}

	link(){
		this.optimize();
		if (this._hadLinkError) return false;
		if (this._isLinked) return true;
		for (let i=0;i<this._opCodes.length;i++){
			switch (this._opCodes[i].type){
			case Executable.jmpID:
			case Executable.jaID:
			case Executable.jbID:
			case Executable.jeID:
			case Executable.jneID:
				this._opCodes[i].obj0.value = this.getLabelIndex(this._opCodes[i].obj0.value);
				if (this._opCodes[i].obj0.value===null){
					this._hadLinkError=true;
					return false;	
				} 
				break;
			}
		}
		this._isLinked=true;
		return true;
	}

	numToBool(val){
		if (Math.abs(val)<0.5) return false;
		return true;
	}

	execute(returnObject, messageBoxFunction, timeOutMillis){
		let stack=[];
		let flagA=false;
		let flagB=false;
		let flagE=false;

		if (!this.link()) return this.hadError(0, returnObject, "link failed");

		let maxRunTime=new Date().getTime()+timeOutMillis;

		for (let eip=0; eip<this._opCodes.length; eip++){
			let curOp = this._opCodes[eip];
			
			if (new Date().getTime() > maxRunTime) return this.hadError(curOp.codeLine, returnObject, "script execution took to long, timed out");

			switch (curOp.type){
			case Executable.lblID:
				//Perform no action, essentially a nop
				continue;
			case Executable.modID:
				if (!this.isGoodNumVal(curOp.obj0.value) ||
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot mod with nil value(s)");
				curOp.obj0.value = curOp.obj0.value % curOp.obj1.value;
				curOp.obj0.valType = "num";
				break;
			case Executable.floorID:
				if (!this.isGoodNumVal(curOp.obj0.value)) return this.hadError(curOp.codeLine, returnObject, "cannot floor nil value");
				curOp.obj0.value = Math.floor(curOp.obj0.value);
				curOp.obj0.valType = "num";
				break;
			case Executable.ceilID:
				if (!this.isGoodNumVal(curOp.obj0.value)) return this.hadError(curOp.codeLine, returnObject, "cannot ceil nil value");
				curOp.obj0.value = Math.ceil(curOp.obj0.value);
				curOp.obj0.valType = "num";
				break;
			case Executable.movID:
				curOp.obj0.value = curOp.obj1.value;
				curOp.obj0.valType = curOp.obj1.valType;
				break;
			case Executable.notID:
				if (!this.isGoodNumVal(curOp.obj0.value)) return this.hadError(curOp.codeLine, returnObject, "cannot not nil value");
				curOp.obj0.value = !this.numToBool(curOp.obj0.value);
				curOp.obj0.valType = "bool";
				break;
			case Executable.negID:
				if (!this.isGoodNumVal(curOp.obj0.value)) return this.hadError(curOp.codeLine, returnObject, "cannot negate nil value");
				curOp.obj0.valType = "num";
				curOp.obj0.value=0-curOp.obj0.value;
				break;
			case Executable.exponentID:
				if (!this.isGoodNumVal(curOp.obj0.value) ||
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot raise to power with nil value(s)");
				curOp.obj0.value = curOp.obj0.value ** curOp.obj1.value;
				curOp.obj0.valType = "num";
				break;
			case Executable.mulID:
				if (!this.isGoodNumVal(curOp.obj0.value) ||
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot multiply with nil value(s)");
				curOp.obj0.value = curOp.obj0.value * curOp.obj1.value;
				curOp.obj0.valType = "num";
				break;
			case Executable.divID:
				if (!this.isGoodNumVal(curOp.obj0.value) ||
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot divide with nil value(s)");
				curOp.obj0.value = curOp.obj0.value / curOp.obj1.value;
				curOp.obj0.valType = "num";
				break;
			case Executable.addID:
				if (!this.isGoodNumVal(curOp.obj0.value) ||
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot add with nil value(s)");
				curOp.obj0.value = curOp.obj0.value + curOp.obj1.value;
				curOp.obj0.valType = "num";
				break;
			case Executable.subID:
				if (!this.isGoodNumVal(curOp.obj0.value) ||
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot sub with nil value(s)");
				curOp.obj0.value = curOp.obj0.value - curOp.obj1.value;
				curOp.obj0.valType = "num";
				break;

			case Executable.andID:
				if (!this.isGoodNumVal(curOp.obj0.value) || 
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot and with nil value(s)");
				curOp.obj0.value=this.numToBool(curOp.obj0.value) && this.numToBool(curOp.obj1.value);
				curOp.obj0.valType="bool";
				break;
			case Executable.orID:
				if (!this.isGoodNumVal(curOp.obj0.value) || 
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot or with nil value(s)");
				curOp.obj0.value=this.numToBool(curOp.obj0.value) || this.numToBool(curOp.obj1.value);
				curOp.obj0.valType="bool";
				break;

			case Executable.pushID:
				stack.push({value: curOp.obj0.value, valType: curOp.obj0.valType});
				break;
			case Executable.popID:
				if (stack.length===0) return this.hadError(returnObject, "attempted pop on empty stack");
				let poppedObj = stack.pop();
				curOp.obj0.value=poppedObj.value;
				curOp.obj0.valType=poppedObj.valType;
				break;

			case Executable.testID:
				flagE=!this.numToBool(curOp.obj0.value);
				break;
			case Executable.cmpID:				
				if (!this.isGoodNumVal(curOp.obj0.value) || 
					!this.isGoodNumVal(curOp.obj1.value)) return this.hadError(curOp.codeLine, returnObject, "cannot cmp with nil value(s)");
					
				flagA=false;
				flagB=false;
				flagE=false;

				if (curOp.obj0.valType==="bool" || curOp.obj1.valType==="bool"){
					//At least one is a bool, convert both to bools and compare
					flagE=this.numToBool(curOp.obj0.value) === this.numToBool(curOp.obj1.value);
				}else {
					//Both are numbers
					if (curOp.obj0.value > curOp.obj1.value) flagA=true;
					if (curOp.obj0.value < curOp.obj1.value) flagB=true;
					if (isAboutEquals(curOp.obj0.value, curOp.obj1.value)) flagE=true;
				}
				break;
			case Executable.trendID:
				if (!this.isGoodNumVal(curOp.obj2.value) || 
					!this.isGoodNumVal(curOp.obj3.value) ||
					!this.isGoodNumVal(curOp.obj4.value)) return this.hadError(curOp.codeLine, returnObject, "cannot figureTrend with nil value(s)");
				curOp.obj1.value = curOp.obj0.figureTrend(curOp.obj2.value, curOp.obj3.value, curOp.obj4.value);
				curOp.obj1.valType = "num";
				break;
			case Executable.linearID:
				if (!this.isGoodNumVal(curOp.obj2.value) || 
					!this.isGoodNumVal(curOp.obj3.value)) return this.hadError(curOp.codeLine, returnObject, "cannot figureChart with nil value(s)");
				curOp.obj1.value = curOp.obj0.figureChart(curOp.obj2.value, curOp.obj3.value);
				curOp.obj1.valType = "num";
				break;
			case Executable.polyID:
				if (!this.isGoodNumVal(curOp.obj2.value) || 
					!this.isGoodNumVal(curOp.obj3.value)) return this.hadError(curOp.codeLine, returnObject, "cannot figurePoly with nil value(s)");
				curOp.obj1.value = curOp.obj0.figurePoly(curOp.obj2.value, curOp.obj3.value);
				curOp.obj1.valType = "num";
				break;
			case Executable.clampID:
				if (!this.isGoodNumVal(curOp.obj2.value) || 
					!this.isGoodNumVal(curOp.obj3.value)) return this.hadError(curOp.codeLine, returnObject, "cannot figureClamp with nil value(s)");
				curOp.obj1.value = curOp.obj0.figureClamp(curOp.obj2.value, curOp.obj3.value);
				curOp.obj1.valType = "num";
				break;
			case Executable.seID:
				curOp.obj0.valType="bool";
				curOp.obj0.value=flagE;
				break;
			case Executable.sneID:
				curOp.obj0.valType="bool";
				curOp.obj0.value=!flagE;
				break;
			case Executable.saID:
				curOp.obj0.valType="bool";
				curOp.obj0.value=flagA;
				break;
			case Executable.saeID:
				curOp.obj0.valType="bool";
				curOp.obj0.value=flagA || flagE;
				break;
			case Executable.sbID:
				curOp.obj0.valType="bool";
				curOp.obj0.value=flagB;
				break;
			case Executable.sbeID:
				curOp.obj0.valType="bool";
				curOp.obj0.value=flagB || flagE;
				break;
			case Executable.jaID:
				if (flagA && !flagE) eip=curOp.obj0.value;
				break;
			case Executable.jbID:
				if (flagB && !flagE) eip=curOp.obj0.value;
				break;
			case Executable.jeID:
				if (flagE) eip=curOp.obj0.value;
				break;
			case Executable.jneID:
				if (!flagE) eip=curOp.obj0.value;
				break;
			case Executable.jmpID:
				eip=curOp.obj0.value;
				break;
			case Executable.retID:
				returnObject.value=curOp.obj0.value;
				return true;
			case Executable.msgboxID:
				//log how much time it takes for the messageBoxFunction to do so we can add it to the timeout end time
				let msgStartTime=new Date().getTime();
				messageBoxFunction(curOp.obj0.value);
				maxRunTime+=new Date().getTime()-msgStartTime;
				break;
			case Executable.isnilID:
				curOp.obj0.valType="bool";
				curOp.obj0.value=!this.isGoodNumVal(curOp.obj1.value);
			}
		}

		return true;
	}
}

class Interpreter {
    constructor(owningChartObject, code){
		this.program = new Executable();
		this.owningChartObject=owningChartObject;
		this.returnedValue={value: null, valType:"num", name:"$returnVal"};
		this.eax={value: null, valType:"num", name:"$eax", isRegister: true};
		this.ebx={value: null, valType:"num", name:"$ebx", isRegister: true};
		this.ecx={value: null, valType:"num", name:"$ecx", isRegister: true};
		this.code=code;
    }

    set code(value){
		this._code=value;

		this.token={type: null, value: null};
        this.lookIndex=0;
        this.look=this._code[0];
		this.codeEndIndex=this._code.length;

		this.errorHappened=false;
		this.errorString="";
		this.errorCodeLine=1;
		this.errorWasDuring="compile";

		this.program.reset();
		this.variables=[];
		this.branchCounter=0;
    }
    get code(){ return this._code; }
    
    getPhaseOfError(){ return this.errorWasDuring; }
    getErrorMessage(){ return this.errorString; }
    getErrorLine(){ return this.errorCodeLine;}

	setError(msg){
		this.errorHappened=true;
		this.errorString=msg;
		return false
	}

    setToken(type, value=null){
        this.token.type=type;
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
        return this.lookIndex<this.codeEndIndex;
    }

    getChar(){
        if (this.isNotEnd()){
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
		} else if (name === "floor"){
            this.setToken(TokenType.FuncFloor);
		} else if (name === "ceiling"){
            this.setToken(TokenType.FuncCeil);
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
            this.setToken(TokenType.Let);
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
				case '%':
					this.setToken(TokenType.Mod);
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
		return ++this.branchCounter;
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
		if (!this.match(TokenType.FuncCeil)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
		this.program.newCeil(this.eax);
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}
	doFloor(){
		if (!this.match(TokenType.FuncFloor)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
		this.program.newFloor(this.eax);
		if (!this.match(TokenType.RightParen)) return false;
		return true;
	}

	doAbs(){
		let ifPosBranch = this.newBranch();
		if (!this.match(TokenType.FuncAbs)) return false;
		if (!this.match(TokenType.LeftParen)) return false;
		if (!this.doExpression()) return false;
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

		let identObj=null;
		if (this.token.type!==TokenType.This){
			identObj = this.getIdentObject(this.token.value);
			if (!identObj) return this.setError(this.token.value+" doesnt exist!");
			if (!this.match(TokenType.Ident)) return false;
		}else{
			identObj=this.returnedValue;
			if (!this.match(TokenType.This)) return false;
		}

		this.program.newIsNil(this.eax, identObj);

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
		if (!identObj) return this.setError("Identifier doesnt exist '"+identName+"'!");
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
			return this.match(TokenType.Constant);
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
			this.program.newMov(this.eax, {value: true, valType:"bool", name:"true"});
			return this.match(TokenType.True);
		case TokenType.False:
			this.program.newMov(this.eax, {value: false, valType:"bool", name:"false"});
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
		case TokenType.FuncFloor:
			return this.doFloor();
		case TokenType.FuncCeil:
			return this.doCeil();
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
				this.program.newExponent(this.eax, this.ebx);
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
				this.program.newMov(this.ebx, this.eax);
				this.program.newPop(this.eax);
				this.program.newDiv(this.eax, this.ebx);
				break;
			case TokenType.Mod:
				if (!this.match(TokenType.Mod)) return false;
				if (!this.doPower()) return false;
				this.program.newMov(this.ebx, this.eax);
				this.program.newPop(this.eax);
				this.program.newMod(this.eax, this.ebx);
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
				break;
			case TokenType.Minus:
				if (!this.match(TokenType.Minus)) return false;
				if (!this.doTerm()) return false;
				this.program.newPop(this.ebx);
				this.program.newSub(this.eax, this.ebx);
				this.program.newNeg(this.eax);
				break;
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
		this.program.newRet(this.eax);
		return this.match(TokenType.LineDelim);
	}

	doLet(){
		if (!this.match(TokenType.Let)) return false;
		if (this.token.type!==TokenType.Ident) return this.setError("Expected identifier but found "+this.token.value);
		let notDone=true;
		while (notDone){
			notDone=false;
			let varName = this.token.value;
			if (!this.addVariable(varName, null)) return false;
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
		let varObject = this.getVariable(varName);
		if (!varObject) return this.setError(varName+" variable doesnt exist!");
		if (!this.match(TokenType.Assignment)) return false;
		if (!this.doExpression()) return false;
		this.program.newMov(varObject, this.eax);
		return true;
	}

	doAssignment(){
		if (this.token.value==="") return this.setError("Empty identifier");
		let varName=this.token.value;
		if (!this.match(TokenType.Ident)) return false;
		if (!this.doAssignmentWithName(varName)) return false;
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
			case TokenType.Let:
				if (!this.doLet()) return false;
				break;
			case TokenType.MsgBox:
				if (!this.match(TokenType.MsgBox)) return false;
				let msgString = this.token.value;
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
		if (!this.getVariable(varName) && !this.getChartObject(varName, false)){
			this.variables.push({name: varName, value: initialValue});
			return true;
		}
		return this.setError("Duplicate variable name");
	}

	getChartObject(chartName, careAboutOrder=true){
		chartName=chartName.toLowerCase();
		for (let i=0;i<this.chartObjectArray.length;i++){
			if (this.chartObjectArray[i]===this.owningChartObject && careAboutOrder===true){
				break;
			}
			if (this.chartObjectArray[i].name.toLowerCase()===chartName){
				return this.chartObjectArray[i];
			}
		}
		return null;
	}

	getIdentObject(objName){
		objName=objName.toLowerCase();
		let retObj=this.getVariable(objName);
		if (!retObj){
			retObj=this.getChartObject(objName);
		}
		return retObj;
	}

	compile(chartObjectArray){
		this.code=this.code;//reset the look, lookindex and all that
		this.chartObjectArray=Array.isArray(chartObjectArray) ? chartObjectArray : [];
		if (this.next()){
			if (!this.doBlock(null, false)) return false;
			this.errorWasDuring="linking";
			if (!this.program.link()) return this.setError("Linking failed");
			this.errorWasDuring="execution";
			return true;
		}
		return false;
	}

	run(chartObjectArray, initialThisValue, timeoutTime=5000){
		this.errorHappened=false;
		if (!this.compile(chartObjectArray)){
			return null;
		}

		this.returnedValue.value=initialThisValue;

		if (!this.program.execute(this.returnedValue, console.log, timeoutTime)){
			this.errorWasDuring="execution";
			this.setError(this.program.errorString);
			return null;
		}
		if (this.returnedValue.value===true) return 1;
		if (this.returnedValue.value===false) return 0;
		return this.returnedValue.value;
	}
}


module.exports = Interpreter;


//Reserved words
//abs, break, clamp, double, else, if, isnil, max, min, nil, msgbox, return, this, while

//There is only one data type, double. Boolean expression are simulated with
//any value >-0.5 and <+0.5 evaluating to false, otherwise true. Using the keywords
//true and false can be misleading as a variable holding the value 1.1 will not be
//equal to true due to true exactly being 1, and false being 0.

//Variables can also be set to nil. Any locally created variable is initially set to nil unless explicitly set.
//To test for nil use isNil( <ident> ).

//The key word 'this' acts as a variable and once the script is done running the return value will be 'this'.
//Alternatively you can use return <expression> to return a value.

//All statements will be terminated with a ;

//When using the script in an ChartInput object, 'this' is set to what the user inputted, allowing checking and enforcment of values
//e.g.  this=clamp(this, 0, 100)
//That script in an input object would force an input object to be between 0 and 100.

//Operators and there precedence in lowest to highest are
// ||, &&, + -, * /, ^, ! - ( )

//Built in functions
//   abs( <expression> ) returns the absolute value of the evaluated expression
//   clamp( valueToClamp, minValue, maxValue ) returns valueToClamp clamp to in between minValue and maxValue
//   min( <expression>, <expression> ) returns the lowest value between the two parameters
//   max( <expression>, <expression> ) returns the highest value between the two parameters
//   isnil( <identifier> ) returns 1.0f if the identifier holds the value nil

//Variables
//   To allocate variables, use the double statement followed by an identifier and optionally an '=' 
//   followed by an expression. Variables can only be used after they've been defined.
//   variable definitions can be chained and used like below
//     double myVar=10, myOtherVar=1; //creates two variables and sets there values
//     double notDone; //set to nil since not explicitly set

//Accessing previous ChartObject values. You can only refer to ChartObjects earlier in the
//   chartArrayObjects array that you pass in when the calc() is called, this prevents uncalculated
//   values being allowed to be referenced.
//   To access any chart simply access it like you would a variable
//     double chartMinus10 = aLinearChartObjectName;

//Running a chart with custom values is possible using @<chart name>(x, y, z)
	//e.g. double serviceCeiling = @ServiceCeilChart( 60, 38000);
	//TrendChart parameters are @<ident>(xOrYVal, entryPoint, exitPoint)
	//LinearChart parameters are @<ident>(xOrYVal, zValue)
	//ClampChart parameters are @<ident>(xOrYVal, valueToClamp)
	//PolyChart parameters are @<ident>(x, y)


//While loop
//  The while loop will continue looping until its expression evaulates to false.
//  You can use the break statment to exit the loop
//  while ( <expression> ) {
//      if isnil(myVariable) {
//			break;
//      }
//  }

//If statement
//  The if statement will run code in the first curly block if the expression evaulates true
//  You can also chain else ifs elses, e.g.
//  if <expression> {
//	   [your code here]
//	} else if <expression> {
//     [your code here]
//  } else {
//	   [your code here]
//  }

//Msgbox statement
//  The msgbox statement is meant to be used in ChartInput scripts to alert the user of
//  any illegal values they entered and that the value will be defaulted to something else
//  After the msgbox keyword you provide a string in quotation marks (").
//  example: msgbox "Your message here";