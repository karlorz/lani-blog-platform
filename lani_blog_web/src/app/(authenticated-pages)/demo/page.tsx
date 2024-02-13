"use client";

import PostForm from "@/app/components/PostForm";
import ErrorMessage from "@/app/components/atoms/ErrorMessage";
import Loading from "@/app/components/atoms/Loading";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useQuery } from "react-query";
import axios from "../../axios";

const Demo: React.FC = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;
  // console.log(accessToken);
  const queryMyPosts = (accessToken?: string) => async () => {
    const response = await axios.get("/api/v1/demo-controller", {
      responseType: "json",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  };
  const useQueryMyPosts = () => {
    // const { data: session } = useSession();
    // const accessToken = session?.accessToken;

    return useQuery(["QUERY_DEMO"], queryMyPosts(accessToken), {
      enabled: !!accessToken,
    });
  };

  const { data: posts, isLoading, isError } = useQueryMyPosts();

  if (isLoading)
    return (
      <div className="my-24">
        <Loading />
      </div>
    );

  if (isError) return <ErrorMessage />;

  return <>{posts}</>;
};
export default Demo;
