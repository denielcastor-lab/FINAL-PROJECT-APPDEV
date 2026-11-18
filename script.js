const products=[
 {id:1,name:"Heart Silver Diamond Ring",price:400000,img:"images/ring.svg"},
 {id:2,name:"Diamond Gold Necklace",price:200000,img:"images/necklace.svg"},
 {id:3,name:"Silver Diamond Ring",price:600000,img:"images/rings.svg"}
];
const peso=n=>"₱"+n.toLocaleString("en-PH");
const $=s=>document.querySelector(s);
let cart=JSON.parse(localStorage.getItem("dcCart")||"[]");

// Fallback drawing if an image file is missing
const fallback=t=>"data:image/svg+xml;utf8,"+encodeURIComponent(
`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'><rect width='300' height='300' fill='#1a1a1a'/><circle cx='150' cy='170' r='60' fill='none' stroke='#e0a919' stroke-width='14'/><polygon points='150,70 180,110 150,130 120,110' fill='#cfe9ff' stroke='#fff' stroke-width='3'/><text x='150' y='275' fill='#e0a919' font-size='16' text-anchor='middle' font-family='serif'>${t}</text></svg>`);
document.addEventListener("error",e=>{
 const i=e.target; if(i.tagName==="IMG"&&!i.dataset.f){i.dataset.f=1;i.src=fallback(i.dataset.fallback||i.alt||"DC LUXURIOUS")}
},true);

// Render products
function render(list=products){
 $("#productGrid").innerHTML=list.map(p=>`
  <article class="card">
   <h4>Best Seller</h4>
   <div class="pic"><img src="${p.img}" alt="${p.name}" data-fallback="${p.name}" loading="lazy"></div>
   <div class="body">${p.name}</div>
   <button class="buy" data-id="${p.id}">Buy Now ${peso(p.price)}</button>
  </article>`).join("");
 $("#noResult").hidden=list.length>0;
}
render();
$("#productGrid").addEventListener("click",e=>{
 const b=e.target.closest(".buy"); if(!b)return;
 addToCart(+b.dataset.id);
});
$("#search").addEventListener("input",e=>{
 const q=e.target.value.toLowerCase().trim();
 render(products.filter(p=>p.name.toLowerCase().includes(q)));
});

// Cart
function save(){localStorage.setItem("dcCart",JSON.stringify(cart));drawCart()}
function addToCart(id){
 const it=cart.find(c=>c.id===id); it?it.qty++:cart.push({id,qty:1});
 save(); toast("Added to cart ✓"); openCart();
}
function change(id,d){
 const it=cart.find(c=>c.id===id); if(!it)return;
 it.qty+=d; if(it.qty<=0)cart=cart.filter(c=>c.id!==id); save();
}
const total=()=>cart.reduce((s,c)=>s+products.find(p=>p.id===c.id).price*c.qty,0);
function drawCart(){
 $("#cartCount").textContent=cart.reduce((s,c)=>s+c.qty,0);
 $("#cartTotal").textContent=peso(total());
 $("#cartItems").innerHTML=cart.length?cart.map(c=>{
  const p=products.find(x=>x.id===c.id);
  return `<div class="item"><img src="${p.img}" alt="" data-fallback="${p.name}">
   <div><b>${p.name}</b><br>${peso(p.price)}</div>
   <span class="qty"><button data-d="-1" data-id="${p.id}">−</button> ${c.qty} <button data-d="1" data-id="${p.id}">+</button></span></div>`}).join("")
  :"<p style='color:#999;margin-top:20px'>Your cart is empty.</p>";
}
$("#cartItems").addEventListener("click",e=>{
 const b=e.target.closest("button[data-id]"); if(b)change(+b.dataset.id,+b.dataset.d);
});
const openCart=()=>$("#cart").classList.add("open");
$("#cartBtn").onclick=openCart;
$("#closeCart").onclick=()=>$("#cart").classList.remove("open");
drawCart();

// Checkout
$("#checkoutBtn").onclick=()=>{
 if(!cart.length)return toast("Your cart is empty");
 $("#oSummary").textContent="Order total: "+peso(total());
 $("#modal").hidden=false;
};
$("#cancelOrder").onclick=()=>$("#modal").hidden=true;
$("#checkoutForm").addEventListener("submit",e=>{
 e.preventDefault();
 const n=$("#oName").value.trim(),ph=$("#oPhone").value.trim(),a=$("#oAddr").value.trim();
 if(!n||!/^[0-9+\-\s]{10,15}$/.test(ph)||!a){$("#oErr").textContent="Please enter a valid name, mobile number and address.";return}
 const ref="DC-"+Date.now().toString().slice(-6);
 cart=[];save();$("#modal").hidden=true;$("#cart").classList.remove("open");
 $("#checkoutForm").reset();$("#oErr").textContent="";
 toast(`Order ${ref} placed! Thank you, ${n.split(" ")[0]}.`);
});

// Contact form
$("#contactForm").addEventListener("submit",e=>{
 e.preventDefault();
 let ok=true;
 [["#cName",v=>v.trim()],["#cEmail",v=>/^\S+@\S+\.\S+$/.test(v)],["#cMsg",v=>v.trim().length>4]].forEach(([s,f])=>{
  const el=$(s),good=f(el.value);el.classList.toggle("bad",!good);if(!good)ok=false});
 $("#formMsg").textContent=ok?"Thank you! Deniel Castor will get back to you soon.":"Please complete all fields correctly.";
 if(ok)e.target.reset();
});

function toast(t){const x=$("#toast");x.textContent=t;x.classList.add("show");clearTimeout(x.t);x.t=setTimeout(()=>x.classList.remove("show"),2600)}