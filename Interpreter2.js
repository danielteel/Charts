const OpObjType={
    bool: Symbol("bool"),
    num: Symbol("number"),
    string: Symbol("string"),
    register: Symbol("register")
};

class Helpers{
    static isAboutEquals(a,b){
        if (Math.abs(a-b)<0.000001){
            return true;
        }
        return false;
    }
}

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

    setTo(obj){
        if (obj instanceof OpObj === false) throw new Error("Tried to set register to invalid type");

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
        super(name, OpObjType.bool, Boolean(initialVal), isConstant);
    }

    setTo(obj){
        if (this._isConstant)  throw new Error("Tried to write to constant bool");
        if (obj instanceof OpObj === false) throw new Error("Tried to set bool to invalid type");
        
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.bool:
            this._value=obj._value;
            break;
        case OpObjType.num:
            this._value=!!obj._value;
            break;
        default:
            throw new Error("Tried to set bool to unknown type");
        }
    }
    eqaulTo(obj){
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.bool:
            return this._value===obj._value;
        case OpObjType.num:
            return Helpers.isAboutEquals(Number(this._value), obj._value);
        default:
            throw new Error("Tried to do comparison to invalid type");
        }
    }    
    notEqualTo(obj){
        return !this.eqaulTo(obj);
    }
    smallerThan(obj){
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;
        switch (type){
        case OpObjType.bool:
            return this._value<obj._value;
        case OpObjType.num:
            return Number(this._value)<obj._value;
        default:
            throw new Error("Tried to do comparison to invalid type");
        }
    }
    greaterThan(obj){
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;
        switch (type){
        case OpObjType.bool:
            return this._value>obj._value;
        case OpObjType.num:
            return Number(this._value)>obj._value;
        default:
            throw new Error("Tried to do comparison to invalid type");
        }
    }
    smallerOrEqualThan(obj){
        return this.smallerThan(obj)||this.eqaulTo(obj);
    }
    greaterOrEqualThan(obj){
        return this.greaterThan(obj)||this.eqaulTo(obj);
    }
}

class NumberObj extends OpObj {
    constructor(name, initialVal=null, isConstant=false){
        super(name, OpObjType.num, Number(initialVal), isConstant);
    }

    setTo(obj){
        if (this._isConstant)  throw new Error("Tried to write to constant number");
        if (obj instanceof OpObj === false) throw new Error("Tried to set number to invalid type");
        
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.bool:
            this._value=Number(obj._value);
            break;
        case OpObjType.num:
            this._value=obj._value;
            break;
        default:
            throw new Error("Tried to set number to invalid type");
        }
    }
    eqaulTo(obj){
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.bool:
            return this._value===Number(obj._value);
        case OpObjType.num:
            return Helpers.isAboutEquals(this._value, obj._value);
        default:
            throw new Error("Tried to do comparison to invalid type");
        }
    }    
    notEqualTo(obj){
        return !this.eqaulTo(obj);
    }
    smallerThan(obj){
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;
        switch (type){
        case OpObjType.bool:
            return this._value<Number(obj._value);
        case OpObjType.num:
            return this._value<obj._value;
        default:
            throw new Error("Tried to do comparison to invalid type");
        }
    }
    greaterThan(obj){
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;
        switch (type){
        case OpObjType.bool:
            return this._value>Number(obj._value);
        case OpObjType.num:
            return this._value>obj._value;
        default:
            throw new Error("Tried to do comparison to invalid type");
        }
    }
    smallerOrEqualThan(obj){
        return this.smallerThan(obj)||this.eqaulTo(obj);
    }
    greaterOrEqualThan(obj){
        return this.greaterThan(obj)||this.eqaulTo(obj);
    }
}

class StringObj extends OpObj {
    constructor(name, initialVal="", isConstant=false){
        super(name, OpObjType.string, String(initialVal), isConstant);
    }

    setTo(obj){
        if (this._isConstant)  throw new Error("Tried to write to constant string");
        if (obj instanceof OpObj === false) throw new Error("Tried to set string to invalid type");
        
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.string:
            this._value=obj._value;
            break;
        default:
            throw new Error("Tried to set string to invalid type");
        }
    }

    eqaulTo(obj){
        let type=obj.objType;
        if (type===OpObjType.register) type=obj._curValType;

        switch (type){
        case OpObjType.string:
            return this._value===obj._value;
        default:
            throw new Error("Tried to do comparison to invalid type");
        }
    }    
    notEqualTo(obj){
        return !this.eqaulTo(obj);
    }
    smallerThan(obj){
        throw new Error("Tried to do invalid comparison");
    }
    greaterThan(obj){
        throw new Error("Tried to do invalid comparison");
    }
    smallerOrEqualThan(obj){
        throw new Error("Tried to do invalid comparison");
    }
    greaterOrEqualThan(obj){
        throw new Error("Tried to do invalid comparison");
    }
}

let a=new NumberObj("a", .5);
let b=new BoolObj("b", true);

console.log(a.eqaulTo(b));