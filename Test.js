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


 let newScript = new ChartInput("test", "double a,b=1,c; if isnil(a){msgbox\"a is nil\";} if isnil(b){msgbox\"b is nil\";} if isnil(c){msgbox\"c is nil\";}");
newScript.value=Math.random()*100;
newScript.calc();

console.log(newScript.interpreter.getErrorMessage());
 console.log(newScript.value);