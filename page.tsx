'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const copy: Record<string, any> = {
  ar: {nav:['الرئيسية','المنتديات','الأعضاء','الدردشة'],hero:'مجتمع الطيران والمعرفة الجوية',desc:'تواصل مع الطيارين وطلاب الطيران والمهندسين وعشاق السماء.',join:'إنشاء حساب / دخول',forums:'منتديات الطيران',chat:'الدردشة العامة',send:'إرسال',placeholder:'اكتب رسالتك...',email:'البريد الإلكتروني',password:'كلمة المرور',name:'الاسم الظاهر',signup:'إنشاء حساب',login:'دخول',signout:'خروج',needAuth:'سجّل الدخول للمشاركة في الدردشة.'},
  en: {nav:['Home','Forums','Members','Chat'],hero:'Aviation Community & Knowledge Hub',desc:'Connect with pilots, aviation students, engineers, and sky enthusiasts.',join:'Sign up / Sign in',forums:'Aviation Forums',chat:'Public Chat',send:'Send',placeholder:'Write a message...',email:'Email',password:'Password',name:'Display name',signup:'Create account',login:'Sign in',signout:'Sign out',needAuth:'Sign in to participate in chat.'},
  fr: {nav:['Accueil','Forums','Membres','Chat'],hero:'Communauté et savoir aéronautiques',desc:'Échangez avec pilotes, étudiants, ingénieurs et passionnés.',join:'Inscription / Connexion',forums:'Forums aéronautiques',chat:'Chat public',send:'Envoyer',placeholder:'Votre message...',email:'E-mail',password:'Mot de passe',name:'Nom affiché',signup:'Créer un compte',login:'Connexion',signout:'Déconnexion',needAuth:'Connectez-vous pour participer.'},
  es: {nav:['Inicio','Foros','Miembros','Chat'],hero:'Comunidad y conocimiento aeronáutico',desc:'Conecta con pilotos, estudiantes, ingenieros y aficionados.',join:'Registro / Acceso',forums:'Foros de aviación',chat:'Chat público',send:'Enviar',placeholder:'Escribe un mensaje...',email:'Correo electrónico',password:'Contraseña',name:'Nombre visible',signup:'Crear cuenta',login:'Entrar',signout:'Salir',needAuth:'Inicia sesión para participar.'}
}
export default function Home() {
  const [lang,setLang] = useState('ar'), [email,setEmail] = useState(''), [password,setPassword] = useState(''), [name,setName] = useState('')
  const [user,setUser] = useState<any>(null), [messages,setMessages] = useState<any[]>([]), [message,setMessage] = useState(''), [status,setStatus] = useState('')
  const t = copy[lang]
  useEffect(()=>{supabase.auth.getUser().then(({data})=>setUser(data.user)); loadMessages()
    const auth = supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user ?? null))
    const channel = supabase.channel('public-chat').on('postgres_changes',{event:'INSERT',schema:'public',table:'chat_messages'},payload=>setMessages(old=>[...old,payload.new])).subscribe()
    return ()=>{auth.data.subscription.unsubscribe();supabase.removeChannel(channel)}
  },[])
  async function loadMessages(){const {data}=await supabase.from('chat_messages').select('id,body,created_at,profiles(display_name)').order('created_at',{ascending:true}).limit(100);if(data)setMessages(data)}
  async function auth(mode:'signup'|'login'){setStatus('');if(mode==='signup'){const {error}=await supabase.auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:process.env.NEXT_PUBLIC_SITE_URL+'/auth/callback'}});setStatus(error?.message||'Check your email to verify your account.');}else{const {error}=await supabase.auth.signInWithPassword({email,password});setStatus(error?.message||'Signed in.')}} 
  async function send(){if(!user){setStatus(t.needAuth);return}if(!message.trim())return;const {error}=await supabase.from('chat_messages').insert({user_id:user.id,body:message.trim()});if(error)setStatus(error.message);else setMessage('')}
  async function signout(){await supabase.auth.signOut();setUser(null)}
  return <main>
    <header><a className="logo">✈ Sky<span>Nexa</span></a><nav>{t.nav.map((n:string,i:number)=><a key={n} href={['#home','#forums','#members','#chat'][i]}>{n}</a>)}</nav><select value={lang} onChange={e=>setLang(e.target.value)}><option value="ar">العربية</option><option value="en">English</option><option value="fr">Français</option><option value="es">Español</option></select></header>
    <section className="hero" id="home"><small>FLY • LEARN • DISCUSS • GROW</small><h1>{t.hero}</h1><p>{t.desc}</p><a className="button" href="#account">{t.join}</a></section>
    <section className="section" id="forums"><h2>{t.forums}</h2><div className="grid">{['✈ Pilots & Careers','🧭 Flight Operations & Safety','🔧 Aircraft Maintenance','🗼 Air Traffic Control','🎓 Aviation Students','🌐 Aviation News'].map(x=><article key={x}><h3>{x}</h3><p>Knowledge sharing, discussions and aviation learning.</p></article>)}</div></section>
    <section className="section" id="account"><h2>{user?`Welcome ${user.email}`:t.join}</h2>{!user?<div className="auth"><input placeholder={t.name} value={name} onChange={e=>setName(e.target.value)}/><input placeholder={t.email} type="email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder={t.password} type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button onClick={()=>auth('signup')}>{t.signup}</button><button className="secondary" onClick={()=>auth('login')}>{t.login}</button></div>:<button onClick={signout}>{t.signout}</button>}{status&&<p className="status">{status}</p>}</section>
    <section className="section" id="members"><h2>{t.nav[2]}</h2><p>Member profiles are created when users register. Profile editing can be extended in the next iteration.</p></section>
    <section className="section" id="chat"><h2>{t.chat}</h2><div className="chat">{messages.map((m:any)=><div className="bubble" key={m.id}><b>{m.profiles?.display_name||'Member'}</b><p>{m.body}</p></div>)}</div><div className="send"><input placeholder={t.placeholder} value={message} onChange={e=>setMessage(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/><button onClick={send}>{t.send}</button></div>{!user&&<small>{t.needAuth}</small>}</section>
    <footer>Sudan Aviation NextGen · The Next Generation of Sudan Aviation</footer>
  </main>
}
