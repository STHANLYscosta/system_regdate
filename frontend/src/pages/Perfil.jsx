import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { logout } from '../services/auth';

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('perfil/');
      setPerfil(res.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.erro || "Erro ao carregar dados do perfil.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImg = async (campo, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append(campo, file);
    
    try {
      setUploading(true);
      await api.put('perfil/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await carregarPerfil();
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro ao atualizar imagem.");
    } finally {
      setUploading(false);
    }
  };

  const [passwordForm, setPasswordForm] = useState({ s_atual: '', s_nova: '' });
  const [passMsg, setPassMsg] = useState('');
  
  const handleTrocaSenha = async (e) => {
    e.preventDefault();
    try {
      await api.put('perfil/', {  
        senha_atual: passwordForm.s_atual,
        nova_senha: passwordForm.s_nova
      });
      setPassMsg("Senha alterada com sucesso!");
      setPasswordForm({ s_atual: '', s_nova: '' });
      setTimeout(() => setPassMsg(''), 3000);
    } catch (err) {
      setPassMsg(err.response?.data?.erro || "Erro ao trocar a senha.");
    }
  };

  if (isLoading && !perfil) {
    return (
      <div className="min-h-screen page-bg flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--teal-500)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const capaUrl = perfil?.foto_capa ? (perfil.foto_capa.startsWith('http') ? perfil.foto_capa : `http://${window.location.hostname}:8000${perfil.foto_capa}`) : 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop';
  const perfilUrl = perfil?.foto_perfil ? (perfil.foto_perfil.startsWith('http') ? perfil.foto_perfil : `http://${window.location.hostname}:8000${perfil.foto_perfil}`) : null;

  return (
    <div className="min-h-screen page-bg pb-20">
      {/* Header Fixo */}
      <header className="app-header">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()}
              className="p-2 rounded-xl transition-all hover:scale-105 active:scale-95 group"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" style={{ color: 'var(--teal-300)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <img src="/src/assets/images/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.target.style.display='none'} />
            <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
              Meu Perfil
            </h1>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            Sair
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto mt-8 px-6">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Card Principal - Capa e Foto */}
        <div className="card-dark overflow-hidden relative">
          
          {/* Capa */}
          <div className="h-56 w-full relative group">
            <img src={capaUrl} alt="Capa" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <label className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 text-white px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:bg-white/20 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Alterar Capa
                  <input type="file" className="hidden" accept="image/*" onChange={(e)=>handleUploadImg('foto_capa', e.target.files[0])} disabled={uploading} />
               </label>
            </div>
            {/* Gradiente de overlay visual inferior da capa */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[var(--dark-900)] to-transparent pointer-events-none"></div>
          </div>

          {/* Dados do Perfil e Avatar Flutuante */}
          <div className="px-8 pb-10 relative">
             <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16">
                
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-[var(--dark-900)] shadow-2xl bg-[var(--dark-800)] flex items-center justify-center">
                    {perfilUrl ? (
                      <img src={perfilUrl} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-black text-white/50">{perfil?.nome_completo?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <label className="absolute bottom-2 right-2 p-2.5 bg-[var(--teal-500)] text-white rounded-xl shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-transform z-10 border-2 border-[var(--dark-900)]">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>
                    <input type="file" className="hidden" accept="image/*" onChange={(e)=>handleUploadImg('foto_perfil', e.target.files[0])} disabled={uploading} />
                  </label>
                </div>

                {/* Info Textual */}
                <div className="text-center sm:text-left pt-2 pb-1">
                  <h2 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>
                    {perfil?.nome_completo || perfil?.username}
                  </h2>
                  <p className="text-base font-medium mt-1" style={{ color: 'var(--teal-300)' }}>
                    @{perfil?.username}
                  </p>
                </div>

                {/* Badge de Nível à direita */}
                <div className="sm:ml-auto mb-3 flex flex-wrap justify-center gap-3">
                   <div className="badge-teal text-base font-bold px-5 py-2">{perfil?.nivel_acesso?.replace('_', ' ')}</div>
                   {perfil?.posto_atual && (
                     <div className="badge-teal text-base font-bold px-5 py-2 opacity-90 border-transparent bg-white/10 text-white">Lotação: {perfil?.posto_atual}</div>
                   )}
                </div>
             </div>
          </div>
        </div>

        {/* Grid Dividido */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          
          {/* Card Detalhes Profissionais */}
          <div className="card-dark p-8">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <svg className="w-5 h-5 text-[var(--teal-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                <h3 className="text-lg font-bold text-white">Ficha Profissional</h3>
             </div>
             
             <div className="space-y-5">
                <div>
                   <label className="label-dark">Registro de Matrícula</label>
                   <div className="input-dark py-3 opacity-60 cursor-not-allowed bg-black/20">
                     {perfil?.matricula || '--'}
                   </div>
                </div>
                <div>
                   <label className="label-dark">Documento (CPF)</label>
                   <div className="input-dark py-3 opacity-80 bg-black/20 text-white font-medium">
                     {perfil?.cpf || 'Não informado'}
                   </div>
                </div>
             </div>
          </div>

          {/* Card Troca de Senha */}
          <div className="card-dark p-8">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                <svg className="w-5 h-5 text-[var(--teal-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                <h3 className="text-lg font-bold text-white">Segurança / Credenciais</h3>
             </div>

             <form onSubmit={handleTrocaSenha} className="space-y-5">
                <div>
                   <label className="label-dark">Senha Atual</label>
                   <input 
                     type="password" 
                     className="input-dark" 
                     placeholder="Digite sua senha em uso"
                     value={passwordForm.s_atual}
                     onChange={e => setPasswordForm({...passwordForm, s_atual: e.target.value})}
                     required 
                   />
                </div>
                <div>
                   <label className="label-dark">Nova Senha Forte</label>
                   <input 
                     type="password" 
                     className="input-dark" 
                     placeholder="Crie uma nova senha de acesso"
                     value={passwordForm.s_nova}
                     onChange={e => setPasswordForm({...passwordForm, s_nova: e.target.value})}
                     required 
                   />
                </div>

                {passMsg && (
                  <div className={`p-3 rounded-lg text-sm font-medium border ${
                    passMsg.includes('sucesso') 
                      ? 'bg-[var(--teal-500)]/10 text-[var(--teal-300)] border-[var(--teal-500)]/20' 
                      : 'bg-red-500/10 text-red-300 border-red-500/20'
                  }`}>
                    {passMsg}
                  </div>
                )}

                <button type="submit" className="btn-primary w-full mt-2">
                  Atualizar Senha
                </button>
             </form>
          </div>
        </div>
      </main>
    </div>
  );
}
