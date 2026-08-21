import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { MediaOrientation, Project, ProjectImage } from "@/data/projects";

export type ContentFrontmatter = { title:string; slug:string; year:string; category:string; summary:string };
export type ContentSection = { kind:"intro"|"section"|"closing"; title:string; paragraphs:string[] };
export type ProjectContent = { frontmatter:ContentFrontmatter; sections:ContentSection[] };

const imagePattern=/\.(avif|gif|jpe?g|png|webp)$/i;
const ignoredPattern=/(^|\/)(\.|__MACOSX)|thumbs\.db|\.ds_store/i;

function parseFrontmatter(source:string){
  const match=source.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/);
  if(!match) throw new Error("content.md precisa começar com frontmatter delimitado por ---");
  const values:Record<string,string>={};
  for(const line of match[1].split("\n")){ const field=line.match(/^([\w-]+):\s*["']?(.*?)["']?\s*$/); if(field) values[field[1]]=field[2]; }
  for(const key of ["title","slug","year","category","summary"]) if(!values[key]) throw new Error(`Campo ${key} ausente no frontmatter`);
  return { frontmatter:values as ContentFrontmatter, body:source.slice(match[0].length) };
}

export function parseProjectContent(source:string):ProjectContent{
  const {frontmatter,body}=parseFrontmatter(source);
  const sections:ContentSection[]=[];
  for(const chunk of body.split(/^#\s+/m).filter(Boolean)){
    const [heading,...lines]=chunk.trim().split("\n");
    const normalized=heading.trim();
    const kind=normalized.toLowerCase()==="intro"?"intro":normalized.toLowerCase()==="closing"?"closing":"section";
    const title=kind==="section"?normalized.replace(/^Section:\s*/i,""):normalized;
    const paragraphs=lines.join("\n").trim().split(/\n\s*\n/).map((p)=>p.replace(/\n/g," ").trim()).filter(Boolean);
    sections.push({kind,title,paragraphs});
  }
  return {frontmatter,sections};
}

export async function readProjectContent(project:Project){
  const file=path.join(process.cwd(),"public",project.contentPath.replace(/^\/art\//,"art/"));
  return parseProjectContent(await fs.readFile(file,"utf8"));
}

function orientationFor(name:string):MediaOrientation{ return /wide|landscape|horizontal/i.test(name)?"landscape":/square/i.test(name)?"square":"portrait"; }
export async function getProjectImages(project:Project):Promise<ProjectImage[]>{
  const directory=path.join(process.cwd(),"public","art",project.artFolder);
  let files:string[]=[]; try{ files=await fs.readdir(directory); }catch{return project.images;}
  const discovered=files.filter((file)=>imagePattern.test(file)&&!ignoredPattern.test(file)).sort().map((file)=>({src:`/art/${project.artFolder}/${file}`,orientation:orientationFor(file)}));
  return discovered.length?discovered:project.images;
}

export async function getHomeCandidates(project:Project){
  if(project.homeImages?.length) return project.homeImages;
  return (await getProjectImages(project)).map(({src})=>src);
}
