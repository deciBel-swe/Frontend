/**
 * Custom Hooks Barrel Export
 */

/**
 * useDebounce — debounces a value by the given delay (default 500 ms).
 * Useful for deferring search queries and API calls until the user stops typing.
 *
 * @example
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search API call
 *     }
 *   }, [debouncedSearchTerm]);
 */
export { useDebounce } from './useDebounce';

/**
 * useTheme — re-exported from next-themes.
 * Provides `theme`, `setTheme`, `resolvedTheme`, and `systemTheme`.
 *
 * Must be used inside a component rendered under <ThemeProvider>.
 *
 * @example
 *   const { theme, setTheme } = useTheme();
 *   <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
 *     Toggle
 *   </button>
 */
export { useTheme } from 'next-themes';

/**
 * useAuth — access authentication state from any component.
 * Returns `{ user, isAuthenticated, isLoading, login, logout }`.
 * Must be used inside `<AuthProvider>`.
 */
export { useAuth } from '@/features/auth';

/**
 * useRedirectAfterLogin — redirects the user after a successful login.
 *
 * Reads the `?redirect=` query parameter set by middleware when an
 * unauthenticated user attempts to visit a protected route. On mount,
 * and whenever `isAuthenticated` becomes `true`, the user is sent to
 * that destination (or `/feed` if no redirect param is present).
 *
 * Place this hook at the top of the sign-in page. The page itself does
 * not need to know anything about routing — just call `login()` and this
 * hook handles navigation for every auth path (form submit, OAuth, or
 * an already-authenticated user who lands on /signin directly).
 *
 * Must be used inside `<AuthProvider>`.
 *
 * @example
 *   export default function SignInPage() {
 *     useRedirectAfterLogin();
 *     const { login } = useAuth();
 *     // render form, call login() on submit
 *   }
 */
export { useRedirectAfterLogin } from './useRedirectAfterLogin';

/**
 * useSignInSubmit — encapsulates sign-in submit flow
 * (schema validation, reCAPTCHA verification, and login call).
 */
export { useSignInSubmit } from '../features/auth/useSignInSubmit';

/**
 * useRegistrationSubmit — encapsulates registration submit flow
 * (schema validation, reCAPTCHA verification, and registration handoff).
 */
export { useRegistrationSubmit } from '../features/auth/useRegistrationSubmit';

/**
 * useAPI — imperative access to the centralized axios + Zod request pipeline.
 *
 * Returns `{ request, client }` for one-off controlled calls.
 */
export { useAPI } from './useAPI';

/**
 * useApiQuery — generic query template that validates DTOs and fetches via
 * the shared axios client.
 */
export { useApiQuery } from './useAPI';

/**
 * useApiMutation — generic mutation template that validates DTOs and sends
 * writes through the shared axios client.
 */
export { useApiMutation } from './useAPI';

/**
 * useUserTracks — lightweight user-tracks query hook.
 */
export { useUserTracks } from './useUserTracks';

// Additional hooks will be exported here as they are created
// export { usePlayer } from './usePlayer';
// export { useIntersectionObserver } from './useIntersectionObserver';

/**
 * useGetCountry — queries country options by user input.
 */
export { useGetCountry } from './useGetCountry';

export { useEditMe } from '@/features/prof/hooks/useEditMe';
export { useUserMe } from '@/features/prof/hooks/useUserMe';
export { usePublicUser } from '@/features/prof/hooks/usePublicUser';
export {
  useMarkAllAsRead,
  useNotificationSettings,
  useNotifications,
  useRegisterDeviceToken,
  useUnreadCount,
  useUpdateNotificationSettings,
} from '@/features/notif/hooks';

/**
 * useTrackPage — loads and manages track page state from the service layer.
 */
export { useTrackPage } from './useTrackPage';

/**
 * useTrackCard — manages engagement interactions for track cards.
 */
export { useTrackCard } from './useTrackCard';

/**
 * useUserRepostPage — loads reposted tracks and playlists for the current user profile page.
 */
export { useUserRepostPage } from './useUserRepostPage';

/**
 * useFollowers / useFollowing — loads social user lists for profile pages.
 */
export { useFollowers } from './useFollowers';
export { useFollowing } from './useFollowing';

/**
 * useUserCardHook — hydrates user cards and handles follow actions.
 */
export { useUserCardHook } from './useUserCardHook';

/**
 * useLikedTracks — loads liked tracks for profile likes page.
 */
export { useLikedTracks } from './useLikedTracks';

/**
 * useSuggestedUsers — loads people suggestions (/users/suggested).
 */
export { useSuggestedUsers } from './useSuggestedUsers';

/**
 * useBlockedUsers — loads blocked users and exposes unblock action.
 */
export { useBlockedUsers } from './useBlockedUsers';

/**
 * useListeningHistoryTracks — loads listening history as TrackList items.
 */
export { useListeningHistoryTracks } from './useListeningHistoryTracks';
export { useTrackLayoutPreference } from './useTrackLayoutPreference';

/**
 * Sidebar composition hooks.
 */
export { useFeedSidebar } from './useFeedSidebar';
export { useProfileSidebar } from './useProfileSidebar';
export { useTrendingTracks } from './useTrendingTracks';
