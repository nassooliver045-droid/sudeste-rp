const fs=require("fs");
const source=fs.readFileSync(__dirname+"/server.js","utf8");
const replacement='fields:(extra.length>25?[...extra.slice(0,24),{name:"📝 Respostas adicionais",value:extra.slice(24).map(x=>`**${x.name}** ${String(x.value||"").slice(0,120)}`).join("\\n").slice(0,1024),inline:false}]:extra),footer:';
const fixed=source.replace("fields:extra,footer:",replacement);
if(fixed===source) throw new Error("Não foi possível aplicar a correção do limite de campos do Discord.");
eval(fixed);
