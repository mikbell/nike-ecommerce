# Sistema di Autenticazione Unificato

## Panoramica

Il progetto Nike E-Commerce utilizza ora un sistema di autenticazione unificato basato su Better-Auth, che fornisce:

- **Autenticazione server-side** per API routes e server components
- **Autenticazione client-side** per components interattivi
- **Hook e utilities centralizzi** per una gestione coerente
- **TypeScript types consistenti** per garantire type safety

## Architettura

### 1. Server-side Authentication (`/lib/auth/`)

#### `index.ts` - Configurazione Better-Auth
- Configurazione del server Better-Auth
- Setup database con Drizzle
- Configurazione cookies e sessioni
- Helper `getUser()` per server components

#### `actions.ts` - Server Actions
- `signUp()` - Registrazione utente
- `signIn()` - Accesso utente
- `signOut()` - Disconnessione utente
- `getCurrentUser()` - Recupero utente corrente
- Gestione sessioni guest per utenti non autenticati

### 2. Client-side Authentication (`/lib/auth/client.ts` + `/lib/hooks/use-auth.ts`)

#### `client.ts` - Better-Auth Client
- Client Better-Auth configurato
- Helper functions type-safe
- Gestione errori centralizzata

#### `use-auth.ts` - Hook Principale
- Hook React per gestione stato auth
- Metodi: `signIn`, `signUp`, `signOut`, `refreshUser`
- Stato reattivo: `user`, `isLoading`, `error`
- Gestione automatica della sessione

### 3. Context Provider (`/lib/context/auth-context.tsx`)

Opzionale - Provider per condividere stato auth nell'app tree:

```tsx
import { AuthProvider } from '@/lib/context/auth-context';

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
```

## Utilizzo

### 1. In Server Components

```tsx
import { getCurrentUser } from '@/lib/auth/actions';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return <div>Ciao {user.name}!</div>;
}
```

### 2. In Client Components

```tsx
import { useAuth } from '@/lib/hooks/use-auth';

export default function LoginButton() {
  const { user, signOut, isLoading } = useAuth();
  
  if (isLoading) return <div>Caricamento...</div>;
  
  if (user) {
    return <button onClick={signOut}>Logout</button>;
  }
  
  return <a href="/sign-in">Login</a>;
}
```

### 3. Nelle API Routes

```tsx
import { getCurrentUser } from '@/lib/auth/actions';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json(
      { error: 'Non autenticato' },
      { status: 401 }
    );
  }
  
  // Logica dell'API...
}
```

## Componenti Aggiornati

### 1. Checkout Page (`/app/(root)/checkout/page.optimized.tsx`)

- ✅ Usa `useAuth()` hook per verificare autenticazione
- ✅ Reindirizza a `/sign-in?redirect=/checkout` se non autenticato
- ✅ Pre-compila il form con i dati utente
- ✅ Mostra informazioni utente nell'header
- ✅ Loading states per auth check

### 2. Auth Form (`/components/auth-form.tsx`)

- ✅ Usa `useAuth()` hook invece di server actions
- ✅ Gestione redirect tramite query parameter
- ✅ Toast notifications per feedback
- ✅ Error handling centralizzato

### 3. Orders API (`/app/api/orders/route.optimized.ts`)

- ✅ Usa `getCurrentUser()` per verifica auth server-side
- ✅ Validazione utente rigorosa
- ✅ Gestione errori appropriate

## Vantaggi del Sistema Unificato

### 1. **Consistenza**
- Stessa logica auth ovunque
- Types TypeScript uniformi
- Error handling standardizzato

### 2. **Manutenibilità**
- Un singolo punto di configurazione
- Facile aggiornamento e debug
- Codice più pulito e organizzato

### 3. **Performance**
- Session caching automatico
- Minimal re-renders
- Optimized network requests

### 4. **Sicurezza**
- Cookie httpOnly per sicurezza
- CSRF protection integrata
- Session validation automatica

### 5. **Developer Experience**
- IntelliSense completo
- Type safety end-to-end
- Error messages chiari

## Flusso di Autenticazione

### 1. **Login Flow**
1. User compila form login
2. `useAuth().signIn()` chiamato
3. Better-Auth client invia richiesta
4. Server valida credenziali
5. Cookie sessione impostato
6. Hook aggiorna stato reattivo
7. Redirect a pagina desiderata

### 2. **Page Load Flow**
1. App caricata
2. `useAuth()` controlla sessione esistente
3. Better-Auth verifica cookie
4. Stato auth aggiornato
5. Components reagiscono al cambiamento

### 3. **API Request Flow**
1. API route chiamata
2. `getCurrentUser()` verifica sessione
3. Cookie validato con database
4. User object restituito o 401

## Configurazione Ambiente

Assicurati di avere queste variabili nel `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=your_database_url
BETTER_AUTH_SECRET=your_secret_key
```

## Prossimi Passi

1. **Protezione Routes**: Aggiungere middleware per proteggere automaticamente route sensibili
2. **Social Login**: Estendere con provider OAuth (Google, Facebook, etc.)
3. **Role-based Access**: Implementare sistema di ruoli e permissions
4. **Session Management**: Dashboard per gestione sessioni attive
5. **Audit Logging**: Logging delle attività di autenticazione

## Troubleshooting

### Problemi Comuni

1. **"User not authenticated" in checkout**
   - Verifica che Better-Auth sia correttamente configurato
   - Controlla i cookie nel browser
   - Assicurati che il database sia aggiornato

2. **Hook non si aggiorna**
   - Verifica che il componente sia wrappato in `AuthProvider`
   - Controlla le dipendenze degli useEffect

3. **CORS errors**
   - Verifica `NEXT_PUBLIC_APP_URL` in `.env.local`
   - Assicurati che Better-Auth usi lo stesso basePath

Per domande specifiche, controlla i logs in console o apri un issue nel repository.