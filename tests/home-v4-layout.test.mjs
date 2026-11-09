import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const directory = new URL("../components/home-v4/", import.meta.url);
const compile = source => ts.transpileModule(source, { compilerOptions: { module:ts.ModuleKind.ES2022, target:ts.ScriptTarget.ES2022 } }).outputText;
const asUrl = source => "data:text/javascript;base64," + Buffer.from(source).toString("base64");
const editorialUrl = asUrl(compile(await readFile(new URL("editorial-plan.ts", directory), "utf8")));
const source = compile(await readFile(new URL("composition.ts", directory), "utf8")).replace('"./editorial-plan"', JSON.stringify(editorialUrl));
const { planPanel, overlaps } = await import(asUrl(source));
const works = Array.from({length:8}, (_, i) => ({_id:String(i), image:"image.png", internalName:i === 3 ? "A long published artwork title that must wrap without colliding with adjacent elements" : "Artwork " + i, year:2026, imageAspectRatio:[.32,.67,.8,1,1.4,1.9,3.6,.9][i]}));
const screens = [[1920,1080],[1440,900],[1280,800],[1024,768],[768,1024],[430,932],[390,844],[375,812],[320,700]];

test("motion envelopes, captions and interventions stay disjoint at every breakpoint", () => {
  for (const [vw,vh] of screens) for (const en of [false,true]) for (let index=-1;index<60;index++) {
    const compact = vw <= 900;
    const width = vw * (compact ? .91 : .938);
    const panel = planPanel(index < 0 ? works : works.slice(index % 4,index % 4 + 4), index, width, vh-140, undefined,en,compact);
    const boxes = panel.tiles.map(t=>t.protectedBox);
    if (panel.statement) boxes.push(panel.statement);
    if (panel.editorial) boxes.push(panel.editorial.protectedBox);
    for (let i=0;i<boxes.length;i++) {
      const a=boxes[i];
      assert.ok(a.x >= -.01 && a.x+a.width <= width+.01, "horizontal bounds at " + vw + "/" + index);
      assert.ok(a.y >= 0 && a.y+a.height <= panel.height+.01);
      for (let j=0;j<i;j++) assert.equal(overlaps(a,boxes[j]),false, "collision at " + vw + "/" + index);
    }
    for (const tile of panel.tiles) {
      assert.ok(Math.abs((tile.box.width/(tile.box.width/tile.ratio))-tile.ratio)<.00001);
      assert.ok(tile.box.width/tile.ratio <= Math.max(260,Math.min((vh-140)*.88,width*1.35))+.01 || !compact);
      assert.ok(tile.box.y-tile.protectedBox.y >= tile.motion.scroll/2+tile.motion.mouse+17.99);
    }
    const intervals=boxes.map(b=>[b.y,b.y+b.height]).sort((a,b)=>a[0]-b[0]);
    let bottom=0;
    for (const [top,end] of intervals) { assert.ok(top-bottom < vh/2,"unjustified full-width gap"); bottom=Math.max(bottom,end); }
  }
});

test("long measured captions change placement and remain protected",()=>{
  const measure=(kind,text,width)=>kind==="caption"?Math.ceil(text.length*8/width)*25+50:80;
  const panel=planPanel(works.slice(0,4),0,1340,780,measure);
  for(const tile of panel.tiles) assert.ok(tile.box.height-tile.box.width/tile.ratio >= measure("caption",tile.post.internalName,tile.box.width));
});

test("layout is deterministic, handles partial catalogs and keeps protagonists occasional",()=>{
  for (const count of [0,1,2,3,4,8]) {
    const a=planPanel(works.slice(0,count),-1,1340,780);
    assert.deepEqual(a,planPanel(works.slice(0,count),-1,1340,780));
    assert.equal(a.tiles.length,count);
  }
  const featured=Array.from({length:30},(_,i)=>planPanel(works.slice(0,4),i).tiles.filter(t=>t.scale==="protagonist").length);
  assert.equal(featured.reduce((a,b)=>a+b,0),3);
});
