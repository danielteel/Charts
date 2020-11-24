let {
  Point: Point, 
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
 } = require(('./ChartObjects.js'));


let newScript = new ChartInput("test", "let a=10;let b=7; while (b<100000){ a=a%b+8/2; b=b+1;}return b;");
let startTime=new Date().getTime();
newScript.calc();
console.log(new Date().getTime()-startTime);
console.log("len: "+newScript.interpreter.program._opCodes.length);
console.log(newScript.value);
console.log(newScript.interpreter.getErrorMessage());
 


