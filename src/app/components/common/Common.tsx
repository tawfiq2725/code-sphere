import { showToast } from "@/utils/toastUtil";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { backendUrl } from "@/utils/backendUrl";
import { auth } from "@/utils/config/firebase";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/slice/authSlice";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

export const SignIn = () => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleGoogleLogin = async () => {
    try {
      const provide = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provide);
      const idToken = await result.user.getIdToken();
      console.log(result);
      const res = await fetch(`${backendUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (data.data.newUser) {
        localStorage.setItem("UserId", data.data.userId);
        router.push(`/auth/role-page`);
      } else {
        const { role, jwt_token: token, message } = data.data;
        dispatch(loginSuccess({ token, role }));
        showToast(message, "success");
        switch (role) {
          case "student":
            router.push("/student");
            break;
          case "admin":
            router.push("/admin/dashboard");
            break;
          case "tutor":
            router.push("/tutor/dashboard");
            break;
          default:
            showToast("Unknown user role. Please contact support.", "error");
        }
      }
    } catch (error: any) {
      console.log("Google Sign-In error:", error);
    }
  };
  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleGoogleLogin}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-700"
          } text-white rounded-md border border-zinc-700 transition-colors`}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {isLoading ? "Signing in..." : "Google"}
        </button>
      </div>
    </>
  );
};

// // claude
// import { showToast } from "@/utils/toastUtil";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { backendUrl } from "@/utils/backendUrl";
// import { auth } from "@/utils/config/firebase";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "@/store/slice/authSlice";
// import {
//   signInWithPopup,
//   signInWithRedirect,
//   GoogleAuthProvider,
//   getRedirectResult,
// } from "firebase/auth";

// export const SignIn = () => {
//   const dispatch = useDispatch();
//   const [isLoading, setIsLoading] = useState(false);
//   const [isRedirectChecking, setIsRedirectChecking] = useState(true);
//   const router = useRouter();

//   // Handle the authentication response
//   const handleAuthResponse = async (result: any) => {
//     try {
//       console.log("Handling auth response", result);

//       if (!result || !result.user) {
//         console.error("No result or user found in auth response");
//         showToast("Authentication failed - No user data", "error");
//         return;
//       }

//       const idToken = await result.user.getIdToken();
//       console.log("Got ID token, making backend request");

//       const response = await fetch(`${backendUrl}/api/auth/google`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ idToken }),
//         credentials: "include", // Add this to handle cookies if your backend uses them
//       });

//       if (!response.ok) {
//         throw new Error(`Backend response not ok: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Backend response:", data);

//       if (data.data.newUser) {
//         console.log("New user detected, redirecting to role page");
//         localStorage.setItem("UserId", data.data.userId);
//         router.push(`/auth/role-page`);
//       } else {
//         const { role, jwt_token: token, message } = data.data;
//         console.log("Existing user, role:", role);

//         // Store the token in localStorage
//         localStorage.setItem("jwt_token", token);

//         dispatch(loginSuccess({ token, role }));
//         showToast(message, "success");

//         let redirectPath = "";
//         switch (role) {
//           case "student":
//             redirectPath = "/student";
//             break;
//           case "admin":
//             redirectPath = "/admin/dashboard";
//             break;
//           case "tutor":
//             redirectPath = "/tutor/dashboard";
//             break;
//           default:
//             showToast("Unknown user role. Please contact support.", "error");
//             return;
//         }

//         console.log("Redirecting to:", redirectPath);
//         router.push(redirectPath);
//       }
//     } catch (error: any) {
//       console.error("Error in handleAuthResponse:", error);
//       showToast("Failed to process login. Please try again.", "error");
//       throw error; // Re-throw to be caught by the calling function
//     }
//   };

//   // Check for redirect result on component mount
//   useEffect(() => {
//     const checkRedirectResult = async () => {
//       try {
//         console.log("Checking redirect result...");
//         const result = await getRedirectResult(auth);

//         if (result) {
//           console.log("Redirect result found");
//           setIsLoading(true);
//           await handleAuthResponse(result);
//         } else {
//           console.log("No redirect result found");
//         }
//       } catch (error: any) {
//         console.error("Error checking redirect result:", error);
//         showToast("Authentication failed. Please try again.", "error");
//       } finally {
//         setIsRedirectChecking(false);
//         setIsLoading(false);
//       }
//     };

//     checkRedirectResult();
//   }, []);

//   const handleGoogleSignIn = async () => {
//     if (isLoading || isRedirectChecking) {
//       console.log("Already processing auth, skipping");
//       return;
//     }

//     setIsLoading(true);
//     const provider = new GoogleAuthProvider();
//     provider.setCustomParameters({
//       prompt: "select_account", // Force account selection
//     });

//     try {
//       console.log("Attempting sign in with popup...");
//       const result = await signInWithPopup(auth, provider);
//       await handleAuthResponse(result);
//     } catch (error: any) {
//       console.error("Popup sign-in error:", error);

//       // If popup fails, try redirect
//       if (
//         error.code === "auth/popup-closed-by-user" ||
//         error.code === "auth/popup-blocked" ||
//         error.code === "auth/cancelled-popup-request"
//       ) {
//         console.log("Popup failed, attempting redirect sign-in...");
//         showToast("Redirecting to Google sign-in...", "info");
//         try {
//           await signInWithRedirect(auth, provider);
//           // The redirect result will be handled by the useEffect
//         } catch (redirectError: any) {
//           console.error("Redirect sign-in error:", redirectError);
//           showToast("Failed to start sign-in. Please try again.", "error");
//         }
//       } else {
//         showToast("Sign-in failed. Please try again.", "error");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isRedirectChecking) {
//     return <div>Checking authentication status...</div>;
//   }

//   return (
//     <div className="space-y-3">
//       <button
//         type="button"
//         disabled={isLoading}
//         onClick={handleGoogleSignIn}
//         className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 ${
//           isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-700"
//         } text-white rounded-md border border-zinc-700 transition-colors`}
//       >
//         <svg className="h-5 w-5" viewBox="0 0 24 24">
//           <path
//             d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//             fill="#4285F4"
//           />
//           <path
//             d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//             fill="#34A853"
//           />
//           <path
//             d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//             fill="#FBBC05"
//           />
//           <path
//             d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//             fill="#EA4335"
//           />
//         </svg>
//         {isLoading ? "Signing in..." : "Google"}
//       </button>
//     </div>
//   );
// };

// "use client";
// import { showToast } from "@/utils/toastUtil";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { backendUrl } from "@/utils/backendUrl";
// import { auth } from "@/utils/config/firebase";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "@/store/slice/authSlice";
// import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// export default function Common() {
//   const dispatch = useDispatch();
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const handleGoogleSignIn = async () => {
//     try {
//       const provide = new GoogleAuthProvider();
//       const result = await signInWithPopup(auth, provide);
//       console.log("workingggggggggggggggggggggggggggggggg");
//       const idToken = await result.user.getIdToken();
//       console.log(idToken);

//       const response = await fetch(`${backendUrl}/api/auth/google`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ idToken }),
//       });
//       const data = await response.json();
//       console.log(data.data);
//       if (data.data.newUser) {
//         localStorage.setItem("UserId", data.data.userId);
//         router.push(`/auth/role-page`);
//       } else {
//         const { role, jwt_token: token, message } = data.data;
//         dispatch(loginSuccess({ token, role }));

//         showToast(message, "success");

//         if (role === "student") router.push("/student");
//         else if (role === "admin") router.push("/admin/dashboard");
//         else if (role === "tutor") router.push("/tutor/dashboard");
//         else showToast("Unknown user role. Please contact support.", "error");
//       }
//     } catch (error: any) {
//       if (error.code === "auth/popup-closed-by-user") {
//         showToast(
//           "Popup was closed before sign-in could complete. Please try again.",
//           "error"
//         );
//         console.log("Popup was closed before sign-in could complete.", error);
//       } else {
//         console.error("Google Sign-In error:", error);
//         showToast("Google Sign-In failed", "error");
//       }
//     }
//   };

//   return (
//     <>
//       {/* Social Buttons */}
//       <div className="space-y-3">
//         <button
//           type="button"
//           disabled={isLoading}
//           onClick={handleGoogleSignIn}
//           className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 ${
//             isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-700"
//           } text-white rounded-md border border-zinc-700 transition-colors`}
//         >
//           <svg className="h-5 w-5" viewBox="0 0 24 24">
//             <path
//               d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//               fill="#4285F4"
//             />
//             <path
//               d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//               fill="#34A853"
//             />
//             <path
//               d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//               fill="#FBBC05"
//             />
//             <path
//               d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//               fill="#EA4335"
//             />
//           </svg>

//           {isLoading ? "Signing in..." : "Google"}
//         </button>
//       </div>
//     </>
//   );
// }

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { backendUrl } from "@/utils/backendUrl";
// import { auth } from "@/utils/config/firebase";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "@/store/slice/authSlice";
// import {
//   GoogleAuthProvider,
//   signInWithRedirect,
//   getRedirectResult,
//   signInWithPopup,
// } from "firebase/auth";
// import { showToast } from "@/utils/toastUtil";

// export default function Common() {
//   const dispatch = useDispatch();
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const handleRedirectResult = async () => {
//       setIsLoading(true);
//       try {
//         const result = await getRedirectResult(auth);
//         if (result) {
//           const idToken = await result.user.getIdToken();

//           const response = await fetch(`${backendUrl}/api/auth/google`, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ idToken }),
//           });

//           const data = await response.json();

//           if (data.data.newUser) {
//             localStorage.setItem("UserId", data.data.userId);
//             router.push(`/auth/role-page`);
//           } else {
//             const { role, jwt_token: token, message } = data.data;
//             dispatch(loginSuccess({ token, role }));

//             showToast(message, "success");
//             switch (role) {
//               case "student":
//                 router.push("/student");
//                 break;
//               case "admin":
//                 router.push("/admin/dashboard");
//                 break;
//               case "tutor":
//                 router.push("/tutor/dashboard");
//                 break;
//               default:
//                 showToast(
//                   "Unknown user role. Please contact support.",
//                   "error"
//                 );
//             }
//           }
//         }
//       } catch (error: any) {
//         console.error("Google Sign-In error:", error);
//         showToast("Google Sign-In failed. Please try again later.", "error");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     handleRedirectResult();
//   }, [dispatch, router]);

//   const handleGoogleSignIn = () => {
//     const provider = new GoogleAuthProvider();
//     signInWithRedirect(auth, provider);
//   };

//   return (
//     <div className="space-y-3">
//       <button
//         type="button"
//         disabled={isLoading}
//         onClick={handleGoogleSignIn}
//         className={`w-full flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 ${
//           isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-700"
//         } text-white rounded-md border border-zinc-700 transition-colors`}
//       >
//         <svg className="h-5 w-5" viewBox="0 0 24 24">
//           <path
//             d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
//             fill="#4285F4"
//           />
//           <path
//             d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
//             fill="#34A853"
//           />
//           <path
//             d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
//             fill="#FBBC05"
//           />
//           <path
//             d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
//             fill="#EA4335"
//           />
//         </svg>
//         {isLoading ? "Signing in..." : "Google"}
//       </button>
//     </div>
//   );
// }
