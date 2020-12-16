const Utils = require("./Utils");
const {OpObjType, OpObj, RegisterObj, StringObj, NumberObj, BoolObj} = require('./OpObjs');

const OpCode = {
	label:      1,
	jmp:        2,
	je:         3,
	jne:        4,
	test:       5,
	cmp:        6,
	se:         7,
	sne:        8,
	sa:         9,
	sae:        10,
	sb:         11,
	sbe:        12,
	exit:       13,
	ceil:       14,
	floor:      15,
	abs:        16,
	min:        17,
	max:        18,
	clamp:      19,
	excall:     20,
	call:       21,
	ret:        22,
	todouble:   23,
	len:        24,
	strcmp:     25,
	stricmp:    26,
	lcase:      27,
	ucase:      28,
	trim:       29,
	substr:     30,
	tostring:   31,
	concat:     32,
	double:     33,
	bool:       34,
	string:     35,
	pushscope:  36,
	popscope:   37,
	push:       38,
	pop:        39,
	load:       40,
	mov:        41,
	and:        42,
	or:         43,
	add:        44,
	sub:        45,
	mul:        46,
	div:        47,
	mod:        48,
	exponent:   49,
	not:        50,
	neg:        51
}

const UnlinkedType={
	register:		1,
	double:			2,
	bool:			3,
	string:			4,
	doubleLiteral: 	5,
	boolLiteral: 	6,
	stringLiteral: 	7,
	nilLiteral:		8
}



class Program {
	static unlinkedReg(registerName){
		switch (registerName.trim().toLowerCase()){
			 case "eax":	return {type: UnlinkedType.register, register: Symbol("eax")}
			 case "ebx":	return {type: UnlinkedType.register, register: Symbol("ebx")}
			 case "ecx":	return {type: UnlinkedType.register, register: Symbol("ecx")}
		}
		return null;
	}
	static unlinkedDouble(scope, index){ 	return {type: UnlinkedType.double,	scope: Number(scope), index: Number(index)}; }
	static unlinkedBool(scope, index){ 		return {type: UnlinkedType.bool,	scope: Number(scope), index: Number(index)}; }
	static unlinkedString(scope, index){ 	return {type: UnlinkedType.string,	scope: Number(scope), index: Number(index)}; }
	static unlinkedDoubleLiteral(value){ 	return {type: UnlinkedType.doubleLiteral,	value: Number(value)}; }
	static unlinkedBoolLiteral(value){ 		return {type: UnlinkedType.boolLiteral,		value: Boolean(value)}; }
	static unlinkedStringLiteral(value){ 	return {type: UnlinkedType.stringLiteral,	value: String(value)};}
	static unlinkedNilLiteral(){			return {type: UnlinkedType.nilLiteral}; }

	constructor(){
		this.clear();
	}

	clear(){
		this.errorObj=null;
		this.code=[];

		this.scopes=[];

		this.eax=new RegisterObj("eax");
		this.ebx=new RegisterObj("ebx");
		this.ecx=new RegisterObj("ecx");
		this.true=new BoolObj("true", true, true);
		this.false=new BoolObj("false", false, true);

		this.eip=0;
	}

	setScopeLength(length){
		this.scopes=Array(length);
	}

	addRet          ()					{ this.code.push( {type: OpCode.ret} ); }
	addLabel		(id)				{ this.code.push( {type: OpCode.label,		id: id} ); }
	addJmp			(id)				{ this.code.push( {type: OpCode.jmp,		id: id} ); }
	addJE           (id)				{ this.code.push( {type: OpCode.je,			id: id} ); }
	addJNE          (id)				{ this.code.push( {type: OpCode.jne,		id: id} ); }
	addExCall       (id)				{ this.code.push( {type: OpCode.excall,		id: id} ); }
	addCall         (id)				{ this.code.push( {type: OpCode.call,		id: id} ); }
	addTest         (obj0)				{ this.code.push( {type: OpCode.test,		obj0: obj0} ); }
	addSE           (obj0)				{ this.code.push( {type: OpCode.se,			obj0: obj0} ); }
	addSNE          (obj0)				{ this.code.push( {type: OpCode.sne,		obj0: obj0} ); }
	addSA           (obj0)				{ this.code.push( {type: OpCode.sa,			obj0: obj0} ); }
	addSAE          (obj0)				{ this.code.push( {type: OpCode.sae,		obj0: obj0} ); }
	addSB           (obj0)				{ this.code.push( {type: OpCode.sb,			obj0: obj0} ); }
	addSBE          (obj0)				{ this.code.push( {type: OpCode.sbe,		obj0: obj0} ); }
	addExit         (obj0)				{ this.code.push( {type: OpCode.exit,		obj0: obj0} ); }
	addCeil         (obj0)				{ this.code.push( {type: OpCode.ceil,		obj0: obj0} ); }
	addFloor        (obj0)				{ this.code.push( {type: OpCode.floor,		obj0: obj0} ); }
	addAbs          (obj0)				{ this.code.push( {type: OpCode.abs,		obj0: obj0} ); }
	addToDouble     (obj0)				{ this.code.push( {type: OpCode.todouble,	obj0: obj0} ); }
	addLen          (obj0)				{ this.code.push( {type: OpCode.len,		obj0: obj0} ); }
	addLCase        (obj0)				{ this.code.push( {type: OpCode.lcase,		obj0: obj0} ); }
	addUCase        (obj0)				{ this.code.push( {type: OpCode.ucase,		obj0: obj0} ); }
	addTrim         (obj0)				{ this.code.push( {type: OpCode.trim,		obj0: obj0} ); }
	addToString     (obj0)				{ this.code.push( {type: OpCode.tostring,	obj0: obj0} ); }
	addDouble       (obj0)				{ this.code.push( {type: OpCode.double,		obj0: obj0} ); }
	addBool         (obj0)				{ this.code.push( {type: OpCode.bool,		obj0: obj0} ); }
	addString       (obj0)				{ this.code.push( {type: OpCode.string,		obj0: obj0} ); }
	addPush         (obj0)				{ this.code.push( {type: OpCode.push,		obj0: obj0} ); }
	addPop          (obj0)				{ this.code.push( {type: OpCode.pop,		obj0: obj0} ); }
	addNot          (obj0)				{ this.code.push( {type: OpCode.not,		obj0: obj0} ); }
	addNeg          (obj0)				{ this.code.push( {type: OpCode.neg,		obj0: obj0} ); }
	addPopScope     (scope)				{ this.code.push( {type: OpCode.popscope,	scope: scope} ); }
	addCmp          (obj0, obj1)		{ this.code.push( {type: OpCode.test,		obj0: obj0, obj1: obj1} ); }
	addConcat       (obj0, obj1)		{ this.code.push( {type: OpCode.concat,		obj0: obj0, obj1: obj1} ); }
	addStrCmp       (obj0, obj1)		{ this.code.push( {type: OpCode.strcmp,		obj0: obj0, obj1: obj1} ); }
	addStrICmp      (obj0, obj1)		{ this.code.push( {type: OpCode.stricmp,	obj0: obj0, obj1: obj1} ); }
	addMin          (obj0, obj1)		{ this.code.push( {type: OpCode.min,		obj0: obj0, obj1: obj1} ); }
	addMax          (obj0, obj1)		{ this.code.push( {type: OpCode.max,		obj0: obj0, obj1: obj1} ); }
	addMov          (obj0, obj1)		{ this.code.push( {type: OpCode.mov,		obj0: obj0, obj1: obj1} ); }
	addAnd          (obj0, obj1)		{ this.code.push( {type: OpCode.and,		obj0: obj0, obj1: obj1} ); }
	addOr           (obj0, obj1)		{ this.code.push( {type: OpCode.or,			obj0: obj0, obj1: obj1} ); }
	addAdd          (obj0, obj1)		{ this.code.push( {type: OpCode.add,		obj0: obj0, obj1: obj1} ); }
	addSub          (obj0, obj1)		{ this.code.push( {type: OpCode.sub,		obj0: obj0, obj1: obj1} ); }
	addMul          (obj0, obj1)		{ this.code.push( {type: OpCode.mul,		obj0: obj0, obj1: obj1} ); }
	addDiv          (obj0, obj1)		{ this.code.push( {type: OpCode.div,		obj0: obj0, obj1: obj1} ); }
	addMod          (obj0, obj1)		{ this.code.push( {type: OpCode.mod,		obj0: obj0, obj1: obj1} ); }
	addExponent     (obj0, obj1)		{ this.code.push( {type: OpCode.exponent,	obj0: obj0, obj1: obj1} ); }
	addPushScope    (scope, size)		{ this.code.push( {type: OpCode.pushscope,	scope: scope, size: size} ); }
	addSubStr       (obj0, obj1, obj2)	{ this.code.push( {type: OpCode.substr,		obj0: obj0, obj1: obj1, obj2: obj2} ); }
	addClamp        (obj0, obj1, obj2)	{ this.code.push( {type: OpCode.clamp,		obj0: obj0, obj1: obj1, obj2: obj2} ); }
}


module.exports={Program};