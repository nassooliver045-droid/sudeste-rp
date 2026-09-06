const sidebar=document.getElementById('sidebar'),menu=document.getElementById('menu'),search=document.getElementById('search'),links=[...document.querySelectorAll('#nav a')],sections=[...document.querySelectorAll('main section[id],header[id]')];
menu?.addEventListener('click',()=>sidebar.classList.toggle('open'));
links.forEach(a=>a.addEventListener('click',()=>sidebar.classList.remove('open')));
const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+e.target.id))}})},{rootMargin:'-20% 0px -70% 0px',threshold:0});
sections.forEach(s=>observer.observe(s));
search.addEventListener('input',()=>{const q=search.value.toLowerCase().trim();links.forEach(a=>{const target=document.querySelector(a.getAttribute('href'));const ok=!q||(a.dataset.title+' '+(target?.innerText||'')).toLowerCase().includes(q);a.style.display=ok?'block':'none'})});
