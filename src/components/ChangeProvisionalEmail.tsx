import { useEffect, useState } from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';
import { changeEmailAndPassword, errorMessage, getPendingEmail, isProvisionalEmail } from '../lib-supabase';

type Props = {
  currentEmail: string;
  /** Chamado depois de salvar: o painel encerra a sessão e pede novo login. */
  onDone: (message: string) => void;
  onLogout: () => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ChangeProvisionalEmail({ currentEmail, onDone, onLogout }: Props) {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [pending, setPending] = useState('');

  useEffect(() => { getPendingEmail().then(setPending); }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const email = newEmail.trim().toLowerCase();
    if (!emailRegex.test(email)) return setError('Informe um e-mail válido.');
    if (isProvisionalEmail(email)) return setError('Use o seu e-mail real, não um e-mail de exemplo.');
    if (email === currentEmail.toLowerCase()) return setError('O novo e-mail precisa ser diferente do provisório.');
    if (password.length < 12) return setError('A senha precisa ter pelo menos 12 caracteres.');
    if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) return setError('Use letras maiúsculas, minúsculas e números na senha.');
    if (password !== confirm) return setError('As senhas não conferem.');
    setSaving(true);
    try {
      const { pendingEmail } = await changeEmailAndPassword(email, password);
      onDone(pendingEmail
        ? `Enviamos um link de confirmação para ${pendingEmail}. Abra o e-mail e confirme (verifique também o e-mail atual e o spam). Depois de confirmar, entre com o novo e-mail e a nova senha.`
        : 'E-mail e senha atualizados. Entre novamente com os novos dados.');
    } catch (err) {
      setError(errorMessage(err, 'Não foi possível atualizar. Tente novamente.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-md rounded-2xl border border-amber-300 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-start gap-3 rounded-xl bg-amber-50 p-4 text-amber-950">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <h2 className="font-bold">Ação necessária</h2>
          <p className="mt-1 text-sm">Você entrou com um e-mail provisório (<strong>{currentEmail}</strong>). Por segurança, troque o e-mail e a senha antes de usar o painel.</p>
        </div>
      </div>
      {pending && <p className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">Já existe uma troca aguardando confirmação para <strong>{pending}</strong>. Confirme pelo link enviado ao e-mail ou preencha abaixo para tentar outro endereço.</p>}
      <label className="mb-3 block text-sm font-medium">Novo e-mail
        <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} autoComplete="email" className="mt-1 w-full rounded-lg border p-3" />
      </label>
      <label className="mb-3 block text-sm font-medium">Nova senha (mín. 12 caracteres)
        <input type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" className="mt-1 w-full rounded-lg border p-3" />
      </label>
      <label className="mb-4 block text-sm font-medium">Repita a nova senha
        <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)} autoComplete="new-password" className="mt-1 w-full rounded-lg border p-3" />
      </label>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button disabled={saving} className="w-full rounded-lg bg-blue-900 p-3 font-bold text-white disabled:opacity-60">{saving ? 'Salvando...' : 'Trocar e-mail e senha'}</button>
      <button type="button" onClick={onLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border p-3 text-sm font-semibold text-slate-700"><LogOut className="h-4 w-4" /> Sair</button>
    </form>
  );
}
