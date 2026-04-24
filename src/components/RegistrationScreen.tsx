import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

type Props = {
  onRegisterSuccess: (plan: string) => void;
};

export const RegistrationScreen: React.FC<Props> = ({ onRegisterSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [plan, setPlan] = useState('Familiar');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLogin) {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setLoading(false);
      if (signInError) {
        setError(signInError.message);
      } else {
        // En un caso real, obtendríamos el plan del perfil del usuario en la base de datos
        // Por ahora, usamos el que esté en metadata o Familiar por defecto
        onRegisterSuccess(data.user?.user_metadata?.plan || 'Familiar');
      }
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            plan: plan
          }
        }
      });
      setLoading(false);
      if (signUpError) {
        setError(signUpError.message);
      } else {
        onRegisterSuccess(plan);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl p-6 sm:p-8 border border-blue-100 mt-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
      
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🐘</div>
        <h2 className="text-2xl font-extrabold text-blue-950 mb-1">
          {isLogin ? '¡Bienvenido de nuevo!' : 'Comienza con Fante'}
        </h2>
        <p className="text-sm text-blue-800/60 font-medium">
          {isLogin 
            ? 'Ingresa tus credenciales para continuar.' 
            : 'Crea tu cuenta y empieza a transformar el aprendizaje.'}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-medium flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">!</div>
          <span className="flex-1">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950 text-sm"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full pl-12 pr-4 py-3 bg-blue-50/50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-blue-950 text-sm"
          />
        </div>

        {!isLogin && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-blue-900 ml-1">Selecciona tu plan</label>
            <div className="relative">
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full px-4 py-3 bg-blue-50/50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-blue-950 appearance-none cursor-pointer text-sm"
              >
                <option value="Familiar">Familiar (Gratis para siempre)</option>
                <option value="Profesional">Profesional (USD 19/mes)</option>
                <option value="Clínica">Clínica (USD 49/mes)</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                <ArrowRight size={18} className="rotate-90" />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all overflow-hidden"
        >
          {loading ? (
            <Loader2 className="animate-spin mx-auto" size={20} />
          ) : (
            <span className="flex items-center justify-center gap-2">
              {isLogin ? 'Acceder' : 'Crear cuenta'} <ArrowRight size={18} />
            </span>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-400 font-medium">
        {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'} 
        <button 
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }} 
          className="text-blue-600 font-bold hover:underline ml-1"
        >
          {isLogin ? 'Regístrate' : 'Inicia sesión'}
        </button>
      </p>
    </div>
  );
};
