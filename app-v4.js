const PUB="https://docs.google.com/spreadsheets/d/e/2PACX-1vRTB4csJ8XYI8saQy51AAO0uKEFFvg-LS3hYOETA_cugDZw52LUBIIOH0ddA6l4fm1ylOQuUj26lmMa/pub";

const GIDS={
  services:"0",
  videos:"359065399",
  sermons:"739042827",
  updates:"1349235035",
  events:"1957554582",
  church:"160905171"
};

function csv(text){
  const rows=[];
  let row=[],cell="",quote=false;
  for(let i=0;i<text.length;i++){
    const c=text[i],n=text[i+1];
    if(c=='"'&&quote&&n=='"'){cell+='"';i++;continue}
    if(c=='"'){quote=!quote;continue}
    if(c==","&&!quote){row.push(cell);cell="";continue}
    if((c=="\n"||c=="\r")&&!quote){
      if(c=="\r"&&n=="\n")i++;
      row.push(cell);cell="";
      if(row.some(x=>x.trim()!=""))rows.push(row);
      row=[];
      continue
    }
    cell+=c
  }
  if(cell!=""||row.length){row.push(cell);rows.push(row)}
  const headers=rows.shift().map(x=>x.trim());
  return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||"").trim()])))
}

async function sheet(gid){
  const r=await fetch(`${PUB}?gid=${gid}&single=true&output=csv&t=${Date.now()}`);
  return csv(await r.text());
}

Promise.all(Object.values(GIDS).map(sheet)).then(([services,videos,sermons,updates,events,church])=>{
  const c=Object.fromEntries(church.map(x=>[x.Field,x.Value]));

  document.getElementById("location").textContent=c.Location;
  document.getElementById("bishop").textContent=c.Bishop;
  document.getElementById("phone").textContent=c.Phone;

  const email=document.getElementById("email");
  email.textContent=c.Email;
  email.href="mailto:"+c.Email;

  document.getElementById("servicesGrid").innerHTML=services.map(x=>
    `<article class="card service"><h3>${x.Service}</h3><div class="meta">${x.Schedule}</div></article>`
  ).join("");

  const s=sermons[0];

  document.getElementById("sermon").innerHTML=
    `<article class="sermon-feature"><div><h3>${s.Title}</h3><div class="meta">${s.Speaker} · ${s.Date}</div><p>${s.Description}</p></div><a class="btn watch" href="${s["YouTube Link"]}" target="_blank" rel="noopener">Watch on YouTube ↗</a></article>`;

  document.getElementById("heroSermon").href=s["YouTube Link"];

  document.getElementById("videosGrid").innerHTML=videos.map(x=>
    `<article class="card video"><div class="video-main"><div class="video-icon">▶</div><div><h3>${x.Title}</h3><div class="meta">${x.Date}</div></div></div><a href="${x["YouTube Link"]}" target="_blank" rel="noopener">Watch ↗</a></article>`
  ).join("");

  document.getElementById("updatesGrid").innerHTML=updates.map(x=>
    `<article class="card"><h3>${x.Title}</h3><div class="meta">${x.Update}</div></article>`
  ).join("");

  document.getElementById("eventsGrid").innerHTML=events.map(x=>
    `<article class="card"><h3>${x.Event}</h3><div class="meta">${x.Location}</div><p>${x.Schedule}</p></article>`
  ).join("");

}).catch(console.error);

const m=document.getElementById("menuToggle");
const n=document.getElementById("mainNav");

m.onclick=()=>n.classList.toggle("open");

n.querySelectorAll("a").forEach(a=>
  a.onclick=()=>n.classList.remove("open")
);
