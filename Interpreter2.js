const OpObjType={
    bool: Symbol("bool"),
    num: Symbol("number"),
    string: Symbol("string"),
    register: Symbol("register")
};


class OpObj {
    constructor(name="", objType=null, value=null, isConstant=false){
        this._name=name;
        this._objType=objType;
        this._value=value;
        this._isConstant=isConstant;
    }

    get name(){
        return this._name;
    }

    get objType(){
        return this._objType;
    }
}

class RegisterObj extends OpObj {
    constructor(name){
        super(name, OpObjType.register, null, false);
        this._curValType=OpObjType.num;
    }

    mov(obj){
        if (obj instanceof OpObj === false) throw new Error("Tried to set register OpObj to type other than OpObj");

        if (obj.objType===OpObjType.register){
            this._curValType=obj._curValType;
        }else{
            this._curValType=obj.objType;
        }
        this._value=obj._value;
    }
}

class BoolObj extends OpObj {
    constructor(name, initialVal=false, isConstant=false){
        super(name, OpObjType.bool, initialVal, isConstant);
    }

    mov(obj){
        if (this._isConstant)  throw new Error("Tried to write to constant bool OpObj");
        if (obj instanceof OpObj === false) throw new Error("Tried to set bool OpObj to type other than OpObj");
        
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.bool:
            this._value=obj._value;
            break;
        case OpObjType.string:
        case OpObjType.num:
            this._value=!!obj._value;
            break;
        case OpObjType.register:
            //fallthrough so we throw error
        default:
            throw new Error("Tried to set bool OpObj to unknown OpObj type");
        }
    }
}

class NumberObj extends OpObj {
    constructor(name, initialVal=null, isConstant=false){
        super(name, OpObjType.num, initialVal, isConstant);
    }

    mov(obj){
        if (this._isConstant)  throw new Error("Tried to write to constant number OpObj");
        if (obj instanceof OpObj === false) throw new Error("Tried to set number OpObj to type other than OpObj");
        
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.bool:
            this._value=Number(obj._value);
            break;
        case OpObjType.string:
            this._value=Number(obj._value);
            if (!Number.isFinite(this._value)) this._value=0;
            break;
        case OpObjType.num:
            this._value=obj._value;
            break;
        case OpObjType.register:
            //fallthrough so we throw error
        default:
            throw new Error("Tried to set number OpObj to unknown OpObj type");
        }
    }
}

class StringObj extends OpObj {
    constructor(name, initialVal="", isConstant=false){
        super(name, OpObjType.string, initialVal, isConstant);
    }

    mov(obj){
        if (this._isConstant)  throw new Error("Tried to write to constant string OpObj");
        if (obj instanceof OpObj === false) throw new Error("Tried to set string OpObj to type other than OpObj");
        
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.bool:
        case OpObjType.string:
            this._value=Number(obj._value);
            break;
        case OpObjType.num:
            this._value=obj._value;
            break;
        case OpObjType.register:
            //fallthrough so we throw error
        default:
            throw new Error("Tried to set string OpObj to unknown OpObj type");
        }
    }
}