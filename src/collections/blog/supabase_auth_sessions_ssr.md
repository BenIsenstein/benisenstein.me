---
title: On Server-Side Supabase Auth in the SSR Era
published: true
datePublished: 2025-11-12
dateLastUpdated: 2025-11-12
---

Pasting some thoughts which I shared regarding an issue on the `/supabase/ssr` GitHub repo. The issue is still active, and you can follow the discussion here: [AuthApiError: Invalid Refresh Token: Refresh Token Not Found when refreshing token in middleware](https://github.com/supabase/ssr/issues/68).

Developers building NextJS apps which refresh Supabase Auth sessions on both the server and client are seeing their users logged out seemingly randomly. This is a massive problem that needs to be understood and solved, but I try to explain that it's not random, and that there are some things we can do about it starting now.

It's my feeling that having a deeper understanding of Supabase in general really is our path towards being more robust in our app dev work. Here we go!

## The Issue Beneath The Issue

I first encountered the *"issue beneath the issue"* in the `/supabase/auth-js` repo --- that is, shared state between Supabase `GoTrueClient` instances is no longer just in one browser, it needs to be managed across **networked instances**. The issue there was about the expectation that browser-side `onAuthStateChange()` should listen for **all auth state updates** including on the server, which is not what that function does.

I'm going to explain what that function actually does, and address our new modern issue of syncing auth state across increasingly distributed services that can't always stay subscribed to eachother in a direct "pub-sub" sort of way. The problem at the heart of this is **race conditions emerging** between `GoTrueClient` instances, wherein the client that lost the race to refresh the shared session fails with `Invalid Refresh Token`.

We need to solve the problem of synced session state between server-side and browser-side supabase clients. However, the behaviour of `onAuthStateChange()` is a feature not a bug, and the solution to our problem lies elsewhere in our application architecture.

## onAuthStateChange() is only in the browser, by design

The `GoTrueClient.onAuthStateChange()` function was designed back in the browser-only days of SPAs, to sync **across tabs and windows** that may be running multiple instances of a web app at the same time. If you dig into the source code of the auth client, you'll see that all instances of the client running on the same browser (across tabs and windows) take advantage of the [broadcast channel API](https://developer.mozilla.org/en-US/blog/exploring-the-broadcast-channel-api-for-cross-tab-communication/) and a shared locking mechanism to ensure that when it's time to refresh the session, it takes place **only once, done by a single client instance.** Here is a common `useEffect()` to handle auth state changes in a React SPA:

```ts
useEffect(() => {
  // Fetch logged in user on mount
  supabase.auth.getUser().then(response => {
    setUser(response.data.user)
  })
  
  // Track any changes in local state
  const listener = supabase.auth.onAuthStateChange(async (event, session) => {
    setUser(session?.user || null)
  })

  return () => listener.data.subscription.unsubscribe()
}, [])
```

## How a shared lock prevents race conditions

Almost every function call that goes to the GoTrue server needs to acquire the lock first. Let's take this example of the `GoTrueClient.getUser()` method:

```ts
// getUser()

const result = await this._acquireLock(-1, async () => {
      return await this._getUser()
})
```

So, in the browser-only paradigm of SPAs in early 2020s, the session refresh happens in the context that this client is the only one manipulating auth state for our current user, and **we can be sure of that because of the locking across all tabs and windows.**

`getUser()` actually makes a network call every time, it never pulls the user from the local storage interface like it does with `getSession()`. So in order to fetch the user, the function closure needs to make sure it sends a non-expired access token, and to do that, `getUser()` calls an internal method `_getUser()`, which itself uses a `_useSession()` wrapper that makes a non-expired access token available:

```ts
// _getUser()

return await this._useSession(async (result) => {
        const { data, error } = result
        if (error) {
          throw error
        }

        // returns an error if there is no access_token or custom authorization header
        if (!data.session?.access_token && !this.hasCustomAuthorizationHeader) {
          return { data: { user: null }, error: new AuthSessionMissingError() }
        }

        return await _request(this.fetch, 'GET', `${this.url}/user`, {
          headers: this.headers,
          jwt: data.session?.access_token ?? undefined,
          xform: _userResponse,
        })
})
```

What does the `_useSession()` higher-order function wrapper do you ask? We can infer from context that it takes the passed callback function, and makes sure it has access to an up-to-date access token before calling it. But the details are so important to understand that I'm going to paste the function here with some less important parts edited out:


```ts
// _useSession() and __loadSession()

/**
   * Use instead of getSession() inside the library. It is
   * semantically usually what you want, as getting a session involves some
   * processing afterwards that requires only one client operating on the
   * session at once across multiple tabs or processes.
   */
  private async _useSession<R>(fn): Promise<R> {
    try {
      const result = await this.__loadSession()

      return await fn(result)
    } finally {
      this._debug('#_useSession', 'end')
    }
  }

  /**
   * NEVER USE DIRECTLY!
   *
   * Always use useSession().
   */
  private async __loadSession(): Promise<{data: {session: Session}, error: null}> {
    try {
      let currentSession: Session | null = null

      // try to get session information in the default place it should be, almost always from browser cookies API
      currentSession = await getItemAsync(this.storage, this.storageKey)

      if (!currentSession) {
        return { data: { session: null }, error: null }
      }

      // A session is considered expired before the access token _actually_
      // expires. When the autoRefreshToken option is off (or when the tab is
      // in the background), very eager users of getSession() -- like
      // realtime-js -- might send a valid JWT which will expire by the time it
      // reaches the server.
      const hasExpired = currentSession.expires_at
        ? currentSession.expires_at * 1000 - Date.now() < EXPIRY_MARGIN_MS
        : false

      if (!hasExpired) {
        return { data: { session: currentSession }, error: null }
      }

      const { session, error } = await this._callRefreshToken(currentSession.refresh_token)
      if (error) {
        return { data: { session: null }, error }
      }

      return { data: { session }, error: null }
    } finally {
      this._debug('#__loadSession()', 'end')
    }
  }
```

 We see close to the bottom that it's here, in the context of `_acquireLock()`, then inside `_useSession()`, the client notices that the session is expired (or about to expire), and calls `this._callRefreshToken(currentSession.refresh_token)`. All function calls to `getUser()`, `signIn()` etc. by other client instances in other tabs and windows **must wait for that lock to become released** and wait their turn until the new refresh/access tokens are made available. Once the session is refreshed, the lock is released and an event is broadcasted over the channel, at which point the other consuming clients execute their `onAuthStateChange()` callbacks. 

Here's the gist of `_callRefreshToken()`:
```ts
// _callRefreshToken()

     const { data, error } = await this._refreshAccessToken(refreshToken)
      if (error) throw error
      if (!data.session) throw new AuthSessionMissingError()

      await this._saveSession(data.session)
      await this._notifyAllSubscribers('TOKEN_REFRESHED', data.session)
```
It's essential to understand that the key to this method working so well in SPAs is **every consuming client is connected over a secure communication method,** the `BroadcastChannel`, which makes the new session **available instantly**.

## The challenge of syncing auth session state across varied consumers

Great, now we understand how the supabase engineers tackled this thorny problem in browser-only bygone eras. The thing is, in a distributed system that's instantiating clients in multiple places at once (browser, NextJS server, edge functions, cron jobs, etc), broadcasting these stateful updates to all clients becomes impossible.

Example: I have a supabase client running inside an edge function and it determines that it's time to refresh the session. It'll receive that new session and finish the work it's doing, but it has no way to share that new session info with my web app in the browser, which is now expired and failing. 😢

This is just a reality of distributed systems; in absence of a shared lock, multiple clients try and refresh the session at the same time. One will win, get a valid new session, and the other one will fail with `AuthApiError: Invalid Refresh Token: Refresh Token Not Found`. 

## Looking ahead to solutions

Before we get to handling the `Invalid Refresh Token` nightmare, let's fix the basic issue and keep the browser context synced after server-side `signIn()` and `signOut()`.

In your server actions for auth (I call them `signIn()` and `signOut()`), add a query param of `?refresh_browser_auth` to the url you redirect to on completion:

```ts
// "/app/auth/actions.ts"

export async function signIn(currentState: { message: string }, formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { message: error.message }
    }

    revalidatePath('/', 'layout')
    redirect("/?refresh_browser_auth")
}


export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut({ scope: "local" })

    redirect("/?refresh_browser_auth")
}
```

Take the following example `useEffect()` that handles the query param. It's rendered as its own component to be able to compose inside a shared `<Suspense>` boundary alongside other utilites:

```ts
// /components/UrlAuthSync.tsx

"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useAppContext } from "@/lib/contexts/appContext"

export default function UrlAuthSync() {
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { supabase, mergeState } = useAppContext()

    useEffect(() => {
        if (searchParams.has("refresh_browser_auth")) {
            supabase.auth.getSession().then(response => {
                router.replace(pathname)
                mergeState({ user: response.data.session?.user || null })
            })
        }
    }, [pathname, searchParams, router, mergeState, supabase.auth])

    return <></>
}
```

Imported and rendered in root layout:

```ts
// /app/layout.tsx

import UrlAuthSync from "@/components/UrlAuthSync"
// ...other imports and logic

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppContextProvider>
          {children}
          <Suspense>
            <UrlToast />
            <UrlAuthSync />
            <Toaster />
          </Suspense>
        </AppContextProvider>
      </body>
    </html>
  );
}
```

And that takes care of that. A flag in the url to tell the browser context that it needs to refresh in these specific scenarios.
 
Note I'm using `getSession()` in this case, which is often discouraged by the supabase docs because it can return a stale session directly out of local storage. But in this case, directly after a user signin or signout, **it'll be up-to-date for sure** so a request to the auth server is unnecessary.

Back to the `Invalid Refresh Token` nightmare --- What to do about this problem? It seems the supabase team is still figuring this out. I have some ideas:

### 1. Treat the browser cookie jar as the single point of recovery

There are many scenarios that could lead to a supabase client instance being in the `Invalid Refresh Token` nightmare. Here are some common ones I can think of that might make this a bit more clear:

- A server-side client is executing middleware and tries to refresh its session. It lost a race with a browser-side client that refreshed at the exact same moment, and it doesn't have access to the new session
- A browser-side client fires off a `useQuery()` to supabase and tries to refresh its session. It lost a race with a server-side client that refreshed at the exact same moment, and it doesn't have access to the new session
- A client in an Edge Function tried to refresh its expired session during a long-running background job, only to find that another client used up the shared refresh token in the meantime, and it doesn't have access to the new session

In all of these cases, the problem is that there is no shared lock and no shared `BroadcastChannel`. The client's refresh token is completely useless (it can only be exchanged for a new session once, by design) and there is no easy instant access to the new session.

How a supabase client instance ends up in this disaster **doesn't matter.** What we need to do is **write retry logic** that looks to the browser cookie jar then **tries again with the up-to-date session.**

In all cases --- during the rendering of RSC pages or components, during middleware, during API routes, during server actions, during a browser `useQuery`, or some Edge Function in a faraway land --- **an error message has to make its way back to the calling function in the browser.** There, we can wait until the new session has made its way into the browser cookies, and retry that page navigation or API call.

In order for this strategy to work, we have to trust that **every new session will be stored in browser cookies,** which takes me to my second recommendation:

### 2. Only refresh an auth session if you can set browser cookies

If you refresh an auth session, you have to make sure that new session makes it to the browser cookie jar somehow. This is already done by the server-side client via `Set-Cookie` headers, and by the browser-side client during `_useSession()` as shown by the code snippet I pasted directly out of the `GoTrueClient` source code.

The more open-ended question is how you want other contexts to behave. You might take a simple approach to Edge Functions and opt to **never refresh an auth session inside an Edge Function.** If the session is expired, it has to fail and communicate why it failed in its response, so your web app can retry with the new session. To implement this simple strategy, create new client instances in your Edge Functions with the following option:

```ts
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false
        }
    }
)
```

I suppose you could refresh auth sessions in Edge Functions **if you passed the new session all the way back up to the browser** via `Set-Cookie` headers. This might be simple enough if the Edge Function was called directly from the browser, but it would require writing the headers several times if the Edge Function was called from your server; the cookies would need to be set first in the response to the calling _server component, action or API route,_ then set again by the server in its _response to the browser._ Whether that's a fruitful or worthwhile path to explore, I'm not so sure right now.

### 3. Lean towards using the "local" scope when signing users out

If your users have multiple sessions at once across their devices, or even in automation contexts, they probably expect to log out from one session and expect the rest to continue working. The default behaviour when running `supabase.auth.signOut()` however is to revoke all sessions for that user. We can change this to only revoke the one session, thus preventing undue `Invalid Refresh Token` nightmares, with a simple option passed to the sign out call:

```ts
await supabase.auth.signOut({ scope: "local" })
```

<br>

Thanks for reading my ted talk. This is an important problem and I hope we can get an agreed-upon solution into official docs. Please connect on LinkedIn, GitHub, or get in touch with an email. Peace!



