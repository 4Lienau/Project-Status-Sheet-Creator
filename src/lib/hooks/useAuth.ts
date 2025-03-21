import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import type { User } from "@supabase/supabase-js";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export interface UserProfile {
  id: string;
  full_name: string | null;
  department: string | null;
  email: string | null;
  is_approved?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load user profile when user changes
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setProfile(null);
        setIsApproved(null);
        setIsPendingApproval(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, department, email, is_approved")
        .eq("id", user.id)
        .single();

      setProfile(data);

      // Check if user is approved
      if (data) {
        // If is_approved is explicitly set to false, user is rejected
        if (data.is_approved === false) {
          setIsApproved(false);
          setIsPendingApproval(false);
          // Sign out rejected users
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Your account has been rejected by an administrator.",
            variant: "destructive",
          });
          navigate("/login");
          return;
        }

        // If is_approved is true, user is approved
        if (data.is_approved === true) {
          setIsApproved(true);
          setIsPendingApproval(false);
          return;
        }

        // If is_approved is null, check pending_users table
        const { data: pendingData } = await supabase
          .from("pending_users")
          .select("status")
          .eq("id", user.id)
          .single();

        if (pendingData) {
          if (pendingData.status === "pending") {
            setIsApproved(false);
            setIsPendingApproval(true);
            // Sign out pending users
            await supabase.auth.signOut();
            toast({
              title: "Account Pending Approval",
              description:
                "Your account is pending administrator approval. You'll be notified when your account is approved.",
              duration: 6000,
            });
            navigate("/login");
            return;
          } else if (pendingData.status === "approved") {
            setIsApproved(true);
            setIsPendingApproval(false);
            // Update profile to mark as approved
            await supabase
              .from("profiles")
              .update({ is_approved: true })
              .eq("id", user.id);
            return;
          } else if (pendingData.status === "rejected") {
            setIsApproved(false);
            setIsPendingApproval(false);
            // Update profile to mark as rejected
            await supabase
              .from("profiles")
              .update({ is_approved: false })
              .eq("id", user.id);
            // Sign out rejected users
            await supabase.auth.signOut();
            toast({
              title: "Access Denied",
              description:
                "Your account has been rejected by an administrator.",
              variant: "destructive",
            });
            navigate("/login");
            return;
          }
        }

        // If no pending record and is_approved is null, assume this is an existing user (grandfathered in)
        // or a new user that hasn't been processed yet
        setIsApproved(true);
        setIsPendingApproval(false);
      }
    };

    loadProfile();
  }, [user, toast, navigate]);

  return { user, profile, loading, isApproved, isPendingApproval };
};
