import React, { useState } from 'react';
import { Building2, Calendar, MapPin, Search, Store, Briefcase } from 'lucide-react';
import { motion } from 'motion/react';

export default function TestMei() {
  const [cnpjInput, setCnpjInput] = useState('');
  const [empresa, setEmpresa] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatCnpj = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCnpj = cnpjInput.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) {
      setError('Por favor, digite um CNPJ válido com 14 números.');
      return;
    }

    setLoading(true);
    setError(null);
    setEmpresa(null);

    try {
      // Consulta gratuita e sem limites via BrasilAPI
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
      
      if (!response.ok) {
        throw new Error('CNPJ não encontrado ou erro na Receita Federal.');
      }
      
      const data = await response.json();
      setEmpresa(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Consulta Completa de CNPJ</h1>
        <p className="text-gray-500 mt-2">
          Testando a integração em tempo real com a **BrasilAPI** (Dados da Receita Federal).
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-10">
        <input
          type="text"
          value={cnpjInput}
          onChange={(e) => setCnpjInput(formatCnpj(e.target.value))}
          placeholder="Digite um CNPJ (Ex: 00.000.000/0001-00)"
          className="w-full pl-6 pr-32 py-4 rounded-2xl border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-lg transition-shadow"
        />
        <button 
          type="submit"
          disabled={loading}
          className="absolute right-2 top-2 bottom-2 px-6 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Search className="w-5 h-5" />
              Buscar
            </>
          )}
        </button>
      </form>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-center">
          <strong>Erro:</strong> {error}
        </motion.div>
      )}

      {empresa && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
        >
          <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6 pb-6 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {empresa.nome_fantasia || empresa.razao_social}
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${empresa.descricao_situacao_cadastral === 'ATIVA' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {empresa.descricao_situacao_cadastral}
                </span>
              </div>
              <p className="text-gray-500 font-mono">{empresa.cnpj}</p>
            </div>
            
            <div className="bg-indigo-50 px-4 py-3 rounded-xl border border-indigo-100 text-center md:text-right w-full md:w-auto">
              <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider mb-1">Data de Abertura</p>
              <p className="text-lg font-bold text-indigo-900">{empresa.data_inicio_atividade}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Informações do Negócio
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Razão Social</p>
                    <p className="font-medium text-gray-900">{empresa.razao_social}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Natureza Jurídica</p>
                    <p className="font-medium text-gray-900">{empresa.natureza_juridica}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Porte</p>
                    <p className="font-medium text-gray-900">{empresa.descricao_porte}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Store className="w-4 h-4" /> Atividade Principal (CNAE)
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <p className="text-sm text-indigo-600 font-mono mb-1">{empresa.cnae_fiscal}</p>
                  <p className="font-medium text-gray-900">{empresa.cnae_fiscal_descricao}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Endereço Completo
                </h3>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                  <p className="text-gray-900">
                    <span className="font-medium">{empresa.logradouro}</span>, {empresa.numero}
                    {empresa.complemento && ` - ${empresa.complemento}`}
                  </p>
                  <p className="text-gray-600">Bairro: {empresa.bairro}</p>
                  <p className="text-gray-900 font-medium">{empresa.municipio} - {empresa.uf}</p>
                  <p className="text-gray-500 font-mono text-sm">CEP: {empresa.cep}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
