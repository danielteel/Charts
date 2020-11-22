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


let newScript = new ChartInput("test", "return (5+10)/2+5*6+2^2;");
newScript.calc();
console.log(newScript.interpreter.getErrorMessage());
console.log(newScript.value);