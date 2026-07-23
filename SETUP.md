# Cómo poner en marcha Carta Sorpresa

Ya está todo el código escrito. Lo que falta son las cuentas gratuitas de los
servicios que usa la app, y pegarme (o pegar tú mismo) las claves en un
archivo `.env.local`. Ninguna de estas cuentas las puedo crear yo por ti —
solo tú puedes aceptar sus términos y verificar tu identidad/correo.

## 1. Supabase (base de datos + login + fotos) — obligatorio para probar algo

1. Ve a https://supabase.com y crea una cuenta gratis.
2. "New project" → ponle un nombre (ej. "carta-sorpresa") y una contraseña de
   base de datos (guárdala, no la necesitarás casi nunca pero por si acaso).
3. Cuando el proyecto termine de crearse, ve a **SQL Editor** → **New query**,
   abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este
   proyecto, copia TODO su contenido, pégalo ahí y dale **Run**. Esto crea las
   tablas, los permisos de seguridad y el espacio para las fotos.
4. Ve a **Project Settings → API** y copia:
   - **Project URL** → pégalo en `.env.local` como `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → como `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** (dice "secret", no la compartas nunca) → como
     `SUPABASE_SERVICE_ROLE_KEY`

### Activar "Continuar con Google" (opcional pero lo pediste)

1. En Supabase: **Authentication → Providers → Google** → actívalo.
2. Te va a pedir un "Client ID" y "Client Secret" de Google. Se crean en
   https://console.cloud.google.com/apis/credentials (gratis):
   - Crea un proyecto nuevo (o usa uno existente).
   - "Create Credentials" → "OAuth client ID" → tipo "Web application".
   - En "Authorized redirect URIs" pega la URL que te muestra la pantalla de
     Supabase (termina en `.../auth/v1/callback`).
   - Copia el Client ID y Client Secret que te da Google y pégalos en la
     pantalla de Supabase.

Si no quieres hacer esto ahora, no pasa nada: el login con correo y
contraseña funciona sin esto.

## 2. Archivo `.env.local`

En la raíz del proyecto ya existe un archivo `.env.local.example`. Cópialo y
complétalo:

```bash
cp .env.local.example .env.local
```

Y llena los valores de Supabase (paso anterior). Los de Stripe puedes
dejarlos vacíos por ahora si solo quieres probar el login y la creación de
cartas — solo se usan cuando alguien llega al límite de 5 cartas gratis.

## 3. Probarlo en tu computadora

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — deberías poder crear una cuenta, iniciar
sesión, crear una carta con fotos y colores, y recibir un link como
`http://localhost:3000/c/xxxxxxxx`.

## 4. Stripe (para cobrar después de las 5 cartas gratis) — opcional al inicio

1. Crea cuenta gratis en https://stripe.com (no cobra nada hasta que
   proceses pagos reales; puedes probar todo en "modo de prueba").
2. **Product catalog → Add product**: crea un producto, ej. "Cartas
   ilimitadas", con un precio único (el que tú decidas). Copia el **Price
   ID** (empieza con `price_...`) → va en `STRIPE_UNLOCK_PRICE_ID`.
3. **Developers → API keys**: copia la "Publishable key" y la "Secret key" →
   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` y `STRIPE_SECRET_KEY`.
4. **Developers → Webhooks → Add endpoint**: apunta a
   `https://TU-DOMINIO/api/stripe-webhook` (solo funciona con el sitio ya
   publicado, no en localhost salvo que uses `stripe listen`). Marca el
   evento `checkout.session.completed`. Copia el "Signing secret" →
   `STRIPE_WEBHOOK_SECRET`.

## 5. Publicar el sitio en Netlify

1. Sube este proyecto a un repositorio de GitHub (puedo ayudarte con esto
   cuando quieras).
2. En Netlify: **Add new site → Import from Git** → elige el repositorio.
   Netlify detecta Next.js automáticamente.
3. En **Site settings → Environment variables**, agrega TODAS las variables
   que pusiste en `.env.local` (con los valores reales, no los de prueba), y
   cambia `NEXT_PUBLIC_SITE_URL` por la URL real de tu sitio en Netlify.
4. Deploy. Cuando esté listo, actualiza la URL de redirect autorizada en
   Supabase (**Authentication → URL Configuration**) para que incluya tu
   dominio real de Netlify.

## 6. Google AdSense (anuncios) — al final

AdSense exige que el sitio ya esté publicado y con contenido real antes de
aprobarlo, así que esto se deja para el final. Cuando el sitio esté en línea:

1. Crea cuenta en https://adsense.google.com y agrega tu sitio.
2. Espera la aprobación (puede tardar días).
3. Cuando te den tu código de anuncios, avísame y reemplazo el componente
   `components/AdBanner.tsx` (que ahora es solo un espacio reservado) por el
   código real.

---

**Resumen de lo que necesito que me pases (o que pongas tú mismo en
`.env.local` / Netlify):** Project URL y claves de Supabase, y —cuando
quieras activar cobros— las claves de Stripe. Nada de esto son contraseñas
tuyas, son claves de configuración del proyecto.
