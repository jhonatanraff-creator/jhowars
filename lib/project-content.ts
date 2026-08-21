import "server-only";
import { existsSync } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { projects as projectDefaults, type MediaOrientation, type Project, type ProjectImage } from "@/data/projects";

export type ContentFrontmatter = { title:string; slug:string; year:string; category:string; summary:string };
export type ContentSection = { kind:"intro"|"section"|"closing"; title:string; paragraphs:string[] };
export type ProjectContent = { frontmatter:ContentFrontmatter; sections:ContentSection[] };

const imagePattern=/\.(avif|gif|jpe?g|png|webp)$/i;
const ignoredPattern=/(^|\/)(\.|__MACOSX)|thumbs\.db|\.ds_store/i;
const artRoot=path.resolve(process.cwd(),"public","art");
const naturalSorter=new Intl.Collator(undefined,{numeric:true,sensitivity:"base"});

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

/** Build the catalogue from real folders; content.md marks publishable projects. */
export async function getProjects():Promise<Project[]>{
  const entries=await fs.readdir(artRoot,{withFileTypes:true});
  const folders=entries.filter((entry)=>entry.isDirectory()&&!entry.name.startsWith(".")).map((entry)=>entry.name).sort(naturalSorter.compare);
  const discovered=await Promise.all(folders.map(async(artFolder)=>{
    try{
      const content=parseProjectContent(await fs.readFile(path.join(artRoot,artFolder,"content.md"),"utf8"));
      const configured=projectDefaults.find((project)=>project.artFolder===artFolder);
      return {...(configured??{technique:content.frontmatter.category,description:content.frontmatter.summary,images:[],featured:true,orientation:"portrait" as const,layout:"offset" as const,tone:"ink" as const}),slug:content.frontmatter.slug,title:content.frontmatter.title,year:content.frontmatter.year,category:content.frontmatter.category,description:content.frontmatter.summary,artFolder,contentPath:`/art/${artFolder}/content.md`} satisfies Project;
    }catch(error){if((error as NodeJS.ErrnoException).code==="ENOENT")return null;throw error;}
  }));
  return discovered.filter((project):project is Project=>project!==null);
}

export async function getProject(slug:string){return (await getProjects()).find((project)=>project.slug===slug);}
export async function getNextProject(slug:string){const projects=await getProjects();const index=projects.findIndex((project)=>project.slug===slug);return index<0?undefined:projects[(index+1)%projects.length];}

function orientationFor(name:string):MediaOrientation{ return /wide|landscape|horizontal/i.test(name)?"landscape":/square/i.test(name)?"square":"portrait"; }
export async function getProjectImages(project:Project):Promise<ProjectImage[]>{
  const directory=path.resolve(artRoot,project.artFolder);
  const files=await fs.readdir(directory);
  return files
    .filter((file)=>imagePattern.test(file)&&!ignoredPattern.test(file))
    .sort(naturalSorter.compare)
    .map((file)=>({src:`/art/${project.artFolder}/${file}`,orientation:orientationFor(file)}));
}

export async function getHomeCandidates(project:Project){
  const validHomeImages=project.homeImages?.filter(publicImageExists)??[];
  if(validHomeImages.length) return validHomeImages;
  return (await getProjectImages(project)).map(({src})=>src);
}

/** Convert a public image URL to disk only while running on the server. */
export function publicImageExists(src:string|undefined):src is string{
  if(!src?.startsWith("/art/"))return false;
  return existsSync(path.resolve(process.cwd(),"public",src.slice(1)));
}

export function selectProjectImage(project:Project,images:ProjectImage[]){
  if(publicImageExists(project.cover))return project.cover;
  const homeImage=project.homeImages?.find(publicImageExists);
  return homeImage??images[0]?.src;
}

export function logProjectDiagnostics(scope:"HOME"|"WORK",projects:Project[],imagesByProject:ProjectImage[][]){
  const withImages=imagesByProject.filter((images)=>images.length>0).length;
  console.info(`${scope} PROJECTS TOTAL:`,projects.length);
  console.info(`${scope} PROJECTS FEATURED:`,projects.filter((project)=>project.featured).length);
  console.info(`${scope} PROJECTS WITH IMAGES:`,withImages);
  projects.forEach((project,index)=>{
    const images=imagesByProject[index]??[];
    const first=images[0]?.src;
    console.info([
      `[${scope}] ${project.slug}`,
      `featured=${Boolean(project.featured)}`,
      `artFolder=${project.artFolder}`,
      `images=${images.length}`,
      `first=${first??"none"}`,
      `exists=${publicImageExists(first)}`,
    ].join("\n"));
  });
}
