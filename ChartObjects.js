const Interpreter = require('./Interpreter.js');

///helper functions

//returns true if any of the inputs are null or undefined
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



///classess
class Point {
    constructor(x,y){
        if (x instanceof Point){//act as a copy constructor
            this.x = x.x;
            this.y = x.y;
        }else{
            this.x = isAnyNil(x) ? 0 : x;
            this.y = isAnyNil(y) ? 0 : y;
        }
    }

    flip(){
        let tempX=this.x;
        this.x=this.y;
        this.y=tempX;
    }

    distance(otherPoint){
        let xDiff = Math.abs(otherPoint.x - this.x);
        let yDiff = Math.abs(otherPoint.y - this.y);
        return Math.sqrt(xDiff*xDiff + yDiff*yDiff);
    }
}

class Line {
    constructor(pointsArray, value=null){
        if (pointsArray instanceof Line){
            this.points=pointsArray.points.map( point => {return new Point(point);} )
            this.value=pointsArray.value;
        }else{
            this.points=pointsArray.map( point => {return new Point(point);} );
            this.value=value;
        }
    }

    flipPoints(){
        for (let point of this.points){
            point.flip();
        }
    }

    isLinear(yIsInputAxis){
        if (this.points.length < 2) {
            return false;//line doesnt have enough points to even have one segment
        }
    
        if (isAboutEquals((yIsInputAxis ? this.points[1].y : this.points[1].x), (yIsInputAxis ? this.points[0].y : this.points[0].x))) {
            return false;//first and second point are on the same x/y location, wouldnt be able to determine direction
        }
    
        let lastX = (yIsInputAxis ? this.points[0].y : this.points[0].x);
        let goingUp = (yIsInputAxis ? this.points[1].y : this.points[1].x) > lastX;
    
        for (let i = 1; i < this.points.length; i++) {
            if (goingUp) {
                if ((yIsInputAxis ? this.points[i].y : this.points[i].x) <= lastX){
                    return false;//line x was ascending, but now its going down
                }
            } else {
                if ((yIsInputAxis ? this.points[i].y : this.points[i].x) >= lastX) {
                    return false;//line x was descending, but now its going up
                }
            }
            lastX = (yIsInputAxis ? this.points[i].y : this.points[i].x);
        }
        return true;
    }

    //Only finds segments in the x axis (flip the points if you want to find it in the y axis)
    findSegment(x) {
        if (this.points.length < 2 || this.isLinear(false)===false) {
            return null;//not enough points for even one segment
        }
    
        let leftX = this.points[0].x;
        let rightX = this.points[this.points.length-1].x;
    
        //not going to be able to find a segment within the line, so we have to extrapolate
        if ((leftX<rightX && x<leftX) || (rightX<leftX && x>leftX)) {
            return new Segment(this.points[0], this.points[1]);
        } else if ((leftX<rightX && x>rightX) || (rightX<leftX && x<rightX))  {
            return new Segment(this.points[this.points.length - 2],this.points[this.points.length - 1]);
        }
    
        for (let i = 0; i < this.points.length-1; i++) {
            if ((x >= this.points[i].x  &&  x <= this.points[i + 1].x) || (x <= this.points[i].x  &&  x >= this.points[i + 1].x)) {
                return new Segment(this.points[i], this.points[i + 1]);
            }
        }
    
        return null;//should be impossible to get here unless the line is a mess
    }

}

class Rect {
    constructor(pointA, pointB){
        if (pointA instanceof Rect){
            this.pointA=new Point(pointA.pointA);
            this.pointB=new Point(pointA.pointB);
        }else{
            this.pointA=new Point(pointA);
            this.pointB=new Point(pointB);
        }
    }

    isPointInside({x:px, y: py}, padding=undefined){
        if (padding===undefined){
            return ((px >= this.pointA.x && px <= this.pointB.x) || (px >= this.pointB.x && px <= this.pointA.x)) &&
                   ((py >= this.pointA.y && py <= this.pointB.y) || (py >= this.pointB.y && py <= this.pointA.y));
        }else{
            let a=new Point(this.pointA);
            let b=new Point(this.pointB);

            if (a.x<b.x){
                a.x-=padding; b.x+=padding;
            }else{
                a.x+=padding; b.x-=padding;
            }
            if (a.y<b.y){
                a.y-=padding; b.y+=padding;
            }else{
                a.y+=padding; b.y-=padding;
            }

            let paddedRect=new Rect(a, b);
            return paddedRect.isPointInside(new Point(px,py));
        }
    }

}

class Segment {
    constructor(pointA, pointB){
        if (pointA instanceof Segment){
            this.pointA=new Point(pointA.pointA);
            this.pointB=new Point(pointA.pointB);
        }else{
            this.pointA=new Point(pointA);
            this.pointB=new Point(pointB);
        }
    }

    setPointA(toPoint){
        this.pointA = new Point(toPoint);
    }
    setPointB(toPoint){
        this.pointB = new Point(toPoint);
    }

    //Returns null if unable to get an intersection, will return a Point if able.
    //This should be a static class method, but whatevs.
    static getSegmentIntersectionWith(seg1, seg2, needsToBeTouching){
        let xy=new Point(0,0);
        let t = (seg2.pointB.y - seg2.pointA.y)*(seg1.pointB.x - seg1.pointA.x) - (seg2.pointB.x - seg2.pointA.x)*(seg1.pointB.y - seg1.pointA.y);
        if (Math.abs(t)>=0.00001) {//make sure lines arent parallel
            let ua = ((seg2.pointB.x - seg2.pointA.x)*(seg1.pointA.y - seg2.pointA.y) - (seg2.pointB.y - seg2.pointA.y)*(seg1.pointA.x - seg2.pointA.x)) / t;
            xy.x = seg1.pointA.x + ua * (seg1.pointB.x - seg1.pointA.x);
            xy.y = seg1.pointA.y + ua * (seg1.pointB.y - seg1.pointA.y);
            
            if (needsToBeTouching) {
                let rect1 = new Rect(seg1.pointA, seg1.pointB);
                let rect2 = new Rect(seg2.pointA, seg2.pointB);
                if (!(rect1.isPointInside(xy) && rect2.isPointInside(xy))) {
                    return null;
                }
            }
            return xy;
        }
        return null;
    }
    
    //Returns null if unable to get an intersection, will return a Point if able.
    getSegmentIntersection(otherSeg, needsToBeTouching){
        return Segment.getSegmentIntersectionWith(this, otherSeg, needsToBeTouching);
    }

    //Returns null if unable to get an intersection, will return the y value of the intersion if able.
    static figureYCrossingWith(seg1, xAxis){
        let seg2 = new Segment(new Point(xAxis, -100), new Point(xAxis, 100));
        let intersection = Segment.getSegmentIntersectionWith(seg1, seg2, false);
        if (intersection != null) {
            return intersection.y;
        }
        return null;
    }

    //Returns null if unable to get an intersection, will return the y value of the intersion if able.
    figureYCrossing(xAxis){
        return Segment.figureYCrossingWith(this, xAxis);
    }
}


class ChartObject {
    constructor(name="", type="chartobject", initialValue=null){
        this.name=name;
        this.type=type;
        this.value=initialValue;
    }

    calc(chartObjectArray){//Meant to be overridden at child class
    }
}

class LinearChart extends ChartObject {
    constructor(name="", yIsInputAxis=false, xOrYRefObj=null, zRefObj=null, lines=null){
        super(name, "linear", null);

        this.yIsInputAxis=yIsInputAxis;

        this.xOrYRefObj=xOrYRefObj;
        this.zRefObj=zRefObj;

        if (Array.isArray(lines)){
            this.lines=lines.map( line => {return new Line(line);} );
            if (yIsInputAxis){
                this.lines.forEach( line => {line.flipPoints();} )
            }
        }else{
            this.lines=[];
        }
    }

    calc(chartObjectArray){
        if (isAnyNil(this.xOrYRefObj, this.zRefObj)){
            this.value=null;
        }else{
            this.value = this.figureChart(this.xOrYRefObj.value, this.zRefObj.value);
        }
    }

    figureChart(xOrYIn, zIn){
        if (isAnyNil(xOrYIn,zIn)) return null;
        let belowLine=null;
        let aboveLine=null;
        let linesAreSame=false;

        for (let currentLine of this.lines){
            if (isAboutEquals(currentLine.value, zIn)){
                belowLine=currentLine;
                aboveLine=currentLine;
                linesAreSame=true;
                break;
            }
            if (currentLine.value < zIn){
                if (belowLine){
                    if (belowLine.value < currentLine.value) belowLine=currentLine;
                }else{
                    belowLine=currentLine;
                }
            }
            if (currentLine.value > zIn){
                if (aboveLine){
                    if (aboveLine.value > aboveLine.value) aboveLine=currentLine;
                }else{
                    aboveLine=currentLine;
                }
            }
        }
        if (isAnyNil(aboveLine, belowLine)) return null;

        let aboveCrossing=aboveLine.findSegment(xOrYIn)?.figureYCrossing(xOrYIn);
        if (linesAreSame) return aboveCrossing;

        let belowCrossing=belowLine.findSegment(xOrYIn)?.figureYCrossing(xOrYIn);

        if (isAnyNil(aboveCrossing, belowCrossing)) return null;

        return ((zIn - belowLine.value) / (aboveLine.value - belowLine.value))*(aboveCrossing - belowCrossing) + belowCrossing;
    }
}

class ClampChart extends ChartObject {

    constructor(name="", yIsInputAxis=false, xOrYRefObj=null, valueToClampRefObj=null, minLine=null, maxLine=null){
        super(name, "clamp", null);

        this.yIsInputAxis=yIsInputAxis;

        this.xOrYRefObj=xOrYRefObj;
        this.valueToClampRefObj=valueToClampRefObj;

        this.minLine=isAnyNil(minLine) ? null : new Line(minLine);
        this.maxLine=isAnyNil(maxLine) ? null : new Line(maxLine);
        if (yIsInputAxis){
            this.minLine.flipPoints();
            this.maxLine.flipPoints();    
        }
    }

    calc(chartObjectArray){
        if (isAnyNil(this.xOrYRefObj, this.valueToClampRefObj)){
            this.value=null;
        }else{
            this.value=this.figureClamp(this.xOrYRefObj.value, this.valueToClampRefObj.value);
        }
    }

    figureClamp(xOrYIn, valueToClamp){
        if (isAnyNil(xOrYIn, valueToClamp)) return null;
    
        if (this.minLine?.points.length>0) {
            let minValue=this.minLine.findSegment(xOrYIn)?.figureYCrossing(xOrYIn);
            if (!minValue) return null;
 
            if (valueToClamp < minValue) valueToClamp = minValue;
        }

        if (this.maxLine?.points.length>0) {
            let maxValue=this.maxLine.findSegment(xOrYIn)?.figureYCrossing(xOrYIn);
            if (!maxValue) return null;
 
            if (valueToClamp > maxValue) valueToClamp = maxValue;
        }

        return valueToClamp;
    }
}

class TrendChart extends ChartObject{
    constructor(name="", yIsInputAxis=false, xOrYRefObj=null, entryPointRefObj=null, exitPointRefObj=null, lines=null){
        super(name, "trend", null);

        this.yIsInputAxis=yIsInputAxis;

        this.xOrYRefObj=xOrYRefObj;
        this.entryPointRefObj=entryPointRefObj;
        this.exitPointRefObj=exitPointRefObj;

        if (Array.isArray(lines)){
            this.lines=lines.map( line => {return new Line(line);} );
            if (!yIsInputAxis){
                this.lines.forEach( line => {line.flipPoints();} )//we flip the points when yIsInputAxis==false for trendcharts
            }
        }else{
            this.lines=[];
        }
    }

    calc(chartObjectArray){
        if (isAnyNil(this.xOrYRefObj, this.entryPointRefObj, this.exitPointRefObj)){
            this.value=null;
        }else{
            this.value=this.figureTrend(this.xOrYRefObj, this.entryPointRefObj, this.exitPointRefObj);
        }
    }

    figureTrend(xOrYIn, entryPoint, exitPoint){
        if (isAnyNil(xOrYIn, entryPoint, exitPoint)) return null;

        let leftLineFind=null;
        let rightLineFind=null;
        let leftEntryCross=0;
        let rightEntryCross=0;
        
        for (let currentLine of this.lines){
            let yCrossing = currentLine.findSegment(entryPoint)?.figureYCrossing(entryPoint);
            if (yCrossing){//should we hard fail here? It would highlight bad data. Maybe it should.
                if (yCrossing>=xOrYIn){
                    if (rightLineFind){
                        if (yCrossing<rightEntryCross){
                            rightLineFind=currentLine;
                            rightEntryCross=yCrossing
                        }
                    }else{
                        rightLineFind=currentLine;
                        rightEntryCross=yCrossing;
                    }
                }
                if (yCrossing<=xOrYIn){
                    if (leftLineFind){
                        if (yCrossing>leftEntryCross){
                            leftLineFind=currentLine;
                            leftEntryCross=yCrossing
                        }
                    }else{
                        leftLineFind=currentLine;
                        leftEntryCross=yCrossing;
                    }
                }
            }
        }

        if (isAnyNil(leftLineFind, rightLineFind)) return null;
 
        let leftEndCross = leftLineFind.findSegment(exitPoint)?.figureYCrossing(exitPoint);
        if (leftLineFind===rightLineFind || isAboutEquals(rightEntryCross, leftEntryCross)){
            return leftEndCross;
        }
        let rightEndCross = rightLineFind.findSegment(exitPoint)?.figureYCrossing(exitPoint);

        if (isAnyNil(leftEndCross, rightEndCross)) return null;
        
        let entryRatio=(xOrYIn - leftEntryCross) / (rightEntryCross - leftEntryCross);
        return (rightEndCross - leftEndCross) * entryRatio + leftEndCross;
    }
}

class PolyChart extends ChartObject{
    constructor(name="", xInRefObj=null, yInRefObj=null, lines=null){
        super(name, "poly", null);

        this.xInRefObj=xInRefObj;
        this.yInRefObj=yInRefObj;

        if (Array.isArray(lines)){
            this.lines=lines.map( line => {return new Line(line);} );
            if (!yIsInputAxis){
                this.lines.forEach( line => {line.flipPoints();} )//we flip the points when yIsInputAxis==false for trendcharts
            }
        }else{
            this.lines=[];
        }
    }

    calc(chartObjectArray){
        if (isAnyNil(this.xInRefObj, this.yInRefObj)){
            this.value=null;
        }else{
            this.value=this.figurePoly(this.xInRefObj.value, this.yInRefObj.value);
        }
    }

    figurePoly(xIn, yIn){
        if (isAnyNil(xIn, yIn)) return null;

        let minX=0;
        let maxX=0;
        for (let currentLine of this.lines){
            for (let currentPoint of currentLine.points){
                if (currentPoint.x>maxX) maxX=currentPoint.x;
                if (currentPoint.x<minX) minX=currentPoint.x;
            }
        }

        let horizSeg = new Segment(new Point(minX-1, yIn), new Point(maxX+1,yIn));
        let curSeg = new Segment();

        for (let currentLine of this.lines) {
            let intersectsLeftOfX = 0;

            if (currentLine.points.length > 2) {
                for (let i = 0; i < currentLine.points.length; i++) {
                    curSeg.setPointA(currentLine.points[i])
                    if (i == currentLine.points.length - 1) {
                        curSeg.setPointB(currentLine.points[0]);
                    } else {
                        curSeg.setPointB(currentLine.points[i+1]);
                    }

                    if (curSeg.getSegmentIntersection(horizSeg, true)?.x <= xIn){
                        intersectsLeftOfX++;
                    }
                }

                if (intersectsLeftOfX > 0 && intersectsLeftOfX%2 > 0) {
                    return currentLine.value;
                }
            }
        }
        return null;
    }
}

class ChartTableEntry {
    constructor(refObj, value){
        if (refObj instanceof ChartTableEntry){
            this.refObj=refObj.refObj;
            this.value=refObj.value;
        }else{
            this.refObj=refObj;
            this.value=value;
        }
    }
}

class ChartTable extends ChartObject {
    constructor(name="", inputRefObj=null, table=null){
        super(name, "table", null);

        this.inputRefObj=inputRefObj;

        if (Array.isArray(table)){
            this.table=table.map( entry => {return new ChartTableEntry(entry);} );
        }else{
            this.table=[];
        }
    }

    figureTable(inValue){
        if (isAnyNil(inValue)) return null;
        let below=null;
        let above=null;

        for (let item of this.table) {
            if (isAboutEquals(item.value, inValue)) {
                below = item;
                above = item;
                break;
            }
            if (item.value <= inValue) {
                if (below){
                    if (item.value>below.value) below=item;
                }else{
                    below=item;
                }
            }
            if (item.value >= inValue) {
                if (above){
                    if (item.value<above.value) above=item;
                }else{
                    above=item;
                }
            }
        }
        if (isAnyNil(above?.refObj?.value, below?.refObj?.value)) return null;

        if (below===above || isAboutEquals(below.refObj.value, above.refObj.value)){
            return above.refObj.value;
        }

        let resultDiff = above.refObj.value - below.refObj.value;
        let valDiff = above.value - below.value;
        return ((inValue - below.value) / valDiff) * resultDiff + below.refObj.value;
    }

    calc(chartObjectArray){
        if (isAnyNil(this.inputRefObj)){ 
            this.value=null;
        }else{
            this.value=this.figureTable(this.inputRefObj.value)
        }
    }
}

class ChartInput extends ChartObject {
    constructor(name="", script="", initialValue=null){
        super(name, "input", initialValue);
        this.interpreter = new Interpreter(this, script);
    }

    calc(chartObjectArray){
        this.value = this.interpreter.run(chartObjectArray, this.value);
    }
}

class ChartScript extends ChartObject {
    constructor(name="", script=""){
        super(name, "script", null);
        this.interpreter = new Interpreter(this, script);
    }

    calc(chartObjectArray){
        this.value = this.interpreter.run(chartObjectArray, null);
    }
}

class ChartConstant extends ChartObject {
    constructor(name="", value=0){
        super(name, "constant", value);
    }
}

module.exports={Point: Point, 
                Line: Line,
                ChartObject: ChartObject,
                LinearChart: LinearChart,
                ClampChart: ClampChart,
                TrendChart: TrendChart,
                PolyChart: PolyChart,
                ChartTableEntry: ChartTableEntry,
                ChartTable: ChartTable,
                ChartInput: ChartInput,
                ChartScript: ChartScript,
                ChartConstant: ChartConstant
               };