const SPREADSHEET_ID = "PASTE_YOUR_GOOGLE_SHEET_ID_HERE";
const ADMIN_EMAILS = ["your-admin-email@gmail.com"];
const SHEETS = {
  Profile:["key","name","image","intro","email","whatsapp"],
  Gallery:["id","title","image"],
  Songs:["id","title","artist","url"],
  Messages:["id","name","email","message","createdAt"]
};
function doGet(e){
  const action=(e&&e.parameter&&e.parameter.action)||"site";
  if(action!=="site")return out_({ok:false,error:"Unknown action"});
  try{return out_({ok:true,data:readSite_()});}catch(err){return out_({ok:false,error:err.message});}
}
function doPost(e){
  try{
    const b=JSON.parse((e&&e.postData&&e.postData.contents)||"{}");
    if(b.action==="contact"){
      const name=clean_(b.name,100),email=clean_(b.email,150),message=clean_(b.message,2000);
      if(!name||!message||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw Error("Isi nama, email valid, dan pesan.");
      SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Messages").appendRow([Utilities.getUuid(),name,email,message,new Date()]);
      return out_({ok:true});
    }
    const email=verifyAdmin_(b.idToken);
    if(b.action==="adminGet")return out_({ok:true,email:email,data:readSite_()});
    if(b.action==="saveProfile")return saveProfile_(b.profile||{},b.quote||"");
    if(b.action==="saveItem")return saveItem_(b.type,b.item||{});
    if(b.action==="deleteItem")return deleteItem_(b.type,b.id);
    throw Error("Aksi tidak dikenal.");
  }catch(err){return out_({ok:false,error:err.message||"Terjadi kesalahan"});}
}
function setupSheets(){
  if(SPREADSHEET_ID.indexOf("PASTE_")===0)throw Error("Isi SPREADSHEET_ID dahulu.");
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  Object.keys(SHEETS).forEach(n=>{let sh=ss.getSheetByName(n);if(!sh)sh=ss.insertSheet(n);if(!sh.getLastRow())sh.appendRow(SHEETS[n]);sh.setFrozenRows(1);});
  let sh=ss.getSheetByName("Profile");if(sh.getLastRow()<2)sh.appendRow(["main","Zaki Ansyari","","Hari terbesar dalam hidup Anda dan saya adalah ketika kita bertanggung jawab penuh atas sikap kita.","",""]);
  sh=ss.getSheetByName("Gallery");if(sh.getLastRow()<2)sh.getRange(2,1,3,3).setValues([["g1","Moments",""],["g2","Experiences",""],["g3","Memories",""]]);
  sh=ss.getSheetByName("Songs");if(sh.getLastRow()<2)sh.appendRow(["m1","Something Just Like This","The Chainsmokers, Coldplay","https://open.spotify.com/"]);
  return "Database siap.";
}
function readSite_(){
  const ss=SpreadsheetApp.openById(SPREADSHEET_ID);
  const profile=readRows_(ss,"Profile")[0]||{};
  const gallery=readRows_(ss,"Gallery"),songs=readRows_(ss,"Songs");
  return {profile:profile,gallery:gallery,songs:songs,contact:{quote:PropertiesService.getScriptProperties().getProperty("SONG_QUOTE")||"Tidak perlu memiliki kemampuan atau kekuatan super untuk merasakan cinta. Yang dibutuhkan hanyalah menjadi diri sendiri."}};
}
function readRows_(ss,name){
  const sh=ss.getSheetByName(name);if(!sh||sh.getLastRow()<2)return [];
  const rows=sh.getDataRange().getDisplayValues(),headers=rows.shift();
  return rows.filter(r=>r.some(v=>v!=="")).map(r=>{const o={};headers.forEach((h,i)=>{if(h!=="key")o[h]=r[i]});return o;});
}
function saveProfile_(p,quote){
  const clean={name:clean_(p.name,100),image:clean_(p.image,1000),intro:clean_(p.intro,1000),email:clean_(p.email,150),whatsapp:clean_(p.whatsapp,1000)};
  if(!clean.name||!clean.intro)throw Error("Nama dan kutipan Home wajib diisi.");
  ["image","whatsapp"].forEach(k=>{if(clean[k]&&!/^https:\/\/\S+$/i.test(clean[k]))throw Error(k+" harus URL HTTPS.");});
  if(clean.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email))throw Error("Email tidak valid.");
  const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Profile"),row=["main",clean.name,clean.image,clean.intro,clean.email,clean.whatsapp];
  if(sh.getLastRow()<2)sh.appendRow(row);else sh.getRange(2,1,1,row.length).setValues([row]);
  PropertiesService.getScriptProperties().setProperty("SONG_QUOTE",clean_(quote,1000));
  return out_({ok:true});
}
function saveItem_(type,item){
  const map={gallery:"Gallery",songs:"Songs"};if(!map[type])throw Error("Jenis data tidak valid.");
  const name=map[type],headers=SHEETS[name],sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  const id=clean_(item.id,100)||Utilities.getUuid(),clean={id};
  headers.slice(1).forEach(k=>clean[k]=clean_(item[k],k==="title"?150:1000));
  if(!clean.title)throw Error("Judul wajib diisi.");
  if(type==="gallery"&&(!clean.image||!/^https:\/\/\S+$/i.test(clean.image)))throw Error("URL gambar HTTPS wajib diisi.");
  if(type==="songs"&&(!clean.artist||!/^https:\/\/\S+$/i.test(clean.url)))throw Error("Artis dan URL HTTPS wajib diisi.");
  const rows=sh.getDataRange().getDisplayValues();let rowNum=-1;
  for(let i=1;i<rows.length;i++)if(rows[i][0]===id){rowNum=i+1;break;}
  const row=headers.map(h=>h==="id"?id:clean[h]||"");if(rowNum<0)sh.appendRow(row);else sh.getRange(rowNum,1,1,row.length).setValues([row]);
  return out_({ok:true});
}
function deleteItem_(type,id){
  const map={gallery:"Gallery",songs:"Songs"};if(!map[type])throw Error("Jenis data tidak valid.");
  const sh=SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(map[type]),rows=sh.getDataRange().getDisplayValues();
  for(let i=1;i<rows.length;i++)if(rows[i][0]===String(id)){sh.deleteRow(i+1);return out_({ok:true});}
  throw Error("Data tidak ditemukan.");
}
function verifyAdmin_(token){
  if(!token)throw Error("Token login tidak ada.");
  const r=UrlFetchApp.fetch("https://oauth2.googleapis.com/tokeninfo?id_token="+encodeURIComponent(token),{muteHttpExceptions:true});
  if(r.getResponseCode()!==200)throw Error("Token Google tidak valid atau kedaluwarsa.");
  const i=JSON.parse(r.getContentText());
  if(i.aud!==getOAuthClientId_())throw Error("OAuth Client ID tidak cocok.");
  if(i.email_verified!=="true")throw Error("Email belum terverifikasi.");
  const email=String(i.email||"").toLowerCase();
  if(!ADMIN_EMAILS.map(x=>String(x).toLowerCase().trim()).includes(email))throw Error("Email "+email+" tidak diizinkan menjadi admin.");
  return email;
}
function getOAuthClientId_(){return "PASTE_YOUR_GOOGLE_OAUTH_WEB_CLIENT_ID_HERE";}
function clean_(v,n){let s=String(v==null?"":v).trim().slice(0,n||1000);if(/^[=+\-@]/.test(s))s="'"+s;return s;}
function out_(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
