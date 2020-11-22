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


 let newScript = new ChartInput("test", "if isnil(this){this=0;} this=clamp(this,25,75);");
newScript.value=Math.random()*100;
newScript.calc();

console.log(newScript.interpreter.getErrorMessage());
 console.log(newScript.value);