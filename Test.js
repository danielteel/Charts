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


 let newScript = new ChartScript("test","return 5+2;");
newScript.calc();
 console.log(newScript.value);