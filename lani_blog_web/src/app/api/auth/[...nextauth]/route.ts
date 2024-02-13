import { toSession, toToken } from "@/models/accounts";
import { LoginResponse } from "@/models/accounts/types";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import axios from "axios";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const signIn = async (params: { email: string; password: string }) => {
  const { email, password } = params;
  try {
    const response = await axios.post(
      `${process.env.API_URL}/api/v1/auth/authenticate`,
      {
        email: email,
        password: password,
      }
    );
    const responseData = response.data;

    return responseData;
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      console.log(error.response.statusText);
    }
    return null;
  }
};

const refreshToken = async (params: { token: string }) => {
  const { token } = params;
  const response = await axios.post(
    `${process.env.API_URL}/api/v1/auth/refresh-token`,
    {},
    { headers: { Authorization: token } }
  );

  return response.data;
};

const handler = NextAuth({
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials || !credentials?.username || !credentials?.password) {
          return null;
        }
        const user = await signIn({
          email: credentials?.username,
          password: credentials?.password,
        });
        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (user) {
        // console.log(user);
        return toToken(user);
      }
      // console.log(token)
      if (new Date() < new Date(token.expiredAt)) {
        return token;
      }
      // return await refreshToken(token);

      try {
        const response = await refreshToken({
          token: token.refreshToken,
        });

        return toToken(response);
      } catch (error) {
        return {
          ...token,
          error: "RefreshAccessTokenError" as const,
        };
      }
    },
    async session({ session, token }) {
      // console.log(token);
      return toSession(token, session);
    },
  },
});

export { handler as GET, handler as POST };
