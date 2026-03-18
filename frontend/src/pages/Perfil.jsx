import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
      // Recarrega os dados pra mostrar a foto renderizada
      await carregarPerfil();
    } catch (err) {
      alert("Erro ao enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading && !perfil) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
         <div className="bg-white p-8 rounded-xl shadow border border-red-100 text-center max-w-md w-full">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Ops! Ocorreu um erro</h2>
            <p className="text-gray-600 mb-6">{errorMsg}</p>
            <button 
              onClick={() => navigate('/selecionar')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Voltar ao Início
            </button>
         </div>
      </div>
    );
  }

  // Define cores com base no nível
  const nivelConfig = {
    'GERENTE': { cor: 'orange', texto: 'Gerente' },
    'SUPERVISOR': { cor: 'purple', texto: 'Supervisor' },
    'ATENDENTE_II': { cor: 'blue', texto: 'Atendente II' },
    'ATENDENTE': { cor: 'green', texto: 'Atendente' },
  };

  const currentNivelConfig = nivelConfig[perfil?.nivel_acesso] || { cor: 'gray', texto: perfil?.nivel_acesso };

  // Retorna as iniciais do nome para o Avatar
  const getInitials = (name) => {
    if (!name) return '?';
    const splitName = name.split(' ');
    if (splitName.length > 1) {
       return `${splitName[0][0]}${splitName[splitName.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 relative">
      {uploading && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl flex items-center gap-4 shadow-xl">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             <span className="font-medium text-gray-800">Processando imagem...</span>
          </div>
        </div>
      )}
      
      <div className="max-w-3xl mx-auto">
        
        {/* Header Voltar */}
        <div className="mb-8 flex items-center gap-4">
           <button 
             onClick={() => window.history.back()}
             className="p-2 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-900 shadow-sm transition-colors group"
           >
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
           </button>
           <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
        </div>

        {/* Card Principal */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          
          {/* Fundo Customizado e Avatar */}
          <div 
             className={`h-40 bg-gradient-to-r ${perfil.foto_capa ? '' : `from-${currentNivelConfig.cor}-500 to-${currentNivelConfig.cor}-700`} relative group transition-all duration-300`} 
             style={perfil.foto_capa ? { backgroundImage: `url(${perfil.foto_capa})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          >
             <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>
             
             {/* Upload Capa Botão Hover */}
             <label className="absolute top-4 right-4 bg-white/90 p-2.5 rounded-xl shadow-md backdrop-blur-sm cursor-pointer hover:bg-white transition opacity-0 group-hover:opacity-100 flex items-center gap-2 text-sm font-semibold text-gray-800 border border-gray-100/50 hover:scale-105 active:scale-95">
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImg('foto_capa', e.target.files[0])} />
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Alterar Capa
             </label>
          </div>
          
          <div className="px-6 sm:px-10 pb-10">
            {/* Avatar flutuante com suporte de Upload */}
            <div className={`relative -mt-16 w-32 h-32 mx-auto sm:mx-0 rounded-2xl bg-white p-1.5 shadow-lg border border-gray-200 flex items-center justify-center group/avatar`}>
              
              {perfil.foto_perfil ? (
                 <img src={perfil.foto_perfil} alt="Avatar do Usuário" className="w-full h-full rounded-xl object-cover" />
              ) : (
                 <div className={`w-full h-full rounded-xl bg-gradient-to-br from-${currentNivelConfig.cor}-50 to-${currentNivelConfig.cor}-100 flex items-center justify-center text-4xl font-bold text-${currentNivelConfig.cor}-700`}>
                   {getInitials(perfil.nome_completo || perfil.username)}
                 </div>
              )}

              {/* Upload Foto Overlay */}
              <label 
                className="absolute -bottom-2 -right-2 bg-white p-2.5 rounded-full shadow-md border border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all outline-4 outline-white outline z-10 text-gray-700 hover:text-blue-600" 
                title="Alterar Foto de Perfil"
              >
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleUploadImg('foto_perfil', e.target.files[0])} />
                <svg className="w-5 h-5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </label>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-6 justify-between items-start">
               <div>
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {perfil.nome_completo || 'Sem Nome Cadastrado'}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                     <span className={`px-3 py-1 rounded-full text-sm font-semibold border bg-${currentNivelConfig.cor}-50 text-${currentNivelConfig.cor}-700 border-${currentNivelConfig.cor}-200`}>
                        {currentNivelConfig.texto}
                     </span>
                     <span className="text-gray-500 text-sm flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {perfil.username}
                     </span>
                  </div>
               </div>
               
               {/* Card de Atendimentos Totais */}
               <div className="w-full sm:w-auto bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 min-w-[200px] shadow-sm">
                  <div className="p-3 bg-white rounded-xl shadow-sm text-blue-600">
                     <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                     </svg>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 font-semibold uppercase tracking-wider">Total Atendimentos</div>
                    <div className="text-2xl font-black text-gray-900">{perfil.total_atendimentos.toLocaleString()}</div>
                  </div>
               </div>
            </div>

            <div className="h-px bg-gray-100 w-full my-8"></div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-12">
               <div>
                 <label className="text-sm text-gray-500 font-medium">CPF</label>
                 <div className="mt-1 font-semibold text-gray-900 bg-gray-50/50 p-2 rounded border border-gray-100">
                    {perfil.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}
                 </div>
               </div>
               
               <div>
                 <label className="text-sm text-gray-500 font-medium">Posto Atual Vinculado</label>
                 <div className="mt-1 font-semibold text-gray-900 bg-gray-50/50 p-2 rounded border border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    {perfil.posto_atual}
                 </div>
               </div>

               <div>
                 <label className="text-sm text-gray-500 font-medium">Conta Criada Em</label>
                 <div className="mt-1 font-semibold text-gray-900 bg-gray-50/50 p-2 rounded border border-gray-100">
                    {perfil.data_criacao}
                 </div>
               </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}
